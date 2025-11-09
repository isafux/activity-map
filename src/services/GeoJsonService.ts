import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import L from 'leaflet';
import { GuardService } from './GuardService';
import { StyleService } from './StyleService';
import type { MarkerData } from '../types/Marker';

/**
 * Refactor to composable
 */
class GeoJsonService {
  /**
   * Load all GeoJSON files declared in a given manifest file
   *
   * @param [folderPath='/geojson'] - The folder holding the GeoJSON files and the manifest file
   * @param [manifestFile='geojson-list.json'] - The manifest filename incl. extension
   * @returns All GeoJSON files as an array of
   */
  public async loadAllGeoJSONs(
    folderPath: string = '/geojson',
    manifestFile: string = 'geojson-list.json',
  ): Promise<FeatureCollection[]> {
    const manifest: Response = await fetch(`${folderPath}/${manifestFile}`);

    if (!manifest.ok) {
      console.error('Failed to load GeoJSON list manifest');
      return [];
    }

    const fileList: unknown = await manifest.json();
    if (!Array.isArray(fileList)) {
      console.error('Manifest format is invalid');
      return [];
    }

    const loadedGeoJSONs: FeatureCollection[] = [];
    for (const file of fileList) {
      if (file && typeof file === 'string') {
        const geoJson = await this.loadGeoJsonFile(folderPath, file);
        if (geoJson) {
          loadedGeoJSONs.push(geoJson);
        }
      }
    }

    return loadedGeoJSONs;
  }

  /**
   * Create markers at activity paths starting points.
   * Bind colors to paths and markers.
   * Determine set of activity types.
   *
   * @param geoJSONs - The activities to loop through
   * @param activityTypes - This set gets updated with all available activity types
   * @returns The generated markers as an array
   */
  public async extractActivityData(
    geoJSONs: FeatureCollection<Geometry, GeoJsonProperties>[],
    activityTypes: Set<string>,
  ): Promise<MarkerData[]> {
    const geoMarkers: MarkerData[] = [];

    geoJSONs.forEach((geoJson) => {
      const color = StyleService.generateRandomColor(40, 60, 0.7);

      if (geoJson.features && geoJson.features.length) {
        const firstFeature = geoJson.features[0];

        if (
          firstFeature &&
          firstFeature.geometry &&
          GuardService.hasCoordinates(firstFeature.geometry)
        ) {
          if (firstFeature.properties) {
            // assign color to feature path as well
            firstFeature.properties.color = color;

            if (activityTypes) {
              // add activity type to the set
              activityTypes.add(firstFeature.properties.type);
            }

            const startPoint = firstFeature.geometry?.coordinates[0];
            if (GuardService.isValidLatLngArray(startPoint)) {
              geoMarkers.push({
                latLng: [startPoint[1], startPoint[0]],
                color: color,
                pathIndex: firstFeature.properties.name,
                activityType: firstFeature.properties.type,
              });
            }
          }
        }
      }
    });

    return geoMarkers;
  }

  public getAllTileURLs() {}

  /**
   * Get a custom marker icon based on the color
   *
   * @param color - The color of the marker
   * @returns The marker icon as a leaflet-div-icon
   */
  public getMarkerIcon(color: string): L.Icon<L.IconOptions> {
    return new L.DivIcon({
      html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%;"></div>`,
      class: 'leaflet-div-icon',
    }) as L.Icon<L.IconOptions>;
  }

  /**
   * Load a single GeoJSON file and validate its structure
   *
   * @param file - The GeoJSON's file
   * @returns The valid GeoJSON or null
   */
  private async loadGeoJsonFile(
    folderPath: string,
    file: string,
  ): Promise<FeatureCollection | null> {
    const filepath = `${folderPath}/${file}`;

    try {
      const file = await fetch(filepath);
      if (!file.ok) {
        throw new Error(`Failed to load ${filepath}`);
      }

      const json: unknown = await file.json();
      if (GuardService.isFeatureCollection(json)) {
        return json;
      } else {
        console.warn(`Invalid GeoJSON format in file: ${filepath}`);

        return null;
      }
    } catch (e) {
      console.error(`Error loading ${filepath}:`, e);

      return null;
    }
  }
}

// Export a singleton instance of the service
export const geoJsonService = new GeoJsonService();

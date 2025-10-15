import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import L from 'leaflet';
import { GuardService } from './GuardService';
import { StyleService } from './StyleService';
import type { MarkerData } from '../types/Marker';

class GeoJsonService {
  public async loadAll(): Promise<FeatureCollection[]> {
    const manifest: Response = await fetch('/geojson/geojson-list.json');

    if (!manifest.ok) {
      console.error('Failed to load GeoJSON list manifest');
      return [];
    }

    const fileList: unknown = await manifest.json();
    if (!Array.isArray(fileList)) {
      console.error('Manifest format is invalid');
      return [];
    }

    const loadedGeoJsons: FeatureCollection[] = [];
    for (const file of fileList) {
      if (file && typeof file === 'string') {
        const geoJson = await this.loadGeoJsonFile(file);
        if (geoJson) {
          loadedGeoJsons.push(geoJson);
        }
      }
    }

    return loadedGeoJsons;
  }

  // Loop through each GeoJSON and create markers at the starting points
  public async getMarkersAndBindColors(
    geoJsons: FeatureCollection<Geometry, GeoJsonProperties>[],
    activityTypes: Set<string>,
  ): Promise<MarkerData[]> {
    const geoMarkers: MarkerData[] = [];

    geoJsons.forEach((geoJson) => {
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
              // extract activity type
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

  // Helper function to get a custom marker icon based on the color
  public getMarkerIcon(color: string) {
    return new L.DivIcon({
      html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%;"></div>`,
      className: 'leaflet-div-icon',
    }) as L.Icon<L.IconOptions>;
  }

  // Load a single GeoJSON file and validate its structure
  private async loadGeoJsonFile(
    fileName: string,
  ): Promise<FeatureCollection | null> {
    try {
      const file = await fetch(`/geojson/${fileName}`);
      if (!file.ok) {
        throw new Error(`Failed to load ${fileName}`);
      }

      const json: unknown = await file.json();

      if (GuardService.isFeatureCollection(json)) {
        return json;
      } else {
        console.warn(`Invalid GeoJSON format in file: ${fileName}`);
        return null;
      }
    } catch (e) {
      // Log the error with more context (fileName) for debugging
      console.error(`Error loading ${fileName}:`, e);
      return null;
    }
  }
}

// Export a singleton instance of the service
export const geoJsonService = new GeoJsonService();

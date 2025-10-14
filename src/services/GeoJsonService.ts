import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import L from 'leaflet';
import { GuardService } from './GuardService';
import { StyleService } from './StyleService';
import type { MarkerData } from '../types/Marker';

class GeoJsonService {
  // Loop through each GeoJSON and create markers at the starting points
  public async loadMarkersAndColors(
    geoJsons: FeatureCollection<Geometry, GeoJsonProperties>[],
  ): Promise<MarkerData[]> {
    const geoMarkers: MarkerData[] = [];

    geoJsons.forEach((geoJson) => {
      const color = StyleService.generateRandomColor(40, 60, 0.7);

      // Check if features exist and have a valid starting point
      if (geoJson.features && geoJson.features.length) {
        const firstFeature = geoJson.features[0];

        if (
          firstFeature &&
          firstFeature.geometry &&
          GuardService.hasCoordinates(firstFeature.geometry)
        ) {
          const startPoint = firstFeature.geometry?.coordinates[0];

          if (firstFeature.properties) {
            firstFeature.properties.color = color;
          }

          // Ensure startPoint exists
          if (GuardService.isValidLatLngArray(startPoint)) {
            // Create a marker at the starting point
            geoMarkers.push({
              latLng: [startPoint[1], startPoint[0]],
              color: color,
              pathIndex: firstFeature.properties?.name, // Optional: Index or name of the path
            });
          }
        }
      }
    });

    return geoMarkers;
  }

  public async loadAll(): Promise<FeatureCollection[]> {
    const res: Response = await fetch('/geojson/geojson-list.json');

    if (!res.ok) {
      console.error('Failed to load GeoJSON list manifest');
      return [];
    }

    const fileList: unknown = await res.json();

    // Validate the structure of the manifest
    if (
      !Array.isArray(fileList) ||
      !fileList.every((f) => typeof f === 'string')
    ) {
      console.error('Manifest format is invalid');
      return [];
    }

    // Load GeoJSON files concurrently
    const loadedGeoJsons: (FeatureCollection | null)[] = await Promise.all(
      fileList.map((file) => this.loadGeoJsonFile(file)),
    );

    // Filter out null values using a type guard
    return loadedGeoJsons.filter((g): g is FeatureCollection => g !== null);
  }

  // Type guard to validate GeoJSON FeatureCollection
  private isFeatureCollection(json: unknown): json is FeatureCollection {
    return (
      typeof json === 'object' &&
      json !== null &&
      (json as { type: string }).type === 'FeatureCollection' &&
      Array.isArray((json as { features: unknown[] }).features)
    );
  }

  // Load a single GeoJSON file and validate its structure
  private async loadGeoJsonFile(
    fileName: string,
  ): Promise<FeatureCollection | null> {
    try {
      const res = await fetch(`/geojson/${fileName}`);
      if (!res.ok) {
        throw new Error(`Failed to load ${fileName}`);
      }

      const json: unknown = await res.json();

      // Use type guard to ensure the correct structure
      if (this.isFeatureCollection(json)) {
        return json; // Returning the valid FeatureCollection
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

  // Helper function to get a custom marker icon based on the color
  public getMarkerIcon(color: string) {
    return new L.DivIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; pointer-events: auto;"></div>`,
      className: 'leaflet-div-icon',
    }) as L.Icon<L.IconOptions>;
  }
}

// Export a singleton instance of the service
export const geoJsonService = new GeoJsonService();

import type { FeatureCollection } from 'geojson';

class GeoJsonService {
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
}

// Export a singleton instance of the service
export const geoJsonService = new GeoJsonService();

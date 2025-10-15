import type {
  FeatureCollection,
  Geometry,
  LineString,
  Point,
  Polygon,
} from 'geojson';

export class GuardService {
  // Type guard for checking if the array contains numbers
  public static isValidLatLngArray(arr: any): arr is [number, number, number?] {
    return (
      Array.isArray(arr) &&
      arr.length === 3 &&
      typeof arr[0] === 'number' &&
      typeof arr[1] === 'number' &&
      !isNaN(arr[0]) &&
      !isNaN(arr[1]) &&
      (typeof arr[2] === 'number' || arr[2] === undefined) // Optional: check the third value
    );
  }

  // Type guard to validate GeoJSON FeatureCollection
  public static isFeatureCollection(json: unknown): json is FeatureCollection {
    return (
      typeof json === 'object' &&
      json !== null &&
      (json as { type: string }).type === 'FeatureCollection' &&
      Array.isArray((json as { features: unknown[] }).features)
    );
  }

  // Check if the geometry is of a type that has coordinates
  public static hasCoordinates(
    geometry: Geometry,
  ): geometry is Point | LineString | Polygon {
    return 'coordinates' in geometry;
  }
}

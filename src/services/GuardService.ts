import type { Geometry, LineString, Point, Polygon } from 'geojson';

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

  // Check if the geometry is of a type that has coordinates
  public static hasCoordinates(
    geometry: Geometry,
  ): geometry is Point | LineString | Polygon {
    return 'coordinates' in geometry;
  }
}

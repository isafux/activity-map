export class StyleService {
  // Generates a random vibrant color with customizable lightness bounds
  public static generateRandomColor(
    minLightness: number = 40,
    maxLightness: number = 60,
    alpha: number = 1,
  ): string {
    // Ensure minLightness and maxLightness are within valid range (0-100)
    minLightness = Math.max(0, Math.min(minLightness, 100));
    maxLightness = Math.max(minLightness, Math.min(maxLightness, 100)); // max must be >= min

    // Generate random hue value (0-360)
    const hue = Math.floor(Math.random() * 360);

    // Generate random saturation value (90% to 100% for vibrant colors)
    const saturation = Math.floor(Math.random() * 21) + 90; // range: 90-100

    // Generate random lightness between minLightness and maxLightness
    const lightness = Math.floor(
      Math.random() * (maxLightness - minLightness + 1) + minLightness,
    );

    // Return the HSL color as a string
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  }
}

export class FormatService {
  /**
   * Formats an ISO timestamp string into a human-readable date.
   *
   * @param isoString - The ISO timestamp (e.g. "2025-10-08T09:04:50.000Z")
   * @param locale - Optional locale (default: "en-US")
   * @param options - Optional Intl.DateTimeFormat options
   * @returns A formatted date string
   */
  public static formatDate(
    isoString: string,
    locale: string = 'en-US',
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    },
  ): string {
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', isoString);
      return isoString; // fallback
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  /**
   * Capitalizes the first letter of a given string.
   *
   * @param text - The text to be transformed
   * @returns The formatted text string
   */
  public static capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

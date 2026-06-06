import { useLocale } from "next-intl";

export function useLocalizedNumber() {
  const locale = useLocale();

  /**
   * Formats a number according to the current locale
   * e.g., in 'fr': 12,54
   * e.g., in 'en': 12.54
   */
  return function formatLocalizedNumber(
    value: number | string | null | undefined,
    options?: Intl.NumberFormatOptions
  ): string {
    if (value === null || value === undefined || value === "") return "";

    // Replace commas with dots to parse properly if a string is provided
    const numStr = String(value).replace(",", ".");
    const num = parseFloat(numStr);

    if (isNaN(num)) return String(value);

    // fr-CA or fr-FR for comma, en-US for dot
    const localeString = locale.startsWith("en") ? "en-US" : "fr-CA";

    return new Intl.NumberFormat(localeString, {
      useGrouping: false,
      maximumFractionDigits: 4,
      ...options,
    }).format(num);
  };
}

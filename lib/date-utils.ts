import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/fr";
import "dayjs/locale/en";

// Initialize plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/**
 * Returns a full ISO 8601 string with the user's local offset.
 * Example: "2024-04-02T00:00:00-07:00"
 */
export function formatDateWithOffset(
  date: Date | string | null | undefined
): string | null {
  if (!date) return null;
  const d = dayjs(date);
  if (!d.isValid()) return null;

  // .format() without arguments in dayjs returns the ISO8601 string with offset
  return d.format();
}

/**
 * Safely parses any ISO string and returns a local Date object.
 */
export function parseToLocal(
  date: Date | string | null | undefined
): Date | undefined {
  if (!date) return undefined;
  const d = dayjs(date);
  return d.isValid() ? d.toDate() : undefined;
}

/**
 * Utility to format dates for UI display consistently using dayjs.
 */
export function formatDisplayDate(
  date: Date | string | null | undefined,
  includeTime: boolean = false
): string {
  if (!date) return "—";
  const d = dayjs(date);
  if (!d.isValid()) return "—";

  const formatStr = includeTime ? "D MMMM YYYY HH:mm" : "D MMMM YYYY";
  return d.format(formatStr);
}
/**
 * Utility to format dates for UI display consistently using dayjs.
 */
export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";
  const d = dayjs(date);
  if (!d.isValid()) return "—";
  return dayjs().to(d);
}

/**
 * Returns the difference in days between two dates.
 */
export function diffInDays(
  date1: Date | string | null | undefined,
  date2: Date | string | null | undefined
): number {
  if (!date1 || !date2) return 0;
  return dayjs(date1).diff(dayjs(date2), "day");
}

/**
 * Flexible format utility
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = "DD MMM YYYY"
): string {
  if (!date) return "—";
  const d = dayjs(date);
  return d.isValid() ? d.format(formatStr) : "—";
}

/**
 * Returns a date range from X days ago to now.
 */
export function getPastDateRange(days: number): { from: Date; to: Date } {
  const now = dayjs();
  return {
    from: now.subtract(days, "day").startOf("day").toDate(),
    to: now.endOf("day").toDate(),
  };
}

/**
 * Returns the start of the day for a given date.
 */
export function startOfDay(date: Date | string | null | undefined): string {
  if (!date) return "";
  return dayjs(date).startOf("day").toISOString();
}

/**
 * Returns the end of the day for a given date.
 */
export function endOfDay(date: Date | string | null | undefined): string {
  if (!date) return "";
  return dayjs(date).endOf("day").toISOString();
}

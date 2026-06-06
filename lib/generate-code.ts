import dayjs from "dayjs";

/**
 * Generates a unique code with a given prefix.
 *
 * Format: `{PREFIX}-{YYYYMMDD}-{RANDOM}`
 *   - PREFIX: user-supplied (e.g. "INV", "CMD", "MAT")
 *   - YYYYMMDD: current date
 *   - RANDOM: 4-character alphanumeric (uppercase)
 *
 * Example: INV-20260224-A3F7
 */
export function generateCode(prefix?: string): string {
  const now = dayjs().toDate();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${prefix ? prefix.toUpperCase() + "-" : ""}${date}-${random}`;
}

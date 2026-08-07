import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
} from "date-fns";

/**
 * Date formatting utilities.
 */
export function formatDate(
  date: Date | string,
  pattern = "MMM d, yyyy",
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return format(d, pattern);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, "MMM d, yyyy · h:mm a");
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}

import { DateTime } from "luxon";

export interface DateRange {
  /** Inclusive ISO calendar date (YYYY-MM-DD). */
  start: string;
  /** Inclusive ISO calendar date (YYYY-MM-DD). */
  end: string;
}

export function currentWeekRange(referenceDate: DateTime = DateTime.now()): DateRange {
  return { start: referenceDate.startOf("week").toISODate()!, end: referenceDate.endOf("week").toISODate()! };
}

export function shiftWeekRange(range: DateRange, weeks: number): DateRange {
  const start = DateTime.fromISO(range.start).plus({ weeks }).startOf("week");
  return { start: start.toISODate()!, end: start.endOf("week").toISODate()! };
}

export function currentMonthRange(referenceDate: DateTime = DateTime.now()): DateRange {
  return { start: referenceDate.startOf("month").toISODate()!, end: referenceDate.endOf("month").toISODate()! };
}

export function shiftMonthRange(range: DateRange, months: number): DateRange {
  const start = DateTime.fromISO(range.start).plus({ months }).startOf("month");
  return { start: start.toISODate()!, end: start.endOf("month").toISODate()! };
}

/**
 * The calendar date (YYYY-MM-DD) a manifest entry falls on, computed in its
 * own stored timezone (spec Assumptions — not the viewer's local timezone).
 */
export function scheduledCalendarDate(scheduledAt: string, timezone: string): string | null {
  const dt = DateTime.fromISO(scheduledAt, { zone: timezone });
  return dt.isValid ? dt.toISODate() : null;
}

export function isDateWithinRange(date: string, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

export function formatScheduledAt(scheduledAt: string, timezone: string): string {
  const dt = DateTime.fromISO(scheduledAt, { zone: timezone });
  if (!dt.isValid) return `${scheduledAt} (${timezone})`;
  return `${dt.toFormat("EEE, MMM d, yyyy 'at' h:mm a")} (${timezone})`;
}

export function isValidTimezone(timezone: string): boolean {
  return DateTime.local().setZone(timezone).isValid;
}

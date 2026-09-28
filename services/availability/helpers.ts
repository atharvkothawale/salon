import { TimeRange } from "./types";

/**
 * Checks if two time ranges overlap.
 * Overlap occurs when: candidateStart < existingEnd AND candidateEnd > existingStart
 */
export function isOverlapping(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * Format "HH:MM:SS" or "HH:MM" time string to "10:00 AM" display string.
 */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || "00";
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Formats a Date object to "HH:MM" (e.g. "10:30")
 */
export function format24Hour(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Parses "YYYY-MM-DD" and "HH:MM:SS" into a Date object in local time.
 */
export function createLocalDate(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes || 0, seconds || 0, 0);
}

/**
 * Generates candidate time slot ranges between windowStart and windowEnd
 * respecting bookingIntervalMinutes and durationMinutes.
 */
export function generateCandidateSlots(
  windowStart: Date,
  windowEnd: Date,
  durationMinutes: number,
  intervalMinutes: number
): TimeRange[] {
  const slots: TimeRange[] = [];
  const durationMs = durationMinutes * 60 * 1000;
  const intervalMs = intervalMinutes * 60 * 1000;

  let currentStart = new Date(windowStart.getTime());

  while (currentStart.getTime() + durationMs <= windowEnd.getTime()) {
    const slotEnd = new Date(currentStart.getTime() + durationMs);
    slots.push({
      start: new Date(currentStart.getTime()),
      end: slotEnd,
    });
    currentStart = new Date(currentStart.getTime() + intervalMs);
  }

  return slots;
}

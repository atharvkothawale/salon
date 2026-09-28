import assert from "node:assert";
import {
  isOverlapping,
  formatTimeDisplay,
  format24Hour,
  generateCandidateSlots,
} from "../helpers";

export function runAvailabilityHelperTests() {
  // Test 1: Overlap detection
  const rangeA = {
    start: new Date("2026-09-27T10:00:00Z"),
    end: new Date("2026-09-27T11:00:00Z"),
  };

  const rangeB = {
    start: new Date("2026-09-27T10:30:00Z"),
    end: new Date("2026-09-27T11:30:00Z"),
  };
  assert.strictEqual(isOverlapping(rangeA, rangeB), true, "10:30-11:30 should overlap 10-11");

  const rangeC = {
    start: new Date("2026-09-27T11:00:00Z"),
    end: new Date("2026-09-27T12:00:00Z"),
  };
  assert.strictEqual(isOverlapping(rangeA, rangeC), false, "11:00-12:00 should NOT overlap 10-11");

  // Test 2: Time formatting
  assert.strictEqual(formatTimeDisplay("09:00:00"), "9:00 AM");
  assert.strictEqual(formatTimeDisplay("12:00:00"), "12:00 PM");
  assert.strictEqual(formatTimeDisplay("14:30:00"), "2:30 PM");

  // Test 3: Candidate slot generation
  const windowStart = new Date(2026, 8, 27, 10, 0, 0);
  const windowEnd = new Date(2026, 8, 27, 12, 0, 0);

  // 30 min duration, 30 min interval -> 4 slots (10:00, 10:30, 11:00, 11:30)
  const slots30 = generateCandidateSlots(windowStart, windowEnd, 30, 30);
  assert.strictEqual(slots30.length, 4);
  assert.strictEqual(format24Hour(slots30[0].start), "10:00");
  assert.strictEqual(format24Hour(slots30[3].start), "11:30");

  // 60 min duration, 30 min interval -> 3 slots (10:00, 10:30, 11:00)
  const slots60 = generateCandidateSlots(windowStart, windowEnd, 60, 30);
  assert.strictEqual(slots60.length, 3);
  assert.strictEqual(format24Hour(slots60[2].start), "11:00");
  assert.strictEqual(format24Hour(slots60[2].end), "12:00");

  return true;
}

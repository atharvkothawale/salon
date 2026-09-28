import { AvailabilityErrorReason } from "@/schemas/availability";

export interface TimeSlot {
  time: string; // e.g. "10:00"
  displayTime: string; // e.g. "10:00 AM"
  startTimeIso: string;
  endTimeIso: string;
}

export interface StaffAvailability {
  staffId: string;
  staffName: string;
  roleTitle: string;
  photoUrl: string | null;
  slots: TimeSlot[];
}

export interface AnyStaffTimeSlot {
  time: string; // e.g. "10:00"
  displayTime: string;
  startTimeIso: string;
  endTimeIso: string;
  availableStaffIds: string[];
}

export interface AvailabilityResult {
  available: boolean;
  date: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
  reason?: AvailabilityErrorReason;
  error?: string;
  staff: StaffAvailability[];
  anyStaffSlots: AnyStaffTimeSlot[];
}

export interface TimeRange {
  start: Date;
  end: Date;
}

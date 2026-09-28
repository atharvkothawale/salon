import { createClient } from "@/lib/supabase/server";
import {
  AvailabilityQuerySchema,
  AvailabilityQueryInput,
} from "@/schemas/availability";
import {
  AvailabilityResult,
  StaffAvailability,
  AnyStaffTimeSlot,
  TimeSlot,
  TimeRange,
} from "./types";
import {
  isOverlapping,
  formatTimeDisplay,
  format24Hour,
  createLocalDate,
  generateCandidateSlots,
} from "./helpers";

export async function getAvailability(
  input: AvailabilityQueryInput
): Promise<AvailabilityResult> {
  // 1. Validate Input
  const validated = AvailabilityQuerySchema.safeParse(input);
  if (!validated.success) {
    return {
      available: false,
      date: input.date || "",
      serviceId: input.serviceId || "",
      serviceName: "",
      durationMinutes: 0,
      price: 0,
      reason: "INVALID_INPUT",
      error: validated.error.issues[0]?.message || "Invalid query arguments",
      staff: [],
      anyStaffSlots: [],
    };
  }

  const { serviceId, date: dateStr, preferredStaffId } = validated.data;
  const supabase = await createClient();

  // 2. Fetch Selected Service
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, name, price, duration_minutes, is_active")
    .eq("id", serviceId)
    .single();

  if (serviceError || !service) {
    return {
      available: false,
      date: dateStr,
      serviceId,
      serviceName: "",
      durationMinutes: 0,
      price: 0,
      reason: "SERVICE_NOT_FOUND",
      error: "The requested service could not be found",
      staff: [],
      anyStaffSlots: [],
    };
  }

  if (!service.is_active) {
    return {
      available: false,
      date: dateStr,
      serviceId,
      serviceName: service.name,
      durationMinutes: service.duration_minutes,
      price: Number(service.price),
      reason: "SERVICE_INACTIVE",
      error: "This service is currently inactive",
      staff: [],
      anyStaffSlots: [],
    };
  }

  // 3. Fetch Salon Settings (Booking Interval)
  const { data: settings } = await supabase
    .from("salon_settings")
    .select("booking_interval_minutes")
    .limit(1)
    .single();

  const bookingInterval = settings?.booking_interval_minutes || 30;

  // 4. Determine Day of Week & Fetch Salon Business Hours
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDateObj = new Date(year, month - 1, day);
  const dayOfWeek = targetDateObj.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

  const { data: businessHours } = await supabase
    .from("business_hours")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .single();

  if (!businessHours || !businessHours.is_open) {
    return {
      available: false,
      date: dateStr,
      serviceId,
      serviceName: service.name,
      durationMinutes: service.duration_minutes,
      price: Number(service.price),
      reason: "SALON_CLOSED",
      staff: [],
      anyStaffSlots: [],
    };
  }

  // 5. Check Salon Closures / Holidays
  const dayStartIso = createLocalDate(dateStr, "00:00:00").toISOString();
  const dayEndIso = createLocalDate(dateStr, "23:59:59").toISOString();

  const { data: closures } = await supabase
    .from("salon_closures")
    .select("*")
    .lte("start_datetime", dayEndIso)
    .gte("end_datetime", dayStartIso);

  if (closures && closures.length > 0) {
    return {
      available: false,
      date: dateStr,
      serviceId,
      serviceName: service.name,
      durationMinutes: service.duration_minutes,
      price: Number(service.price),
      reason: "SALON_CLOSURE_HOLIDAY",
      staff: [],
      anyStaffSlots: [],
    };
  }

  // 6. Fetch Qualified Active Staff Members
  const { data: qualifiedStaffRecords } = await supabase
    .from("staff_services")
    .select("staff_id, staff!inner(id, full_name, role_title, photo_url, is_active)")
    .eq("service_id", serviceId)
    .eq("staff.is_active", true);

  if (!qualifiedStaffRecords || qualifiedStaffRecords.length === 0) {
    return {
      available: false,
      date: dateStr,
      serviceId,
      serviceName: service.name,
      durationMinutes: service.duration_minutes,
      price: Number(service.price),
      reason: "NO_AVAILABILITY",
      staff: [],
      anyStaffSlots: [],
    };
  }

  let staffList = (
    qualifiedStaffRecords as unknown as Array<{
      staff: {
        id: string;
        full_name: string;
        role_title: string;
        photo_url: string | null;
        is_active: boolean;
      };
    }>
  ).map((r) => r.staff);

  if (preferredStaffId) {
    const isQualified = staffList.some((s) => s.id === preferredStaffId);
    if (!isQualified) {
      return {
        available: false,
        date: dateStr,
        serviceId,
        serviceName: service.name,
        durationMinutes: service.duration_minutes,
        price: Number(service.price),
        reason: "STAFF_NOT_QUALIFIED",
        error: "The requested staff member cannot perform this service",
        staff: [],
        anyStaffSlots: [],
      };
    }
    staffList = staffList.filter((s) => s.id === preferredStaffId);
  }

  const staffIds = staffList.map((s) => s.id);

  // 7. Fetch Working Hours, Breaks, Leaves, and Active Appointments in Batch
  const [
    { data: workingHoursList },
    { data: breaksList },
    { data: leavesList },
    { data: appointmentsList },
  ] = await Promise.all([
    supabase
      .from("staff_working_hours")
      .select("*")
      .in("staff_id", staffIds)
      .eq("day_of_week", dayOfWeek)
      .eq("is_working", true),
    supabase
      .from("staff_breaks")
      .select("*")
      .in("staff_id", staffIds)
      .eq("day_of_week", dayOfWeek),
    supabase
      .from("staff_leaves")
      .select("*")
      .in("staff_id", staffIds)
      .lte("start_datetime", dayEndIso)
      .gte("end_datetime", dayStartIso),
    supabase
      .from("appointments")
      .select("id, staff_id, start_datetime, end_datetime, appointment_status")
      .in("staff_id", staffIds)
      .neq("appointment_status", "CANCELLED")
      .lte("start_datetime", dayEndIso)
      .gte("end_datetime", dayStartIso),
  ]);

  const salonOpenDate = createLocalDate(dateStr, businessHours.open_time);
  const salonCloseDate = createLocalDate(dateStr, businessHours.close_time);
  const now = new Date();

  const resultStaff: StaffAvailability[] = [];
  const anyStaffSlotMap: Map<string, AnyStaffTimeSlot> = new Map();

  // 8. Calculate Slots Per Staff Member
  for (const staffMember of staffList) {
    const staffWork = workingHoursList?.find((w) => w.staff_id === staffMember.id);
    if (!staffWork || !staffWork.is_working) {
      continue;
    }

    const staffStartDate = createLocalDate(dateStr, staffWork.start_time);
    const staffEndDate = createLocalDate(dateStr, staffWork.end_time);

    // Window intersection between salon opening hours and staff working hours
    const windowStart = new Date(Math.max(salonOpenDate.getTime(), staffStartDate.getTime()));
    const windowEnd = new Date(Math.min(salonCloseDate.getTime(), staffEndDate.getTime()));

    if (windowStart >= windowEnd) continue;

    // Staff Breaks Time Ranges
    const staffBreaks: TimeRange[] = (breaksList || [])
      .filter((b) => b.staff_id === staffMember.id)
      .map((b) => ({
        start: createLocalDate(dateStr, b.start_time),
        end: createLocalDate(dateStr, b.end_time),
      }));

    // Staff Leaves Time Ranges
    const staffLeaves: TimeRange[] = (leavesList || [])
      .filter((l) => l.staff_id === staffMember.id)
      .map((l) => ({
        start: new Date(l.start_datetime),
        end: new Date(l.end_datetime),
      }));

    // Staff Existing Appointments Time Ranges
    const staffApps: TimeRange[] = (appointmentsList || [])
      .filter((a) => a.staff_id === staffMember.id)
      .map((a) => ({
        start: new Date(a.start_datetime),
        end: new Date(a.end_datetime),
      }));

    // Candidate Slot Generation
    const candidateSlots = generateCandidateSlots(
      windowStart,
      windowEnd,
      service.duration_minutes,
      bookingInterval
    );

    const validSlots: TimeSlot[] = [];

    for (const candidate of candidateSlots) {
      // Past time slot check (if requested date is today)
      if (candidate.start.getTime() <= now.getTime() && targetDateObj.toDateString() === now.toDateString()) {
        continue;
      }

      // Check breaks overlap
      const overlapsBreak = staffBreaks.some((b) => isOverlapping(candidate, b));
      if (overlapsBreak) continue;

      // Check leaves overlap
      const overlapsLeave = staffLeaves.some((l) => isOverlapping(candidate, l));
      if (overlapsLeave) continue;

      // Check existing appointments overlap
      const overlapsAppointment = staffApps.some((app) => isOverlapping(candidate, app));
      if (overlapsAppointment) continue;

      const timeKey = format24Hour(candidate.start);
      const displayTime = formatTimeDisplay(timeKey);

      const slotObj: TimeSlot = {
        time: timeKey,
        displayTime,
        startTimeIso: candidate.start.toISOString(),
        endTimeIso: candidate.end.toISOString(),
      };

      validSlots.push(slotObj);

      // Map to combined Any Staff availability
      if (!anyStaffSlotMap.has(timeKey)) {
        anyStaffSlotMap.set(timeKey, {
          time: timeKey,
          displayTime,
          startTimeIso: candidate.start.toISOString(),
          endTimeIso: candidate.end.toISOString(),
          availableStaffIds: [staffMember.id],
        });
      } else {
        const existing = anyStaffSlotMap.get(timeKey)!;
        if (!existing.availableStaffIds.includes(staffMember.id)) {
          existing.availableStaffIds.push(staffMember.id);
        }
      }
    }

    if (validSlots.length > 0) {
      resultStaff.push({
        staffId: staffMember.id,
        staffName: staffMember.full_name,
        roleTitle: staffMember.role_title,
        photoUrl: staffMember.photo_url,
        slots: validSlots,
      });
    }
  }

  // Sort anyStaffSlots chronologically by timeKey
  const sortedAnyStaffSlots = Array.from(anyStaffSlotMap.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  const hasAvailability = resultStaff.length > 0;

  return {
    available: hasAvailability,
    date: dateStr,
    serviceId,
    serviceName: service.name,
    durationMinutes: service.duration_minutes,
    price: Number(service.price),
    reason: hasAvailability ? undefined : "NO_AVAILABILITY",
    staff: resultStaff,
    anyStaffSlots: sortedAnyStaffSlots,
  };
}

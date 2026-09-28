"use server";

import { createClient } from "@/lib/supabase/server";
import {
  CreateAppointmentSchema,
  CreateAppointmentInput,
  CancelAppointmentSchema,
  SubmitReviewSchema,
  SubmitReviewInput,
} from "@/schemas/appointment";
import { getAvailability } from "@/services/availability/get-availability";

function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omit confusing 0/O, 1/I
  let code = "LUMI-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createAppointment(input: CreateAppointmentInput) {
  // 1. Input Validation
  const validated = CreateAppointmentSchema.safeParse(input);
  if (!validated.success) {
    return {
      error: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid appointment submission",
    };
  }

  const { serviceId, staffId: requestedStaffId, date: dateStr, startTimeIso, notes } = validated.data;

  // 2. Server-side Authentication Verification
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "UNAUTHORIZED",
      message: "Please sign in to complete your salon reservation.",
    };
  }

  // 3. Verify Customer Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      error: "PROFILE_NOT_FOUND",
      message: "Customer profile not found. Please log in again.",
    };
  }

  // 4. Server-side Service Verification (Durations & Price)
  const { data: service } = await supabase
    .from("services")
    .select("id, name, price, duration_minutes, is_active")
    .eq("id", serviceId)
    .single();

  if (!service || !service.is_active) {
    return {
      error: "SERVICE_UNAVAILABLE",
      message: "The requested service is not currently available.",
    };
  }

  // 5. Re-check Availability Server-side immediately before insertion
  const availability = await getAvailability({
    serviceId,
    date: dateStr,
    preferredStaffId: requestedStaffId || undefined,
  });

  if (!availability.available) {
    return {
      error: "SLOT_NO_LONGER_AVAILABLE",
      message: "The selected date or time slot is no longer available. Please select another slot.",
    };
  }

  // 6. Determine Final Staff Assignment
  let finalStaffId: string | null = requestedStaffId || null;

  if (!finalStaffId) {
    const matchingSlot = availability.anyStaffSlots.find(
      (s) => s.startTimeIso === startTimeIso
    );

    if (!matchingSlot || matchingSlot.availableStaffIds.length === 0) {
      return {
        error: "SLOT_NO_LONGER_AVAILABLE",
        message: "No stylists are available at this selected time. Please pick another slot.",
      };
    }

    finalStaffId = matchingSlot.availableStaffIds[0];
  } else {
    const staffSchedule = availability.staff.find((s) => s.staffId === finalStaffId);
    const slotExists = staffSchedule?.slots.some((s) => s.startTimeIso === startTimeIso);

    if (!slotExists) {
      return {
        error: "SLOT_NO_LONGER_AVAILABLE",
        message: "The selected stylist is no longer available at this time. Please pick another slot.",
      };
    }
  }

  // 7. Calculate End Datetime Server-side
  const startDateObj = new Date(startTimeIso);
  const durationMs = service.duration_minutes * 60 * 1000;
  const endDateObj = new Date(startDateObj.getTime() + durationMs);
  const endTimeIso = endDateObj.toISOString();

  // 8. Generate Booking Code
  const bookingCode = generateBookingCode();

  // 9. Atomic Database Insertion into `appointments`
  const { data: appointment, error: insertError } = await supabase
    .from("appointments")
    .insert({
      booking_code: bookingCode,
      customer_id: user.id,
      staff_id: finalStaffId,
      service_id: serviceId,
      start_datetime: startTimeIso,
      end_datetime: endTimeIso,
      appointment_status: "CONFIRMED",
      payment_status: "PENDING",
      payment_method: "PAY_AT_SALON",
      amount: Number(service.price),
      notes: notes || null,
    })
    .select()
    .single();

  if (insertError || !appointment) {
    if (insertError?.code === "23P01" || insertError?.message?.includes("no_overlapping_staff_appointments")) {
      return {
        error: "DOUBLE_BOOKING_CONFLICT",
        message: "This time slot was just booked by another client. Please choose another time.",
      };
    }

    return {
      error: "INSERTION_FAILED",
      message: insertError?.message || "Failed to create appointment record. Please try again.",
    };
  }

  // 10. Audit Trail Event Log
  await supabase.from("appointment_events").insert({
    appointment_id: appointment.id,
    event_type: "CREATED",
    old_status: null,
    new_status: "CONFIRMED",
    metadata: {
      booking_code: bookingCode,
      created_by: user.id,
      payment_method: "PAY_AT_SALON",
    },
  });

  return {
    success: true,
    appointmentId: appointment.id,
    bookingCode: appointment.booking_code,
  };
}

export async function cancelAppointment(appointmentId: string) {
  const validated = CancelAppointmentSchema.safeParse({ appointmentId });
  if (!validated.success) {
    return { error: "INVALID_INPUT", message: "Invalid appointment ID" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "UNAUTHENTICATED", message: "Please sign in to cancel your appointment." };
  }

  // Fetch appointment
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("id, customer_id, start_datetime, appointment_status")
    .eq("id", appointmentId)
    .single();

  if (error || !appointment) {
    return { error: "APPOINTMENT_NOT_FOUND", message: "Appointment not found." };
  }

  // Ownership check
  if (appointment.customer_id !== user.id) {
    return { error: "UNAUTHORIZED", message: "You are not authorized to access this appointment." };
  }

  // Status check
  if (appointment.appointment_status === "CANCELLED") {
    return { error: "ALREADY_CANCELLED", message: "This appointment is already cancelled." };
  }

  if (appointment.appointment_status === "COMPLETED" || appointment.appointment_status === "NO_SHOW") {
    return { error: "CANNOT_CANCEL", message: "Completed or past appointments cannot be cancelled." };
  }

  // 24-Hour Business Rule Enforcement
  const startDate = new Date(appointment.start_datetime);
  const now = new Date();
  const hoursDiff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 24) {
    return {
      error: "CANCELLATION_WINDOW_EXPIRED",
      message: "Online cancellation is unavailable within 24 hours of your appointment. Please contact the salon directly.",
    };
  }

  // Update Status to CANCELLED
  const { error: updateError } = await supabase
    .from("appointments")
    .update({ appointment_status: "CANCELLED" })
    .eq("id", appointmentId);

  if (updateError) {
    return { error: "UPDATE_FAILED", message: "Failed to cancel appointment. Please try again." };
  }

  // Audit Event Entry
  await supabase.from("appointment_events").insert({
    appointment_id: appointmentId,
    event_type: "CANCELLED",
    old_status: appointment.appointment_status,
    new_status: "CANCELLED",
    metadata: {
      cancelled_by: user.id,
      cancelled_at: new Date().toISOString(),
    },
  });

  return { success: true, message: "Appointment cancelled successfully." };
}

export async function submitReview(input: SubmitReviewInput) {
  const validated = SubmitReviewSchema.safeParse(input);
  if (!validated.success) {
    return { error: "INVALID_INPUT", message: validated.error.issues[0]?.message || "Invalid review data" };
  }

  const { appointmentId, rating, comment } = validated.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "UNAUTHENTICATED", message: "Please sign in to submit a review." };
  }

  // Fetch appointment to verify ownership & completion status
  const { data: appointment, error: appError } = await supabase
    .from("appointments")
    .select("id, customer_id, appointment_status, reviews(id)")
    .eq("id", appointmentId)
    .single();

  if (appError || !appointment) {
    return { error: "APPOINTMENT_NOT_FOUND", message: "Appointment not found." };
  }

  if (appointment.customer_id !== user.id) {
    return { error: "UNAUTHORIZED", message: "You can only review your own appointments." };
  }

  if (appointment.appointment_status !== "COMPLETED") {
    return { error: "REVIEW_NOT_ALLOWED", message: "Reviews can only be submitted for completed salon treatments." };
  }

  if (appointment.reviews && (Array.isArray(appointment.reviews) ? appointment.reviews.length > 0 : Boolean(appointment.reviews))) {
    return { error: "REVIEW_ALREADY_EXISTS", message: "You have already submitted a review for this treatment." };
  }

  // Insert review with PENDING moderation status
  const { data: review, error: insertError } = await supabase
    .from("reviews")
    .insert({
      appointment_id: appointmentId,
      customer_id: user.id,
      rating,
      comment: comment?.trim() || null,
      moderation_status: "PENDING", // SECURITY: Always force PENDING for admin moderation
    })
    .select()
    .single();

  if (insertError || !review) {
    return { error: "INSERT_FAILED", message: insertError?.message || "Failed to submit review. Please try again." };
  }

  return {
    success: true,
    message: "Thank you for your feedback! Your review has been submitted for approval.",
  };
}

export async function getAppointmentById(appointmentId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select(
        "*, services(name, description, duration_minutes, image_url, service_categories(name)), staff(full_name, role_title, photo_url), profiles!appointments_customer_id_fkey(full_name, email, phone), reviews(*)"
      )
      .eq("id", appointmentId)
      .single();

    if (error || !appointment) return null;

    if (appointment.customer_id !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || profile.role === "CUSTOMER") {
        return null;
      }
    }

    return appointment;
  } catch {
    return null;
  }
}

export async function getCustomerAppointments() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(
        "*, services(name, duration_minutes, image_url), staff(full_name, role_title, photo_url), reviews(id, rating, comment, moderation_status)"
      )
      .eq("customer_id", user.id)
      .order("start_datetime", { ascending: false });

    if (error || !appointments) return [];
    return appointments;
  } catch {
    return [];
  }
}

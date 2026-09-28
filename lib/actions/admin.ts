"use server";

import { createClient } from "@/lib/supabase/server";
import {
  UpdateAppointmentStatusSchema,
  UpdateAppointmentStatusInput,
  StaffInputSchema,
  StaffInput,
  ServiceInputSchema,
  ServiceInput,
  CategoryInputSchema,
  CategoryInput,
  CouponInputSchema,
  CouponInput,
  SalonSettingsInputSchema,
  SalonSettingsInput,
  SalonClosureInputSchema,
  SalonClosureInput,
} from "@/schemas/admin";

// ============================================================================
// 1. SECURITY & ADMIN AUTHORIZATION HELPER
// ============================================================================
export async function requireAdminRole() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false as const, user: null, profile: null, error: "UNAUTHENTICATED" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "ADMIN") {
    return { authorized: false as const, user, profile: null, error: "UNAUTHORIZED" };
  }

  return { authorized: true as const, user, profile, error: null };
}

// ============================================================================
// 2. DASHBOARD METRICS & OVERVIEW
// ============================================================================
export async function getAdminDashboardMetrics() {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return null;

  const supabase = await createClient();

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const todayStart = `${todayStr}T00:00:00.000Z`;
  const todayEnd = `${todayStr}T23:59:59.999Z`;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch Today's Appointments
  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("*, services(name), staff(full_name), profiles!appointments_customer_id_fkey(full_name)")
    .gte("start_datetime", todayStart)
    .lte("start_datetime", todayEnd)
    .order("start_datetime", { ascending: true });

  const list = todayAppointments || [];
  const todayTotal = list.length;
  const todayConfirmed = list.filter((a) => a.appointment_status === "CONFIRMED").length;
  const todayCompleted = list.filter((a) => a.appointment_status === "COMPLETED").length;
  const todayCancelled = list.filter((a) => a.appointment_status === "CANCELLED").length;
  const todayNoShow = list.filter((a) => a.appointment_status === "NO_SHOW").length;

  // Authoritative Revenue (Only count COMPLETED or PAID appointments)
  const todayRevenue = list
    .filter((a) => a.appointment_status === "COMPLETED" || a.payment_status === "PAID")
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);

  // Current Month Revenue
  const { data: monthAppointments } = await supabase
    .from("appointments")
    .select("amount, appointment_status, payment_status")
    .gte("start_datetime", monthStart);

  const monthRevenue = (monthAppointments || [])
    .filter((a) => a.appointment_status === "COMPLETED" || a.payment_status === "PAID")
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);

  // Fetch Pending Reviews Count for Operational Alerts
  const { count: pendingReviewsCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("moderation_status", "PENDING");

  // Fetch Upcoming Sessions (Next 5)
  const { data: upcomingSessions } = await supabase
    .from("appointments")
    .select("*, services(name, duration_minutes), staff(full_name), profiles!appointments_customer_id_fkey(full_name, phone)")
    .gte("start_datetime", now.toISOString())
    .neq("appointment_status", "CANCELLED")
    .order("start_datetime", { ascending: true })
    .limit(6);

  return {
    todayMetrics: {
      total: todayTotal,
      confirmed: todayConfirmed,
      completed: todayCompleted,
      cancelled: todayCancelled,
      noShow: todayNoShow,
    },
    revenue: {
      today: todayRevenue,
      month: monthRevenue,
    },
    alerts: {
      pendingReviews: pendingReviewsCount || 0,
      todayPendingAppointments: list.filter((a) => a.appointment_status === "PENDING").length,
    },
    upcomingSessions: upcomingSessions || [],
    todayList: list,
  };
}

// ============================================================================
// 3. APPOINTMENT MANAGEMENT
// ============================================================================
export async function getAdminAppointments(filters?: {
  query?: string;
  status?: string;
  staffId?: string;
  serviceId?: string;
  date?: string;
}) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return [];

  const supabase = await createClient();
  let q = supabase
    .from("appointments")
    .select(
      "*, services(name, duration_minutes, price), staff(full_name, role_title), profiles!appointments_customer_id_fkey(full_name, email, phone)"
    )
    .order("start_datetime", { ascending: false });

  if (filters?.status && filters.status !== "ALL") {
    q = q.eq("appointment_status", filters.status);
  }

  if (filters?.staffId && filters.staffId !== "ALL") {
    q = q.eq("staff_id", filters.staffId);
  }

  if (filters?.serviceId && filters.serviceId !== "ALL") {
    q = q.eq("service_id", filters.serviceId);
  }

  if (filters?.date) {
    const start = `${filters.date}T00:00:00.000Z`;
    const end = `${filters.date}T23:59:59.999Z`;
    q = q.gte("start_datetime", start).lte("start_datetime", end);
  }

  const { data, error } = await q;
  if (error || !data) return [];

  if (filters?.query?.trim()) {
    const search = filters.query.toLowerCase();
    return data.filter(
      (app) =>
        app.booking_code.toLowerCase().includes(search) ||
        app.profiles?.full_name.toLowerCase().includes(search) ||
        app.profiles?.email.toLowerCase().includes(search) ||
        app.services?.name.toLowerCase().includes(search) ||
        app.staff?.full_name.toLowerCase().includes(search)
    );
  }

  return data;
}

export async function getAdminAppointmentDetails(appointmentId: string) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return null;

  const supabase = await createClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      "*, services(*), staff(*), profiles!appointments_customer_id_fkey(*), reviews(*), appointment_events(*)"
    )
    .eq("id", appointmentId)
    .single();

  return appointment || null;
}

export async function updateAdminAppointmentStatus(input: UpdateAppointmentStatusInput) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) {
    return { error: "UNAUTHORIZED", message: "Admin authorization required." };
  }

  const validated = UpdateAppointmentStatusSchema.safeParse(input);
  if (!validated.success) {
    return { error: "INVALID_INPUT", message: validated.error.issues[0]?.message || "Invalid status update" };
  }

  const { appointmentId, status, cancellationReason } = validated.data;
  const supabase = await createClient();

  // Fetch current appointment
  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("id, appointment_status, customer_id")
    .eq("id", appointmentId)
    .single();

  if (fetchError || !appointment) {
    return { error: "APPOINTMENT_NOT_FOUND", message: "Appointment not found." };
  }

  const oldStatus = appointment.appointment_status;

  // Update appointment status
  const updateData: Record<string, unknown> = { appointment_status: status };
  if (cancellationReason) {
    updateData.cancellation_reason = cancellationReason;
  }
  if (status === "COMPLETED") {
    updateData.payment_status = "PAID";
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update(updateData)
    .eq("id", appointmentId);

  if (updateError) {
    return { error: "UPDATE_FAILED", message: updateError.message || "Failed to update appointment status." };
  }

  // Audit Event Insertion
  let eventType: "CREATED" | "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" = "CONFIRMED";
  if (status === "COMPLETED") eventType = "COMPLETED";
  else if (status === "CANCELLED") eventType = "CANCELLED";
  else if (status === "NO_SHOW") eventType = "NO_SHOW";
  else if (status === "CONFIRMED") eventType = "CONFIRMED";

  await supabase.from("appointment_events").insert({
    appointment_id: appointmentId,
    event_type: eventType,
    old_status: oldStatus,
    new_status: status,
    metadata: {
      updated_by: authCheck.user?.id,
      admin_email: authCheck.profile?.email,
      reason: cancellationReason || null,
      updated_at: new Date().toISOString(),
    },
  });

  return { success: true, message: `Appointment status updated to ${status}.` };
}

// ============================================================================
// 4. CALENDAR SCHEDULING
// ============================================================================
export async function getAdminCalendarAppointments(startDateIso: string, endDateIso: string, staffId?: string) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return [];

  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select("id, booking_code, start_datetime, end_datetime, appointment_status, amount, services(name, duration_minutes), staff(id, full_name), profiles!appointments_customer_id_fkey(full_name, phone)")
    .gte("start_datetime", startDateIso)
    .lte("start_datetime", endDateIso)
    .order("start_datetime", { ascending: true });

  if (staffId && staffId !== "ALL") {
    query = query.eq("staff_id", staffId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((a) => ({
    id: a.id,
    booking_code: a.booking_code,
    start_datetime: a.start_datetime,
    end_datetime: a.end_datetime,
    appointment_status: a.appointment_status,
    amount: Number(a.amount),
    services: Array.isArray(a.services) ? a.services[0] : a.services,
    staff: Array.isArray(a.staff) ? a.staff[0] : a.staff,
    profiles: Array.isArray(a.profiles) ? a.profiles[0] : a.profiles,
  }));
}

// ============================================================================
// 5. CUSTOMER MANAGEMENT
// ============================================================================
export async function getAdminCustomers(searchQuery?: string) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return [];

  const supabase = await createClient();
  const q = supabase
    .from("profiles")
    .select("*, appointments(id, amount, appointment_status, start_datetime)")
    .order("created_at", { ascending: false });

  const { data, error } = await q;
  if (error || !data) return [];

  let list = data.map((cust) => {
    const apps = cust.appointments || [];
    const completedApps = apps.filter((a: { appointment_status: string }) => a.appointment_status === "COMPLETED");
    const totalSpent = completedApps.reduce((sum: number, a: { amount: number }) => sum + Number(a.amount || 0), 0);
    return {
      ...cust,
      totalAppointments: apps.length,
      completedAppointments: completedApps.length,
      totalSpent,
    };
  });

  if (searchQuery?.trim()) {
    const s = searchQuery.toLowerCase();
    list = list.filter(
      (c) =>
        c.full_name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.phone && c.phone.toLowerCase().includes(s))
    );
  }

  return list;
}

export async function getAdminCustomerDetails(customerId: string) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, appointments(*, services(name), staff(full_name)), reviews(*)")
    .eq("id", customerId)
    .single();

  return profile || null;
}

// ============================================================================
// 6. STAFF MANAGEMENT & SPECIALTIES
// ============================================================================
export async function getAdminStaffList() {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return [];

  const supabase = await createClient();
  const { data: staffList, error } = await supabase
    .from("staff")
    .select("*, staff_services(service_id, services(id, name)), staff_working_hours(*), staff_breaks(*), staff_leaves(*)")
    .order("created_at", { ascending: true });

  if (error || !staffList) return [];
  return staffList;
}

export async function saveAdminStaff(input: StaffInput) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const validated = StaffInputSchema.safeParse(input);
  if (!validated.success) {
    return { error: "INVALID_INPUT", message: validated.error.issues[0]?.message || "Invalid staff details" };
  }

  const { id, fullName, roleTitle, bio, phone, photoUrl, isActive, serviceIds } = validated.data;
  const supabase = await createClient();

  let staffId = id;

  if (staffId) {
    // Update existing staff
    const { error: updateError } = await supabase
      .from("staff")
      .update({
        full_name: fullName.trim(),
        role_title: roleTitle.trim(),
        bio: bio?.trim() || null,
        phone: phone?.trim() || null,
        photo_url: photoUrl || null,
        is_active: isActive,
      })
      .eq("id", staffId);

    if (updateError) return { error: "UPDATE_FAILED", message: updateError.message };
  } else {
    // Insert new staff
    const { data: newStaff, error: insertError } = await supabase
      .from("staff")
      .insert({
        full_name: fullName.trim(),
        role_title: roleTitle.trim(),
        bio: bio?.trim() || null,
        phone: phone?.trim() || null,
        photo_url: photoUrl || null,
        is_active: isActive,
      })
      .select("id")
      .single();

    if (insertError || !newStaff) return { error: "INSERT_FAILED", message: insertError?.message || "Failed to create staff" };
    staffId = newStaff.id;
  }

  // Update staff services assignments (Many-to-many)
  if (serviceIds && staffId) {
    await supabase.from("staff_services").delete().eq("staff_id", staffId);
    if (serviceIds.length > 0) {
      const staffServiceRows = serviceIds.map((sId) => ({
        staff_id: staffId,
        service_id: sId,
      }));
      await supabase.from("staff_services").insert(staffServiceRows);
    }
  }

  return { success: true, message: "Staff record saved successfully." };
}

export async function saveStaffWorkingHours(staffId: string, hours: Array<{ day_of_week: number; is_working: boolean; start_time: string; end_time: string }>) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const supabase = await createClient();

  for (const h of hours) {
    const { error } = await supabase
      .from("staff_working_hours")
      .upsert({
        staff_id: staffId,
        day_of_week: h.day_of_week,
        is_working: h.is_working,
        start_time: h.start_time,
        end_time: h.end_time,
      }, { onConflict: "staff_id,day_of_week" });

    if (error) return { error: "UPDATE_FAILED", message: error.message };
  }

  return { success: true, message: "Staff working hours updated." };
}

// ============================================================================
// 7. SERVICES & CATEGORIES MANAGEMENT
// ============================================================================
export async function getAdminServices() {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return [];

  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*, service_categories(name)")
    .order("created_at", { ascending: true });

  return services || [];
}

export async function getAdminCategories() {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return [];

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("service_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return categories || [];
}

export async function saveAdminService(input: ServiceInput) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const validated = ServiceInputSchema.safeParse(input);
  if (!validated.success) {
    return { error: "INVALID_INPUT", message: validated.error.issues[0]?.message || "Invalid service details" };
  }

  const { id, categoryId, name, description, price, durationMinutes, imageUrl, isActive } = validated.data;
  const supabase = await createClient();

  if (id) {
    const { error } = await supabase
      .from("services")
      .update({
        category_id: categoryId,
        name: name.trim(),
        description: description?.trim() || null,
        price,
        duration_minutes: durationMinutes,
        image_url: imageUrl || null,
        is_active: isActive,
      })
      .eq("id", id);

    if (error) return { error: "UPDATE_FAILED", message: error.message };
  } else {
    const { error } = await supabase.from("services").insert({
      category_id: categoryId,
      name: name.trim(),
      description: description?.trim() || null,
      price,
      duration_minutes: durationMinutes,
      image_url: imageUrl || null,
      is_active: isActive,
    });

    if (error) return { error: "INSERT_FAILED", message: error.message };
  }

  return { success: true, message: "Service saved successfully." };
}

export async function saveAdminCategory(input: CategoryInput) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const validated = CategoryInputSchema.safeParse(input);
  if (!validated.success) {
    return { error: "INVALID_INPUT", message: validated.error.issues[0]?.message || "Invalid category details" };
  }

  const { id, name, description, sortOrder, isActive } = validated.data;
  const supabase = await createClient();

  if (id) {
    const { error } = await supabase
      .from("service_categories")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        sort_order: sortOrder,
        is_active: isActive,
      })
      .eq("id", id);

    if (error) return { error: "UPDATE_FAILED", message: error.message };
  } else {
    const { error } = await supabase.from("service_categories").insert({
      name: name.trim(),
      description: description?.trim() || null,
      sort_order: sortOrder,
      is_active: isActive,
    });

    if (error) return { error: "INSERT_FAILED", message: error.message };
  }

  return { success: true, message: "Service category saved successfully." };
}

// ============================================================================
// 8. REVIEWS MODERATION
// ============================================================================
export async function getAdminReviews(filters?: { status?: string; rating?: number }) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return [];

  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*, profiles(full_name, email, avatar_url), appointments(booking_code, services(name), staff(full_name))")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "ALL") {
    query = query.eq("moderation_status", filters.status);
  }

  if (filters?.rating && filters.rating > 0) {
    query = query.eq("rating", filters.rating);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

export async function updateAdminReviewModeration(reviewId: string, status: "APPROVED" | "REJECTED" | "PENDING") {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ moderation_status: status })
    .eq("id", reviewId);

  if (error) return { error: "UPDATE_FAILED", message: error.message };
  return { success: true, message: `Review status updated to ${status}.` };
}

// ============================================================================
// 9. OFFERS / COUPONS
// ============================================================================
export async function getAdminCoupons() {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return [];

  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return coupons || [];
}

export async function saveAdminCoupon(input: CouponInput) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const validated = CouponInputSchema.safeParse(input);
  if (!validated.success) {
    return { error: "INVALID_INPUT", message: validated.error.issues[0]?.message || "Invalid coupon details" };
  }

  const { id, code, discountType, discountValue, minimumAmount, validFrom, validUntil, usageLimit, isActive } = validated.data;
  const supabase = await createClient();

  if (id) {
    const { error } = await supabase
      .from("coupons")
      .update({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: discountValue,
        minimum_amount: minimumAmount,
        valid_from: validFrom,
        valid_until: validUntil,
        usage_limit: usageLimit || null,
        is_active: isActive,
      })
      .eq("id", id);

    if (error) return { error: "UPDATE_FAILED", message: error.message };
  } else {
    const { error } = await supabase.from("coupons").insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      minimum_amount: minimumAmount,
      valid_from: validFrom,
      valid_until: validUntil,
      usage_limit: usageLimit || null,
      is_active: isActive,
    });

    if (error) return { error: "INSERT_FAILED", message: error.message };
  }

  return { success: true, message: "Coupon saved successfully." };
}

// ============================================================================
// 10. PAYMENTS RECORDS VIEW
// ============================================================================
export async function getAdminPayments() {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return [];

  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*, appointments(booking_code, amount, services(name), profiles!appointments_customer_id_fkey(full_name, email))")
    .order("created_at", { ascending: false });

  return payments || [];
}

// ============================================================================
// 11. SALON SETTINGS, BUSINESS HOURS & CLOSURES
// ============================================================================
export async function getAdminSettingsData() {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return null;

  const supabase = await createClient();
  const { data: settings } = await supabase.from("salon_settings").select("*").single();
  const { data: hours } = await supabase.from("business_hours").select("*").order("day_of_week", { ascending: true });
  const { data: closures } = await supabase.from("salon_closures").select("*").order("start_datetime", { ascending: false });

  return {
    settings: settings || null,
    hours: hours || [],
    closures: closures || [],
  };
}

export async function saveAdminSettings(input: SalonSettingsInput) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const validated = SalonSettingsInputSchema.safeParse(input);
  if (!validated.success) {
    return { error: "INVALID_INPUT", message: validated.error.issues[0]?.message || "Invalid settings data" };
  }

  const { salonName, address, phone, email, cancellationPolicy, bookingIntervalMinutes } = validated.data;
  const supabase = await createClient();

  const { data: existing } = await supabase.from("salon_settings").select("id").limit(1).single();

  if (existing) {
    const { error } = await supabase
      .from("salon_settings")
      .update({
        salon_name: salonName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        cancellation_policy: cancellationPolicy?.trim() || null,
        booking_interval_minutes: bookingIntervalMinutes,
      })
      .eq("id", existing.id);

    if (error) return { error: "UPDATE_FAILED", message: error.message };
  } else {
    const { error } = await supabase.from("salon_settings").insert({
      salon_name: salonName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      cancellation_policy: cancellationPolicy?.trim() || null,
      booking_interval_minutes: bookingIntervalMinutes,
    });

    if (error) return { error: "INSERT_FAILED", message: error.message };
  }

  return { success: true, message: "Salon settings updated successfully." };
}

export async function saveAdminBusinessHours(hours: Array<{ day_of_week: number; is_open: boolean; open_time: string; close_time: string }>) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const supabase = await createClient();

  for (const h of hours) {
    const { error } = await supabase
      .from("business_hours")
      .upsert({
        day_of_week: h.day_of_week,
        is_open: h.is_open,
        open_time: h.open_time,
        close_time: h.close_time,
      }, { onConflict: "day_of_week" });

    if (error) return { error: "UPDATE_FAILED", message: error.message };
  }

  return { success: true, message: "Operating hours updated successfully." };
}

export async function saveAdminClosure(input: SalonClosureInput) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const validated = SalonClosureInputSchema.safeParse(input);
  if (!validated.success) {
    return { error: "INVALID_INPUT", message: validated.error.issues[0]?.message || "Invalid closure details" };
  }

  const { startDatetime, endDatetime, reason } = validated.data;
  const supabase = await createClient();

  const { error } = await supabase.from("salon_closures").insert({
    start_datetime: startDatetime,
    end_datetime: endDatetime,
    reason: reason.trim(),
  });

  if (error) return { error: "INSERT_FAILED", message: error.message };
  return { success: true, message: "Salon holiday closure added." };
}

export async function deleteAdminClosure(closureId: string) {
  const authCheck = await requireAdminRole();
  if (!authCheck.authorized) return { error: "UNAUTHORIZED", message: "Admin permission required." };

  const supabase = await createClient();
  const { error } = await supabase.from("salon_closures").delete().eq("id", closureId);

  if (error) return { error: "DELETE_FAILED", message: error.message };
  return { success: true, message: "Salon closure removed." };
}

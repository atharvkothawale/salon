import { createClient } from "@/lib/supabase/server";
import { SALON_CONFIG } from "@/lib/constants/theme";

export async function getSalonSettings() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("salon_settings")
      .select("*")
      .limit(1)
      .single();

    if (error || !data) {
      return {
        salon_name: SALON_CONFIG.name,
        logo_url: null,
        address: SALON_CONFIG.contact.address,
        phone: SALON_CONFIG.contact.phone,
        email: SALON_CONFIG.contact.email,
        cancellation_policy: "Cancellations allowed up to 24 hours prior to appointment.",
        booking_interval_minutes: 30,
      };
    }

    return data;
  } catch {
    return {
      salon_name: SALON_CONFIG.name,
      logo_url: null,
      address: SALON_CONFIG.contact.address,
      phone: SALON_CONFIG.contact.phone,
      email: SALON_CONFIG.contact.email,
      cancellation_policy: "Cancellations allowed up to 24 hours prior to appointment.",
      booking_interval_minutes: 30,
    };
  }
}

export async function getBusinessHours() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("business_hours")
      .select("*")
      .order("day_of_week", { ascending: true });

    if (error || !data || data.length === 0) {
      // Fallback default hours
      return [
        { day_of_week: 1, is_open: true, open_time: "09:00:00", close_time: "20:00:00" },
        { day_of_week: 2, is_open: true, open_time: "09:00:00", close_time: "20:00:00" },
        { day_of_week: 3, is_open: true, open_time: "09:00:00", close_time: "20:00:00" },
        { day_of_week: 4, is_open: true, open_time: "09:00:00", close_time: "20:00:00" },
        { day_of_week: 5, is_open: true, open_time: "09:00:00", close_time: "20:00:00" },
        { day_of_week: 6, is_open: true, open_time: "10:00:00", close_time: "18:00:00" },
        { day_of_week: 0, is_open: false, open_time: "10:00:00", close_time: "16:00:00" },
      ];
    }

    return data;
  } catch {
    return [];
  }
}

export async function getServiceCategories() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getActiveServices(categoryId?: string) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("services")
      .select("*, service_categories(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getServiceById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*, service_categories(name)")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getActiveStaff() {
  try {
    const supabase = await createClient();
    const { data: staffMembers, error: staffError } = await supabase
      .from("staff")
      .select("*, staff_services(services(name))")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (staffError || !staffMembers) return [];
    return staffMembers;
  } catch {
    return [];
  }
}

export async function getApprovedReviews() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(full_name, avatar_url)")
      .eq("moderation_status", "APPROVED")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

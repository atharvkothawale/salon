"use server";

import { createClient } from "@/lib/supabase/server";
import { UpdateProfileSchema, UpdateProfileInput } from "@/schemas/appointment";

export async function updateCustomerProfile(input: UpdateProfileInput) {
  const validated = UpdateProfileSchema.safeParse(input);
  if (!validated.success) {
    return {
      error: "INVALID_INPUT",
      message: validated.error.issues[0]?.message || "Invalid profile input",
    };
  }

  const { fullName, phone, avatarUrl } = validated.data;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "UNAUTHORIZED", message: "Please sign in to update your profile." };
  }

  // Security: Whitelist editable fields only (role/id/email cannot be modified)
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName.trim(),
      phone: phone?.trim() || null,
      avatar_url: avatarUrl || null,
    })
    .eq("id", user.id);

  if (updateError) {
    return { error: "UPDATE_FAILED", message: updateError.message || "Failed to update profile." };
  }

  return { success: true, message: "Profile details updated successfully." };
}

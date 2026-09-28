"use server";

import { createClient } from "@/lib/supabase/server";
import { RegisterSchema, LoginSchema, RegisterInput, LoginInput } from "@/schemas/auth";
import { redirect } from "next/navigation";

export async function registerUser(input: RegisterInput) {
  const validated = RegisterSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input data" };
  }

  const { fullName, email, phone, password } = validated.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || null,
        // SECURITY REQUIREMENT: Role is strictly forced in the DB trigger handle_new_user()
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, user: data.user };
}

export async function loginUser(input: LoginInput) {
  const validated = LoginSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid credentials" };
  }

  const { email, password } = validated.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, user: data.user };
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

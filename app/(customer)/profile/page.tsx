import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/actions/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/customer/profile-form";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "My Profile",
  description: `Manage your personal details and avatar at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic user route

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login?redirect=/profile");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      <PageHeader
        title="Account Profile"
        description="Manage your personal account details, phone number, and profile photo."
      />

      <ProfileForm profile={profile} />
    </div>
  );
}

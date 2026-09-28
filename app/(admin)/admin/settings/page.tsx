import React from "react";
import { Metadata } from "next";
import { getAdminSettingsData } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { AdminSettingsManager } from "@/components/admin/admin-settings-manager";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: `Salon information, business operating hours, and holiday closures at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic admin data

export default async function AdminSettingsPage() {
  const data = await getAdminSettingsData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Salon Settings & Operating Hours"
        description="Configure salon profile information, weekly business hours, booking intervals, and holiday closures."
      />

      <AdminSettingsManager
        initialSettings={data?.settings || null}
        initialHours={data?.hours || []}
        initialClosures={data?.closures || []}
      />
    </div>
  );
}

import React from "react";
import { Metadata } from "next";
import { getAdminServices, getAdminCategories } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { AdminServicesManager } from "@/components/admin/admin-services-manager";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Services",
  description: `Treatment catalog, service categories, pricing, and duration setup at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic admin data

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([
    getAdminServices(),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Services & Categories"
        description="Configure salon treatment catalog, categories, authoritative price metrics, durations, and active booking availability."
      />

      <AdminServicesManager
        initialServices={services}
        initialCategories={categories}
      />
    </div>
  );
}

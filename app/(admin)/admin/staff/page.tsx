import React from "react";
import { Metadata } from "next";
import { getAdminStaffList, getAdminServices } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { AdminStaffManager } from "@/components/admin/admin-staff-manager";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Staff Management",
  description: `Stylist roster, service qualifications, and shift hours at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic admin data

export default async function AdminStaffPage() {
  const [staffList, servicesList] = await Promise.all([
    getAdminStaffList(),
    getAdminServices(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Stylist & Staff Roster"
        description="Manage salon team profiles, active status, treatment service qualifications, and weekly working shifts."
      />

      <AdminStaffManager
        initialStaffList={staffList}
        allServices={servicesList}
      />
    </div>
  );
}

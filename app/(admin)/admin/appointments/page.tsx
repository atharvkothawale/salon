import React from "react";
import { Metadata } from "next";
import { getAdminAppointments, getAdminStaffList, getAdminServices } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { AdminAppointmentsManager } from "@/components/admin/admin-appointments-manager";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Appointments",
  description: `Manage salon appointment reservations, confirmations, and audit logs at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic admin data

export default async function AdminAppointmentsPage() {
  const [appointments, staffList, servicesList] = await Promise.all([
    getAdminAppointments(),
    getAdminStaffList(),
    getAdminServices(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Appointment Management"
        description="Search, filter, inspect authoritative details, manage reservation statuses, and audit activity history."
      />

      <AdminAppointmentsManager
        initialAppointments={appointments}
        staffList={staffList}
        servicesList={servicesList}
      />
    </div>
  );
}

import React from "react";
import { Metadata } from "next";
import { startOfWeek, endOfWeek, addDays } from "date-fns";
import { getAdminCalendarAppointments, getAdminStaffList } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { AdminCalendarView } from "@/components/admin/admin-calendar-view";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Calendar",
  description: `Salon schedule, staff shift calendar, and booking timeline at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic operational data

export default async function AdminCalendarPage() {
  const now = new Date();
  const startDate = addDays(startOfWeek(now, { weekStartsOn: 1 }), -14).toISOString();
  const endDate = addDays(endOfWeek(now, { weekStartsOn: 1 }), 14).toISOString();

  const [appointments, staffList] = await Promise.all([
    getAdminCalendarAppointments(startDate, endDate),
    getAdminStaffList(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Salon Schedule & Calendar"
        description="Visual day and week scheduling timeline for all appointments, stylist shifts, and treatment assignments."
      />

      <AdminCalendarView
        initialAppointments={appointments}
        staffList={staffList}
      />
    </div>
  );
}

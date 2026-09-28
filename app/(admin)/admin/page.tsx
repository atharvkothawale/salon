import React from "react";
import { Metadata } from "next";
import { getAdminDashboardMetrics } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardView } from "@/components/admin/dashboard-view";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: `Salon operations, appointment metrics, and revenue overview for ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic operational data

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operational Dashboard"
        description="Daily overview of appointment reservations, revenue breakdown, stylist assignments, and operational alerts."
      />

      {metrics ? (
        <DashboardView metrics={metrics} />
      ) : (
        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
          Unable to load dashboard metrics. Please check admin authorization.
        </div>
      )}
    </div>
  );
}

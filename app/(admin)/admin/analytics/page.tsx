import React from "react";
import { Metadata } from "next";
import { getAdminDashboardMetrics, getAdminAppointments } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { SALON_CONFIG } from "@/lib/constants/theme";
import { formatINR } from "@/lib/utils";
import { BarChart3, TrendingUp, DollarSign, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Analytics",
  description: `Performance metrics, operational breakdown, and revenue analytics for ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic data

export default async function AdminAnalyticsPage() {
  const [metrics, appointments] = await Promise.all([
    getAdminDashboardMetrics(),
    getAdminAppointments(),
  ]);

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter((a) => a.appointment_status === "COMPLETED");
  const totalRevenue = completedAppointments.reduce((sum, a) => sum + Number(a.amount || 0), 0);

  // Group by service
  const serviceStats: Record<string, { count: number; total: number }> = {};
  appointments.forEach((a) => {
    const sName = a.services?.name || "Unspecified Service";
    if (!serviceStats[sName]) serviceStats[sName] = { count: 0, total: 0 };
    serviceStats[sName].count += 1;
    if (a.appointment_status === "COMPLETED" || a.payment_status === "PAID") {
      serviceStats[sName].total += Number(a.amount || 0);
    }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operational Analytics & Performance"
        description="Comprehensive analysis of salon reservation volume, completed treatment revenue, and service popularity."
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-border bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">All-Time Revenue</span>
            <DollarSign className="h-4 w-4 text-accent" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">
            {formatINR(totalRevenue)}
          </p>
          <p className="text-[10px] text-muted-foreground">From {completedAppointments.length} completed sessions</p>
        </Card>

        <Card className="p-5 border-border bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Booking Volume</span>
            <Calendar className="h-4 w-4 text-accent" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">{totalAppointments}</p>
          <p className="text-[10px] text-muted-foreground">All historical reservations</p>
        </Card>

        <Card className="p-5 border-border bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Run-Rate</span>
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">
            {formatINR(metrics?.revenue.month || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">Current month completed revenue</p>
        </Card>
      </div>

      {/* Popular Treatments Table */}
      <Card className="p-6 border-border bg-card space-y-4">
        <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" /> Treatment Popularity Breakdown
        </h3>

        {Object.keys(serviceStats).length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No service activity recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 text-xs">
            {Object.entries(serviceStats).map(([sName, stat]) => (
              <div key={sName} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                <div>
                  <p className="font-semibold text-foreground">{sName}</p>
                  <p className="text-muted-foreground text-[11px]">{stat.count} reservation(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-serif font-bold text-foreground">
                    {formatINR(stat.total)}
                  </p>
                  <p className="text-[10px] text-accent font-semibold">Recorded Revenue</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

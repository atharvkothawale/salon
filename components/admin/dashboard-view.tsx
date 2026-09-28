"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Users,
  UserCheck,
  Scissors,
  ArrowRight,
} from "lucide-react";

interface DashboardViewProps {
  metrics: {
    todayMetrics: {
      total: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      noShow: number;
    };
    revenue: {
      today: number;
      month: number;
    };
    alerts: {
      pendingReviews: number;
      todayPendingAppointments: number;
    };
    upcomingSessions: Array<{
      id: string;
      booking_code: string;
      start_datetime: string;
      appointment_status: string;
      amount: number;
      services?: { name: string; duration_minutes: number } | null;
      staff?: { full_name: string } | null;
      profiles?: { full_name: string; phone: string | null } | null;
    }>;
  };
}

export function DashboardView({ metrics }: DashboardViewProps) {
  const { todayMetrics, revenue, alerts, upcomingSessions } = metrics;

  return (
    <div className="space-y-8">
      {/* Revenue & Today's Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <Card className="p-5 border-border bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-serif text-2xl font-bold text-foreground">
              {formatINR(revenue.today)}
            </span>
            <span className="text-[10px] text-muted-foreground">Recorded Payments</span>
          </div>
        </Card>

        {/* Month Revenue */}
        <Card className="p-5 border-border bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Month Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-serif text-2xl font-bold text-foreground">
              {formatINR(revenue.month)}
            </span>
            <span className="text-[10px] text-muted-foreground">Current Month</span>
          </div>
        </Card>

        {/* Today's Total Appointments */}
        <Card className="p-5 border-border bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Sessions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-serif text-2xl font-bold text-foreground">{todayMetrics.total}</span>
            <span className="text-[10px] text-accent font-medium">
              {todayMetrics.confirmed} Confirmed
            </span>
          </div>
        </Card>

        {/* Completed vs Cancelled */}
        <Card className="p-5 border-border bg-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Status</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-foreground font-bold">{todayMetrics.completed} Completed</span>
            <span className="text-destructive font-medium">{todayMetrics.cancelled} Cancelled</span>
          </div>
        </Card>
      </div>

      {/* Operational Alerts Bar */}
      {(alerts.pendingReviews > 0 || alerts.todayPendingAppointments > 0) && (
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent shrink-0" />
            <span className="font-semibold text-foreground">Operational Action Needed:</span>
            <span className="text-muted-foreground">
              {alerts.todayPendingAppointments > 0 && `${alerts.todayPendingAppointments} unconfirmed session(s). `}
              {alerts.pendingReviews > 0 && `${alerts.pendingReviews} review(s) awaiting moderation.`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {alerts.pendingReviews > 0 && (
              <Link href="/admin/reviews">
                <Button variant="accent" size="sm" className="text-[11px] h-7 font-semibold">
                  Moderate Reviews
                </Button>
              </Link>
            )}
            {alerts.todayPendingAppointments > 0 && (
              <Link href="/admin/appointments?status=PENDING">
                <Button variant="outline" size="sm" className="text-[11px] h-7">
                  View Pending
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions Navigation Bar */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
          Quick Operational Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link href="/admin/appointments">
            <Card className="p-3.5 border-border bg-card hover:border-accent/40 transition-all flex items-center gap-3 cursor-pointer group">
              <CalendarDays className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Appointments</span>
            </Card>
          </Link>

          <Link href="/admin/calendar">
            <Card className="p-3.5 border-border bg-card hover:border-accent/40 transition-all flex items-center gap-3 cursor-pointer group">
              <Calendar className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Calendar View</span>
            </Card>
          </Link>

          <Link href="/admin/staff">
            <Card className="p-3.5 border-border bg-card hover:border-accent/40 transition-all flex items-center gap-3 cursor-pointer group">
              <UserCheck className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Staff Roster</span>
            </Card>
          </Link>

          <Link href="/admin/services">
            <Card className="p-3.5 border-border bg-card hover:border-accent/40 transition-all flex items-center gap-3 cursor-pointer group">
              <Scissors className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Services</span>
            </Card>
          </Link>

          <Link href="/admin/customers">
            <Card className="p-3.5 border-border bg-card hover:border-accent/40 transition-all flex items-center gap-3 cursor-pointer group">
              <Users className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Customers</span>
            </Card>
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            Upcoming Scheduled Sessions
          </h3>
          <Link href="/admin/appointments">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-accent font-semibold">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {upcomingSessions.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-border bg-card space-y-2">
            <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-semibold text-foreground">No Upcoming Sessions</h4>
            <p className="text-xs text-muted-foreground">There are no upcoming appointments scheduled at this moment.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.map((app) => {
              const startDate = new Date(app.start_datetime);
              const formattedDate = format(startDate, "MMM d, yyyy");
              const formattedTime = format(startDate, "h:mm a");

              return (
                <Card key={app.id} className="p-4 border-border bg-card space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-mono text-[10px] font-bold text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/20">
                      {app.booking_code}
                    </span>
                    <Badge
                      variant={app.appointment_status === "CONFIRMED" ? "accent" : "outline"}
                      className="text-[10px] font-semibold"
                    >
                      {app.appointment_status}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif text-sm font-semibold text-foreground truncate">
                      {app.services?.name || "Treatment"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Client: <span className="font-semibold text-foreground">{app.profiles?.full_name || "Guest"}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stylist: <span className="font-semibold text-foreground">{app.staff?.full_name || "Unassigned"}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                    <span>{formattedDate} at {formattedTime}</span>
                    <span className="font-semibold text-foreground">
                      {formatINR(app.amount)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";

import { formatINR } from "@/lib/utils";
import {
  Calendar,
  Clock,
  UserCheck,
  ArrowRight,
  Search,
  CheckCircle2,
  XCircle,
  MessageSquare,
  DollarSign,
  Tag,
} from "lucide-react";

interface AppointmentItem {
  id: string;
  booking_code: string;
  customer_id: string;
  staff_id: string | null;
  service_id: string;
  start_datetime: string;
  end_datetime: string;
  appointment_status: string;
  payment_status: string;
  payment_method: string;
  amount: number;
  notes: string | null;
  created_at: string;
  services?: {
    name: string;
    duration_minutes: number;
    image_url: string | null;
  } | null;
  staff?: {
    full_name: string;
    role_title: string;
    photo_url: string | null;
  } | null;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string | null;
    moderation_status: string;
  }> | null;
}

interface AppointmentsDashboardProps {
  appointments: AppointmentItem[];
}

type TabFilter = "all" | "upcoming" | "past" | "cancelled";

export function AppointmentsDashboard({ appointments }: AppointmentsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const now = new Date();

  const upcomingList = appointments.filter(
    (app) => new Date(app.start_datetime) >= now && app.appointment_status !== "CANCELLED"
  );
  const pastList = appointments.filter(
    (app) => new Date(app.start_datetime) < now && app.appointment_status !== "CANCELLED"
  );
  const cancelledList = appointments.filter(
    (app) => app.appointment_status === "CANCELLED"
  );

  const getFilteredAppointments = () => {
    let list: AppointmentItem[] = [];
    if (activeTab === "all") list = appointments;
    else if (activeTab === "upcoming") list = upcomingList;
    else if (activeTab === "past") list = pastList;
    else if (activeTab === "cancelled") list = cancelledList;

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(
      (app) =>
        app.booking_code.toLowerCase().includes(query) ||
        app.services?.name.toLowerCase().includes(query) ||
        app.staff?.full_name.toLowerCase().includes(query)
    );
  };

  const filteredAppointments = getFilteredAppointments();

  const defaultServiceImg =
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600";

  return (
    <div className="space-y-8">
      {/* Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-border">
        {/* Navigation Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-card rounded-xl border border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Sessions ({appointments.length})
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "upcoming"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upcoming ({upcomingList.length})
          </button>

          <button
            onClick={() => setActiveTab("past")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "past"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Past ({pastList.length})
          </button>

          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "cancelled"
                ? "bg-accent text-accent-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cancelled ({cancelledList.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search service, stylist, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-card"
          />
        </div>
      </div>

      {/* Appointments List Grid */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          title={
            searchQuery
              ? "No matching reservations found"
              : activeTab === "upcoming"
              ? "No Upcoming Appointments"
              : activeTab === "past"
              ? "No Past Treatment History"
              : activeTab === "cancelled"
              ? "No Cancelled Appointments"
              : "No Reservations Found"
          }
          description={
            searchQuery
              ? `No appointments match "${searchQuery}". Try clearing your search query.`
              : "Schedule your next treatment at Lumière Salon & Spa in just a few clicks."
          }
          actionLabel="Book Appointment Now"
          onAction={undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAppointments.map((app) => {
            const startDate = new Date(app.start_datetime);
            const formattedDate = format(startDate, "EEEE, MMM d, yyyy");
            const formattedTime = format(startDate, "h:mm a");
            const isUpcoming = new Date(app.start_datetime) >= now && app.appointment_status !== "CANCELLED";
            const isCancelled = app.appointment_status === "CANCELLED";
            const isCompleted = app.appointment_status === "COMPLETED";
            const hasReview = app.reviews && app.reviews.length > 0;

            return (
              <Card
                key={app.id}
                className={`border-border bg-card p-5 space-y-4 transition-all shadow-xs hover:border-accent/40 ${
                  isCancelled ? "opacity-75" : ""
                }`}
              >
                {/* Header: Booking Code & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] font-bold tracking-wider text-accent border-accent/30 bg-accent/5"
                    >
                      <Tag className="h-3 w-3 mr-1 text-accent" />
                      {app.booking_code}
                    </Badge>
                  </div>

                  <Badge
                    variant={
                      isCancelled
                        ? "destructive"
                        : isCompleted
                        ? "accent"
                        : isUpcoming
                        ? "accent"
                        : "outline"
                    }
                    className="text-[10px] font-semibold px-2.5 py-0.5"
                  >
                    {app.appointment_status}
                  </Badge>
                </div>

                {/* Body: Service & Stylist Info */}
                <div className="flex gap-4 items-center">
                  <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary border border-border">
                    <Image
                      src={app.services?.image_url || defaultServiceImg}
                      alt={app.services?.name || "Service"}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <h4 className="font-serif text-base font-semibold text-foreground truncate">
                      {app.services?.name || "Salon Treatment"}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <UserCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span>{app.staff?.full_name || "Any Available Stylist"}</span>
                    </p>
                  </div>
                </div>

                {/* Details Bar: Date, Time, Duration & Authoritative Price */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-secondary/50 border border-border/60 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-accent" />
                      Date & Time
                    </span>
                    <p className="font-semibold text-foreground text-[11px]">{formattedDate}</p>
                    <p className="text-[11px] text-accent font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formattedTime} ({app.services?.duration_minutes || 30} Mins)
                    </p>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-end gap-1">
                      <DollarSign className="h-3 w-3 text-accent" />
                      Authoritative Price
                    </span>
                    <p className="font-serif text-sm font-bold text-foreground">
                      {formatINR(app.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {app.payment_method.replace(/_/g, " ").toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/80 text-xs">
                  <div className="flex items-center gap-2">
                    {isCompleted && !hasReview && (
                      <Link href={`/appointments/${app.id}`}>
                        <Button variant="accent" size="sm" className="text-[11px] h-7 px-2.5 font-semibold gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Leave Review
                        </Button>
                      </Link>
                    )}

                    {isCompleted && hasReview && (
                      <span className="text-[10px] font-medium text-accent flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" />
                        Reviewed
                      </span>
                    )}

                    {isCancelled && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-destructive" />
                        Cancelled
                      </span>
                    )}
                  </div>

                  <Link href={`/appointments/${app.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                      <span>View Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

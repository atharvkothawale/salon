"use client";

import React, { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  User,
} from "lucide-react";

interface CalendarAppointment {
  id: string;
  booking_code: string;
  start_datetime: string;
  end_datetime: string;
  appointment_status: string;
  amount: number;
  services?: { name: string; duration_minutes: number } | null;
  staff?: { id: string; full_name: string } | null;
  profiles?: { full_name: string; phone: string | null } | null;
}

interface StaffOption {
  id: string;
  full_name: string;
}

interface AdminCalendarViewProps {
  initialAppointments: CalendarAppointment[];
  staffList: StaffOption[];
}

export function AdminCalendarView({ initialAppointments, staffList }: AdminCalendarViewProps) {
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => addDays(prev, viewMode === "day" ? -1 : -7));
  };

  const handleNext = () => {
    setCurrentDate((prev) => addDays(prev, viewMode === "day" ? 1 : 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter appointments
  const filteredAppointments = initialAppointments.filter((app) => {
    if (selectedStaffId !== "ALL" && app.staff?.id !== selectedStaffId) {
      return false;
    }
    return true;
  });

  // Calculate days to show
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const daysToShow =
    viewMode === "day"
      ? [currentDate]
      : Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <Card className="p-4 border-border bg-card space-y-4 sm:space-y-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday} className="text-xs font-semibold">
            Today
          </Button>

          <div className="flex items-center gap-1 border border-border rounded-md bg-background">
            <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-semibold px-2 min-w-32 text-center">
              {viewMode === "day"
                ? format(currentDate, "EEEE, MMM d, yyyy")
                : `${format(daysToShow[0], "MMM d")} – ${format(daysToShow[6], "MMM d, yyyy")}`}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Staff Selector */}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-accent" /> Staff:
            </Label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="text-xs h-8 rounded-md border border-border bg-background px-2.5 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Stylists</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-background rounded-md border border-border">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === "day" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === "week" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </Card>

      {/* Calendar Grid View */}
      <Card className="border-border bg-card overflow-x-auto p-4">
        <div className="min-w-[700px]">
          {/* Days Header */}
          <div className={`grid gap-2 pb-3 border-b border-border ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"}`}>
            {daysToShow.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2.5 rounded-lg text-center ${
                    isToday ? "bg-accent/10 border border-accent/30 text-accent font-bold" : "bg-secondary/40 text-foreground"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {format(day, "EEE")}
                  </p>
                  <p className="font-serif text-sm font-semibold">{format(day, "MMM d")}</p>
                </div>
              );
            })}
          </div>

          {/* Days Column Body */}
          <div className={`grid gap-2 pt-3 ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"}`}>
            {daysToShow.map((day) => {
              const dayApps = filteredAppointments.filter((app) =>
                isSameDay(new Date(app.start_datetime), day)
              );

              return (
                <div
                  key={day.toISOString()}
                  className="min-h-[400px] border border-border/60 rounded-xl bg-background/50 p-2 space-y-2"
                >
                  {dayApps.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4 text-center">
                      <p className="text-[11px] text-muted-foreground italic">No sessions</p>
                    </div>
                  ) : (
                    dayApps.map((app) => {
                      const startTimeStr = format(new Date(app.start_datetime), "h:mm a");
                      const isCancelled = app.appointment_status === "CANCELLED";

                      return (
                        <div
                          key={app.id}
                          className={`p-2.5 rounded-lg border text-xs space-y-1 transition-all ${
                            isCancelled
                              ? "bg-destructive/5 border-destructive/20 opacity-70"
                              : "bg-card border-border hover:border-accent/40 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-bold text-accent bg-accent/5 px-1.5 py-0.5 rounded">
                              {app.booking_code}
                            </span>
                            <Badge
                              variant={isCancelled ? "destructive" : "accent"}
                              className="text-[9px] px-1.5 py-0"
                            >
                              {app.appointment_status}
                            </Badge>
                          </div>

                          <p className="font-serif text-xs font-semibold text-foreground truncate">
                            {app.services?.name || "Treatment"}
                          </p>

                          <div className="space-y-0.5 text-[10px] text-muted-foreground">
                            <p className="flex items-center gap-1 font-semibold text-foreground">
                              <User className="h-3 w-3 text-accent shrink-0" />
                              <span className="truncate">{app.profiles?.full_name || "Guest"}</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{app.staff?.full_name || "Any Stylist"}</span>
                            </p>
                            <p className="flex items-center gap-1 text-accent font-medium pt-0.5">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>{startTimeStr} ({app.services?.duration_minutes || 30}m)</span>
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

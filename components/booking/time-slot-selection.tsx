"use client";

import React, { useState, useEffect } from "react";
import { AvailabilityResult, AnyStaffTimeSlot } from "@/services/availability/types";
import { Sun, Sunset, Moon, Loader2, AlertTriangle, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeSlotSelectionProps {
  serviceId: string;
  date: string;
  preferredStaffId: string | null;
  selectedTimeSlot: {
    time: string;
    displayTime: string;
    startTimeIso: string;
    endTimeIso: string;
    assignedStaffId?: string;
  } | null;
  onSelectSlot: (slot: {
    time: string;
    displayTime: string;
    startTimeIso: string;
    endTimeIso: string;
    assignedStaffId?: string;
  }) => void;
}

export function TimeSlotSelection({
  serviceId,
  date,
  preferredStaffId,
  selectedTimeSlot,
  onSelectSlot,
}: TimeSlotSelectionProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AvailabilityResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAvailability() {
      if (!serviceId || !date) return;
      setLoading(true);
      setError(null);
      try {
        const url = `/api/availability?serviceId=${encodeURIComponent(
          serviceId
        )}&date=${encodeURIComponent(date)}${
          preferredStaffId ? `&preferredStaffId=${encodeURIComponent(preferredStaffId)}` : ""
        }`;
        const res = await fetch(url);
        const json: AvailabilityResult = await res.json();
        if (!isMounted) return;
        if (!res.ok && json.reason) {
          setError(json.error || "Salon is closed or unavailable on this date.");
        } else {
          setData(json);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load time slot availability. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [serviceId, date, preferredStaffId]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const url = `/api/availability?serviceId=${encodeURIComponent(
      serviceId
    )}&date=${encodeURIComponent(date)}${
      preferredStaffId ? `&preferredStaffId=${encodeURIComponent(preferredStaffId)}` : ""
    }`;
    fetch(url)
      .then((res) => res.json())
      .then((json: AvailabilityResult) => {
        if (json.reason) {
          setError(json.error || "Salon is closed or unavailable on this date.");
        } else {
          setData(json);
        }
      })
      .catch(() => setError("Unable to load time slot availability."))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="py-12 text-center space-y-4 border border-dashed border-border rounded-xl bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">Checking Atelier Schedule...</p>
          <p className="text-[11px] text-muted-foreground">Calculating staff shifts, breaks, and buffer times</p>
        </div>
      </div>
    );
  }

  if (error || (data && !data.available && data.reason === "SALON_CLOSED")) {
    return (
      <div className="py-10 px-6 text-center space-y-4 border border-destructive/20 bg-destructive/5 rounded-xl">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">Salon Operating Alert</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {error || "The salon is closed or un-staffed on this selected date."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRetry} className="text-xs">
          Try Again
        </Button>
      </div>
    );
  }

  // Calculate slots to display
  let slotList: AnyStaffTimeSlot[] = [];

  if (preferredStaffId && data?.staff && data.staff.length > 0) {
    const singleStaff = data.staff[0];
    slotList = singleStaff.slots.map((s) => ({
      ...s,
      availableStaffIds: [singleStaff.staffId],
    }));
  } else if (data?.anyStaffSlots) {
    slotList = data.anyStaffSlots;
  }

  if (slotList.length === 0) {
    return (
      <div className="py-12 px-6 text-center space-y-4 border border-dashed border-border rounded-xl bg-card">
        <CalendarX className="h-8 w-8 text-muted-foreground mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">No Available Slots</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            All appointments are fully booked for this selection on {date}. Try selecting another date or stylist.
          </p>
        </div>
      </div>
    );
  }

  // Group slots into Morning (<12:00), Afternoon (12:00 - 17:00), Evening (>=17:00)
  const morning = slotList.filter((s) => parseInt(s.time.split(":")[0], 10) < 12);
  const afternoon = slotList.filter((s) => {
    const hour = parseInt(s.time.split(":")[0], 10);
    return hour >= 12 && hour < 17;
  });
  const evening = slotList.filter((s) => parseInt(s.time.split(":")[0], 10) >= 17);

  const renderSlotGroup = (title: string, icon: React.ReactNode, slots: AnyStaffTimeSlot[]) => {
    if (slots.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">
          {icon}
          <span>{title}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {slots.map((slot) => {
            const isSelected = selectedTimeSlot?.time === slot.time;
            const staffCount = slot.availableStaffIds.length;

            return (
              <button
                key={slot.time}
                type="button"
                onClick={() =>
                  onSelectSlot({
                    time: slot.time,
                    displayTime: slot.displayTime,
                    startTimeIso: slot.startTimeIso,
                    endTimeIso: slot.endTimeIso,
                    assignedStaffId: preferredStaffId || slot.availableStaffIds[0],
                  })
                }
                className={cn(
                  "flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer",
                  isSelected
                    ? "bg-accent text-accent-foreground border-accent ring-1 ring-accent font-semibold shadow-sm"
                    : "bg-card text-foreground border-border hover:border-accent/50 hover:bg-secondary/40"
                )}
              >
                <span className="text-xs font-semibold">{slot.displayTime}</span>
                {!preferredStaffId && staffCount > 0 && (
                  <span
                    className={cn(
                      "text-[9px] mt-0.5 opacity-80",
                      isSelected ? "text-accent-foreground" : "text-muted-foreground"
                    )}
                  >
                    {staffCount} {staffCount === 1 ? "stylist" : "stylists"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-base font-semibold text-foreground">Available Time Slots</h4>
        <span className="text-[11px] text-muted-foreground font-medium">
          {slotList.length} slots available
        </span>
      </div>

      <div className="space-y-6">
        {renderSlotGroup("Morning", <Sun className="h-4 w-4 text-amber-500" />, morning)}
        {renderSlotGroup("Afternoon", <Sunset className="h-4 w-4 text-accent" />, afternoon)}
        {renderSlotGroup("Evening", <Moon className="h-4 w-4 text-indigo-400" />, evening)}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  saveAdminSettings,
  saveAdminBusinessHours,
  saveAdminClosure,
  deleteAdminClosure,
} from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings, Clock, Calendar, CheckCircle2, AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";

interface SalonSettingsRecord {
  id?: string;
  salon_name: string;
  logo_url: string | null;
  address: string;
  phone: string;
  email: string;
  cancellation_policy: string | null;
  booking_interval_minutes: number;
}

interface BusinessHourRecord {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface SalonClosureRecord {
  id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
}

interface AdminSettingsManagerProps {
  initialSettings: SalonSettingsRecord | null;
  initialHours: BusinessHourRecord[];
  initialClosures: SalonClosureRecord[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AdminSettingsManager({
  initialSettings,
  initialHours,
  initialClosures,
}: AdminSettingsManagerProps) {
  const router = useRouter();

  // Settings State
  const [salonName, setSalonName] = useState(initialSettings?.salon_name || "Lumière Salon & Spa");
  const [address, setAddress] = useState(initialSettings?.address || "Baner, Pune, Maharashtra, India");
  const [phone, setPhone] = useState(initialSettings?.phone || "+91 90000 00000");
  const [email, setEmail] = useState(initialSettings?.email || "hello@lumieresalon.com");
  const [cancellationPolicy, setCancellationPolicy] = useState(
    initialSettings?.cancellation_policy || "Cancellations allowed up to 24 hours prior to appointment."
  );
  const [bookingInterval, setBookingInterval] = useState(initialSettings?.booking_interval_minutes || 30);

  // Hours State
  const [hoursState, setHoursState] = useState<BusinessHourRecord[]>(() => {
    return Array.from({ length: 7 }).map((_, day) => {
      const found = initialHours.find((h) => h.day_of_week === day);
      return (
        found || {
          day_of_week: day,
          is_open: day !== 0,
          open_time: "09:00:00",
          close_time: "20:00:00",
        }
      );
    });
  });

  // Closures State
  const [closures, setClosures] = useState<SalonClosureRecord[]>(initialClosures);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [closureStart, setClosureStart] = useState("");
  const [closureEnd, setClosureEnd] = useState("");
  const [closureReason, setClosureReason] = useState("");

  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [submittingHours, setSubmittingHours] = useState(false);
  const [submittingClosure, setSubmittingClosure] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Save Settings Submit
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmittingSettings(true);

    try {
      const res = await saveAdminSettings({
        salonName,
        address,
        phone,
        email,
        cancellationPolicy,
        bookingIntervalMinutes: bookingInterval,
      });

      if (res.error) {
        setMessage({ type: "error", text: res.message || "Failed to update salon settings." });
      } else {
        setMessage({ type: "success", text: res.message || "Salon settings updated successfully." });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred while saving settings." });
    } finally {
      setSubmittingSettings(false);
    }
  };

  // Save Operating Hours
  const handleSaveHours = async () => {
    setMessage(null);
    setSubmittingHours(true);

    try {
      const res = await saveAdminBusinessHours(hoursState);
      if (res.error) {
        setMessage({ type: "error", text: res.message });
      } else {
        setMessage({ type: "success", text: "Salon business hours saved. Dynamic availability engine updated." });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save operating hours." });
    } finally {
      setSubmittingHours(false);
    }
  };

  // Add Closure
  const handleAddClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmittingClosure(true);

    try {
      const res = await saveAdminClosure({
        startDatetime: `${closureStart}T00:00:00.000Z`,
        endDatetime: `${closureEnd}T23:59:59.999Z`,
        reason: closureReason,
      });

      if (res.error) {
        setMessage({ type: "error", text: res.message });
      } else {
        setMessage({ type: "success", text: "Salon closure added. Availability engine updated." });
        setIsClosureModalOpen(false);
        setClosureStart("");
        setClosureEnd("");
        setClosureReason("");
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to add holiday closure." });
    } finally {
      setSubmittingClosure(false);
    }
  };

  // Remove Closure
  const handleDeleteClosure = async (id: string) => {
    setMessage(null);
    try {
      const res = await deleteAdminClosure(id);
      if (res.error) {
        setMessage({ type: "error", text: res.message });
      } else {
        setMessage({ type: "success", text: "Salon closure removed." });
        setClosures((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete closure." });
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`flex items-center gap-2 p-3.5 text-xs rounded-lg border ${
            message.type === "success"
              ? "bg-accent/10 text-foreground border-accent/30"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Salon General Settings */}
      <Card className="p-6 border-border bg-card space-y-5">
        <div className="space-y-1 pb-4 border-b border-border">
          <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
            <Settings className="h-4 w-4 text-accent" /> Salon General Information
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure public salon brand profile, address, phone number, and cancellation terms.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-name" className="text-xs">Salon Name</Label>
              <Input
                id="s-name"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-phone" className="text-xs">Contact Phone</Label>
              <Input
                id="s-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-email" className="text-xs">Contact Email</Label>
              <Input
                id="s-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-addr" className="text-xs">Address</Label>
              <Input
                id="s-addr"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="s-policy" className="text-xs">Cancellation Policy</Label>
              <textarea
                id="s-policy"
                rows={2}
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                className="w-full rounded-md border border-border bg-background p-2.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-int" className="text-xs">Booking Slot Interval (Minutes)</Label>
              <Input
                id="s-int"
                type="number"
                step="5"
                min="5"
                max="120"
                value={bookingInterval}
                onChange={(e) => setBookingInterval(Number(e.target.value))}
                className="text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <Button variant="accent" size="sm" type="submit" disabled={submittingSettings} className="font-semibold gap-1.5">
              {submittingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Salon Info"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Business Operating Hours (Phase 4A Engine Integration) */}
      <Card className="p-6 border-border bg-card space-y-5">
        <div className="space-y-1 pb-4 border-b border-border">
          <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" /> Normal Business Operating Hours
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure default salon open/close times. Changes immediately update customer slot calculation in Phase 4A availability engine.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {hoursState.map((h, index) => (
            <div key={h.day_of_week} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30 gap-2">
              <div className="flex items-center gap-2.5 w-32">
                <input
                  type="checkbox"
                  checked={h.is_open}
                  onChange={(e) => {
                    const updated = [...hoursState];
                    updated[index].is_open = e.target.checked;
                    setHoursState(updated);
                  }}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span className="font-semibold text-foreground">{DAYS[h.day_of_week]}</span>
              </div>

              {h.is_open ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px]">Open:</span>
                  <Input
                    type="time"
                    value={h.open_time}
                    onChange={(e) => {
                      const updated = [...hoursState];
                      updated[index].open_time = e.target.value;
                      setHoursState(updated);
                    }}
                    className="text-xs h-8 w-28 bg-background"
                  />
                  <span className="text-muted-foreground text-[11px]">Close:</span>
                  <Input
                    type="time"
                    value={h.close_time}
                    onChange={(e) => {
                      const updated = [...hoursState];
                      updated[index].close_time = e.target.value;
                      setHoursState(updated);
                    }}
                    className="text-xs h-8 w-28 bg-background"
                  />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic font-medium">Salon Closed</span>
              )}
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <Button variant="accent" size="sm" onClick={handleSaveHours} disabled={submittingHours} className="font-semibold gap-1.5">
            {submittingHours ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Business Hours"}
          </Button>
        </div>
      </Card>

      {/* 3. Salon Holiday Closures */}
      <Card className="p-6 border-border bg-card space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" /> Salon Holiday & Exceptional Closures
            </h3>
            <p className="text-xs text-muted-foreground">
              Dates configured here prevent customer booking availability across all stylists.
            </p>
          </div>

          <Button variant="accent" size="sm" onClick={() => setIsClosureModalOpen(true)} className="font-semibold text-xs gap-1.5">
            <Plus className="h-4 w-4" /> Add Closure Date
          </Button>
        </div>

        {closures.length === 0 ? (
          <p className="text-xs text-muted-foreground italic bg-secondary/30 p-4 rounded-lg border border-border">
            No holiday closures scheduled.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {closures.map((cl) => (
              <div key={cl.id} className="p-3.5 rounded-lg border border-border bg-secondary/40 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">{cl.reason}</p>
                  <p className="text-accent text-[11px]">
                    {format(new Date(cl.start_datetime), "MMM d, yyyy")} – {format(new Date(cl.end_datetime), "MMM d, yyyy")}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClosure(cl.id)}
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Closure Modal */}
      <Dialog open={isClosureModalOpen} onOpenChange={setIsClosureModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-lg font-semibold">
              Add Salon Holiday Closure
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define closure start/end dates and reason for salon shutdown.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddClosure} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="cl-reason" className="text-xs">Closure Reason</Label>
              <Input
                id="cl-reason"
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                placeholder="e.g. National Holiday, Facility Maintenance..."
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cl-start" className="text-xs">Start Date</Label>
                <Input
                  id="cl-start"
                  type="date"
                  value={closureStart}
                  onChange={(e) => setClosureStart(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cl-end" className="text-xs">End Date</Label>
                <Input
                  id="cl-end"
                  type="date"
                  value={closureEnd}
                  onChange={(e) => setClosureEnd(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsClosureModalOpen(false)} disabled={submittingClosure}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" disabled={submittingClosure} className="font-semibold">
                {submittingClosure ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Closure"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

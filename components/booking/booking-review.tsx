"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Scissors, UserCheck, Calendar, Clock, User, ArrowLeft, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { createAppointment } from "@/lib/actions/appointments";
import { formatINR } from "@/lib/utils";

interface BookingReviewProps {
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  staffId: string | null;
  staffName: string;
  dateStr: string;
  startTimeIso: string;
  timeDisplay: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  onBack: () => void;
}

export function BookingReview({
  serviceId,
  serviceName,
  serviceDuration,
  servicePrice,
  staffId,
  staffName,
  dateStr,
  startTimeIso,
  timeDisplay,
  customerName,
  customerEmail,
  customerPhone,
  notes,
  onBack,
}: BookingReviewProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  let formattedDate = dateStr;
  if (dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    formattedDate = format(new Date(y, m - 1, d), "EEEE, MMMM d, yyyy");
  }

  const handleConfirmBooking = async () => {
    setServerError(null);
    setSubmitting(true);

    try {
      const res = await createAppointment({
        serviceId,
        staffId: staffId || null,
        date: dateStr,
        startTimeIso,
        notes: notes.trim() || undefined,
      });

      if (res.error) {
        setServerError(res.message || "Unable to complete reservation.");
        setSubmitting(false);
      } else if (res.success && res.appointmentId) {
        router.push(`/appointments/${res.appointmentId}`);
        router.refresh();
      }
    } catch {
      setServerError("An unexpected network error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-semibold text-foreground">Review Appointment Details</h3>
        <p className="text-xs text-muted-foreground">
          Please review your booking summary below before confirming your salon reservation.
        </p>
      </div>

      <Card className="border-border bg-card p-6 space-y-6 shadow-sm">
        {serverError && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{serverError}</span>
            </div>
            {serverError.includes("sign in") && (
              <Link href="/login?redirect=/book">
                <Button variant="outline" size="sm" className="text-xs shrink-0 border-destructive/30">
                  Sign In Now
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Service & Stylist Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5 text-accent" />
              Service Details
            </span>
            <p className="font-serif text-lg font-semibold text-foreground">{serviceName}</p>
            <p className="text-xs text-muted-foreground">{serviceDuration} Minutes Session</p>
            <p className="font-serif text-base font-bold text-foreground pt-1">
              {formatINR(servicePrice)}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-accent" />
              Stylist Choice
            </span>
            <p className="font-serif text-lg font-semibold text-foreground">{staffName}</p>
            <p className="text-xs text-muted-foreground">Assigned Haute Hair & Beauty Specialist</p>
          </div>
        </div>

        {/* Date & Time Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              Appointment Date
            </span>
            <p className="font-semibold text-foreground text-sm">{formattedDate}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent" />
              Start Time Slot
            </span>
            <p className="font-semibold text-accent text-sm">{timeDisplay}</p>
          </div>
        </div>

        {/* Customer Info Summary */}
        <div className="space-y-3 pb-6 border-b border-border">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-accent" />
            Customer Contact Information
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px]">Full Name</span>
              <span className="font-medium text-foreground">{customerName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Email Address</span>
              <span className="font-medium text-foreground">{customerEmail}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Phone Number</span>
              <span className="font-medium text-foreground">{customerPhone || "Not provided"}</span>
            </div>
          </div>
          {notes && (
            <div className="pt-2 text-xs">
              <span className="text-muted-foreground block text-[10px]">Special Requests / Notes</span>
              <p className="text-foreground/90 italic bg-secondary/40 p-2.5 rounded-md border border-border mt-1">
                &ldquo;{notes}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button variant="outline" size="sm" onClick={onBack} disabled={submitting} className="w-full sm:w-auto gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Customer Details
          </Button>

          <Button
            variant="accent"
            size="lg"
            onClick={handleConfirmBooking}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-6 font-semibold shadow-md gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Confirming Appointment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm & Create Reservation</span>
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

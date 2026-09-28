"use client";

import React, { useState } from "react";
import { CancellationDialog } from "@/components/customer/cancellation-dialog";
import { ReviewForm } from "@/components/customer/review-form";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, XCircle, ShieldAlert } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";

interface AppointmentDetailActionsProps {
  appointmentId: string;
  appointmentStatus: string;
  startDatetime: string;
  serviceName: string;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string | null;
    moderation_status: string;
  }> | null;
}

export function AppointmentDetailActions({
  appointmentId,
  appointmentStatus,
  startDatetime,
  serviceName,
  reviews,
}: AppointmentDetailActionsProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const startDate = new Date(startDatetime);
  const now = new Date();
  const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  const isEligibleForCancellation =
    (appointmentStatus === "CONFIRMED" || appointmentStatus === "PENDING") &&
    hoursUntilStart >= 24;

  const isTooLateForOnlineCancellation =
    (appointmentStatus === "CONFIRMED" || appointmentStatus === "PENDING") &&
    hoursUntilStart < 24;

  const existingReview = reviews && reviews.length > 0 ? reviews[0] : null;

  return (
    <div className="space-y-6 pt-4 border-t border-border">
      {/* Cancellation Option for Eligible Appointments */}
      {isEligibleForCancellation && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="space-y-0.5">
            <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Need to change your plans?
            </p>
            <p className="text-[11px] text-muted-foreground">
              Complimentary cancellation is available until 24 hours before your session.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsCancelDialogOpen(true)}
            className="text-xs shrink-0 font-semibold gap-1.5"
          >
            <XCircle className="h-4 w-4" />
            Cancel Appointment
          </Button>

          <CancellationDialog
            appointmentId={appointmentId}
            isOpen={isCancelDialogOpen}
            onClose={() => setIsCancelDialogOpen(false)}
          />
        </div>
      )}

      {/* Notice for Appointments within 24 hours */}
      {isTooLateForOnlineCancellation && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/60 border border-border text-xs text-muted-foreground">
          <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Online Cancellation Unavailable</p>
            <p className="text-[11px] leading-relaxed">
              Online cancellation is unavailable within 24 hours of your appointment.
              Please contact the salon directly if you need assistance.
            </p>
            <div className="flex items-center gap-1.5 pt-1 font-semibold text-foreground text-[11px]">
              <Phone className="h-3.5 w-3.5 text-accent" />
              <span>Salon Desk: {SALON_CONFIG.contact.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Section for Completed Appointments */}
      {appointmentStatus === "COMPLETED" && (
        <ReviewForm
          appointmentId={appointmentId}
          serviceName={serviceName}
          existingReview={existingReview}
        />
      )}
    </div>
  );
}

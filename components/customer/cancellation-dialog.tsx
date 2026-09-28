"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointment } from "@/lib/actions/appointments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";

interface CancellationDialogProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancellationDialog({
  appointmentId,
  isOpen,
  onClose,
  onSuccess,
}: CancellationDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmCancel = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await cancelAppointment(appointmentId);
      if (res.error) {
        setError(res.message || "Failed to cancel appointment.");
        setSubmitting(false);
      } else {
        setSubmitting(false);
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      }
    } catch {
      setError("An unexpected network error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="space-y-2 text-center sm:text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto sm:mx-0">
            <XCircle className="h-6 w-6" />
          </div>
          <DialogTitle className="font-serif text-xl font-semibold">
            Cancel Appointment?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Your appointment reservation will be cancelled and the time slot will become available to other guests. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
            className="text-xs"
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirmCancel}
            disabled={submitting}
            className="text-xs font-semibold gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              "Yes, Cancel Appointment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

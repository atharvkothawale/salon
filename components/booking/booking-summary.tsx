"use client";

import React from "react";
import { format } from "date-fns";
import { Calendar, Scissors, UserCheck, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SALON_CONFIG } from "@/lib/constants/theme";

interface BookingSummaryProps {
  serviceName: string | null;
  serviceDuration: number | null;
  servicePrice: number | null;
  staffName: string | null;
  dateStr: string | null; // YYYY-MM-DD
  timeDisplay: string | null;
  currentStep: number;
  canProceed: boolean;
  onProceed: () => void;
}

export function BookingSummary({
  serviceName,
  serviceDuration,
  servicePrice,
  staffName,
  dateStr,
  timeDisplay,
  currentStep,
  canProceed,
  onProceed,
}: BookingSummaryProps) {
  let formattedDate = "";
  if (dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    formattedDate = format(new Date(y, m - 1, d), "EEEE, MMM d, yyyy");
  }

  return (
    <Card className="border-border bg-card shadow-sm sticky top-28 space-y-4">
      <CardHeader className="pb-3 border-b border-border/80">
        <CardTitle className="font-serif text-lg font-semibold text-foreground flex items-center justify-between">
          <span>Appointment Summary</span>
          <Badge variant="outline" className="text-[10px] uppercase font-bold text-accent border-accent/30 bg-accent/5">
            Phase 4B Preview
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        {/* Service */}
        <div className="flex items-start gap-3">
          <Scissors className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Service</span>
            <p className="font-semibold text-foreground">{serviceName || "Select a service"}</p>
            {serviceDuration && (
              <p className="text-[11px] text-muted-foreground">{serviceDuration} minutes duration</p>
            )}
          </div>
        </div>

        {/* Staff */}
        <div className="flex items-start gap-3">
          <UserCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Stylist</span>
            <p className="font-semibold text-foreground">{staffName || "Any available stylist"}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Date & Time</span>
            <p className="font-semibold text-foreground">{formattedDate || "Select a date"}</p>
            {timeDisplay && (
              <p className="text-[11px] text-accent font-semibold">{timeDisplay}</p>
            )}
          </div>
        </div>

        {/* Total Price */}
        <div className="pt-3 border-t border-border/80 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Estimated Total</span>
          <span className="font-serif text-lg font-bold text-foreground">
            {servicePrice !== null
              ? `${SALON_CONFIG.currency.symbol}${servicePrice.toFixed(2)}`
              : "—"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="accent"
          size="lg"
          onClick={onProceed}
          disabled={!canProceed}
          className="w-full font-semibold gap-2 shadow-sm text-xs py-5"
        >
          <span>
            {currentStep === 1
              ? "Continue to Stylist"
              : currentStep === 2
              ? "Continue to Date & Time"
              : currentStep === 3
              ? "Continue to Details"
              : currentStep === 4
              ? "Review Appointment"
              : "Proceed to Confirmation Boundary"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getAppointmentById } from "@/lib/actions/appointments";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentDetailActions } from "@/components/customer/appointment-detail-actions";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Scissors,
  UserCheck,
  MapPin,
  ArrowLeft,
  CalendarPlus,
  ShieldCheck,
  XCircle,
  Sparkles,
} from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";

interface AppointmentPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AppointmentPageProps): Promise<Metadata> {
  const { id } = await params;
  const appointment = await getAppointmentById(id);
  if (!appointment) return { title: "Appointment Details" };
  return {
    title: `Booking ${appointment.booking_code} — ${appointment.appointment_status}`,
    description: `Appointment details for ${appointment.booking_code} at ${SALON_CONFIG.name}.`,
  };
}

export default async function AppointmentConfirmationPage({ params }: AppointmentPageProps) {
  const { id } = await params;
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    notFound();
  }

  const startDate = new Date(appointment.start_datetime);
  const formattedDate = format(startDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(startDate, "h:mm a");

  const service = appointment.services;
  const staff = appointment.staff;

  const defaultServiceImg =
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600";
  const defaultStaffImg =
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400";

  const isCancelled = appointment.appointment_status === "CANCELLED";
  const isCompleted = appointment.appointment_status === "COMPLETED";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8 max-w-4xl">
      {/* Back Navigation */}
      <Link
        href="/appointments"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Reservations
      </Link>

      {/* Header Banner according to status */}
      <div className="text-center space-y-4 py-8 px-6 rounded-2xl bg-card border border-border shadow-xs">
        {isCancelled ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto shadow-md">
            <XCircle className="h-9 w-9" />
          </div>
        ) : isCompleted ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent mx-auto shadow-md">
            <Sparkles className="h-9 w-9" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground mx-auto shadow-md">
            <CheckCircle2 className="h-9 w-9" />
          </div>
        )}

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-xs font-bold uppercase tracking-widest">
            Booking Code: {appointment.booking_code}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            {isCancelled
              ? "Appointment Cancelled"
              : isCompleted
              ? "Treatment Completed"
              : "Appointment Confirmed!"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            {isCancelled
              ? "This appointment has been cancelled. If you need a new session, please book online."
              : isCompleted
              ? `Thank you for visiting ${SALON_CONFIG.name}! We hope you loved your experience.`
              : `Thank you for choosing ${SALON_CONFIG.name}. Your atelier session has been reserved.`}
          </p>
        </div>
      </div>

      {/* Main Reservation Card */}
      <Card className="border-border bg-card shadow-sm p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Reservation Status
            </span>
            <div className="flex items-center gap-2 pt-1">
              <Badge
                variant={isCancelled ? "destructive" : "accent"}
                className="font-semibold text-xs px-3 py-0.5"
              >
                {appointment.appointment_status}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                Payment: {appointment.payment_method} ({appointment.payment_status})
              </Badge>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Total Amount
            </span>
            <p className="font-serif text-2xl font-bold text-foreground">
              {SALON_CONFIG.currency.symbol}
              {Number(appointment.amount).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Schedule & Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border">
          <div className="space-y-2 p-4 rounded-xl bg-secondary/40 border border-border">
            <span className="text-[10px] uppercase font-bold tracking-wider text-accent flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Scheduled Date & Time
            </span>
            <p className="font-serif text-base font-semibold text-foreground">{formattedDate}</p>
            <p className="text-xs font-semibold text-accent flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formattedTime} ({service?.duration_minutes || 30} Mins)
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-secondary/40 border border-border">
            <span className="text-[10px] uppercase font-bold tracking-wider text-accent flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Salon Location
            </span>
            <p className="font-semibold text-foreground text-xs">{SALON_CONFIG.name}</p>
            <p className="text-xs text-muted-foreground">{SALON_CONFIG.contact.address}</p>
            <p className="text-[11px] text-muted-foreground">{SALON_CONFIG.contact.phone}</p>
          </div>
        </div>

        {/* Service & Staff Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border">
          {/* Service */}
          <div className="flex gap-4 items-center">
            <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary border border-border">
              <Image
                src={service?.image_url || defaultServiceImg}
                alt={service?.name || "Service"}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <Scissors className="h-3 w-3 text-accent" />
                Service
              </span>
              <h4 className="font-serif text-base font-semibold text-foreground">
                {service?.name || "Salon Treatment"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {service?.service_categories?.name || "Haute Care"}
              </p>
            </div>
          </div>

          {/* Stylist */}
          <div className="flex gap-4 items-center">
            <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-full bg-secondary border border-border">
              <Image
                src={staff?.photo_url || defaultStaffImg}
                alt={staff?.full_name || "Stylist"}
                fill
                className="object-cover object-top"
                sizes="64px"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-accent" />
                Assigned Specialist
              </span>
              <h4 className="font-serif text-base font-semibold text-foreground">
                {staff?.full_name || "Assigned Stylist"}
              </h4>
              <p className="text-xs text-muted-foreground">{staff?.role_title || "Haute Hair Artist"}</p>
            </div>
          </div>
        </div>

        {/* Customer Notes / Requests */}
        {appointment.notes && (
          <div className="space-y-2 pb-6 border-b border-border">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Customer Notes / Special Requests
            </span>
            <p className="text-xs text-foreground/90 italic bg-secondary/40 p-3 rounded-lg border border-border">
              &ldquo;{appointment.notes}&rdquo;
            </p>
          </div>
        )}

        {/* Interactive Actions (Cancellation / Reviews) */}
        <AppointmentDetailActions
          appointmentId={appointment.id}
          appointmentStatus={appointment.appointment_status}
          startDatetime={appointment.start_datetime}
          serviceName={service?.name || "Salon Treatment"}
          reviews={appointment.reviews}
        />

        {/* Policy Notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Cancellation & Rescheduling Policy</p>
            <p className="text-[11px] leading-relaxed">
              Complimentary cancellation is available up to 24 hours prior to your scheduled session. Payment is collected upon arrival at the salon.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link href="/appointments" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-xs">
              View All My Appointments
            </Button>
          </Link>

          <Link href="/book" className="w-full sm:w-auto">
            <Button variant="accent" className="w-full sm:w-auto text-xs font-semibold gap-2">
              <CalendarPlus className="h-4 w-4" />
              Book Another Treatment
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}


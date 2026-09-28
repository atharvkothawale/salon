import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { getCustomerAppointments } from "@/lib/actions/appointments";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, UserCheck, ArrowRight } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "My Appointments",
  description: `Manage your upcoming and past salon reservations at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic user route

export default async function AppointmentsPage() {
  const appointments = await getCustomerAppointments();

  const now = new Date();
  const upcoming = appointments.filter(
    (app) => new Date(app.start_datetime) >= now && app.appointment_status !== "CANCELLED"
  );
  const past = appointments.filter(
    (app) => new Date(app.start_datetime) < now || app.appointment_status === "CANCELLED"
  );

  const defaultServiceImg =
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      <PageHeader
        title="My Reservations"
        description="View and track your upcoming salon appointments, stylist assignments, and past treatment history."
        action={
          <Link href="/book">
            <Button variant="accent" size="sm" className="gap-2 font-semibold text-xs">
              <Calendar className="h-4 w-4" />
              Book New Session
            </Button>
          </Link>
        }
      />

      {appointments.length === 0 ? (
        <EmptyState
          title="No Appointments Found"
          description="You haven't scheduled any salon appointments yet. Reserve your next session in less than two minutes."
          actionLabel="Book Appointment Now"
          onAction={undefined}
        />
      ) : (
        <div className="space-y-12">
          {/* Upcoming Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Upcoming Sessions ({upcoming.length})
            </h3>

            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((app) => {
                  const startDate = new Date(app.start_datetime);
                  const formattedDate = format(startDate, "EEEE, MMM d, yyyy");
                  const formattedTime = format(startDate, "h:mm a");

                  return (
                    <Card
                      key={app.id}
                      className="border-border bg-card p-5 space-y-4 hover:border-accent/40 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-border/80">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] font-bold tracking-wider text-accent border-accent/30 bg-accent/5"
                        >
                          {app.booking_code}
                        </Badge>
                        <Badge variant="accent" className="text-[10px] font-semibold">
                          {app.appointment_status}
                        </Badge>
                      </div>

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
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-accent" />
                            {app.staff?.full_name || "Assigned Stylist"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/80 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{formattedDate}</p>
                          <p className="text-[11px] text-accent font-medium">{formattedTime}</p>
                        </div>
                        <Link href={`/appointments/${app.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                            <span>Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic bg-card p-6 rounded-xl border border-border">
                You have no upcoming appointments scheduled.
              </p>
            )}
          </div>

          {/* Past History Section */}
          {past.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Past & Cancelled History ({past.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {past.map((app) => {
                  const startDate = new Date(app.start_datetime);
                  const formattedDate = format(startDate, "MMM d, yyyy");
                  const formattedTime = format(startDate, "h:mm a");

                  return (
                    <Card key={app.id} className="border-border bg-card/60 p-4 space-y-3 text-xs opacity-90">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {app.booking_code}
                        </span>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                          {app.appointment_status}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-border/40">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{app.services?.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {formattedDate} at {formattedTime} • {app.staff?.full_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.appointment_status === "COMPLETED" && (!app.reviews || app.reviews.length === 0) && (
                            <Link href={`/appointments/${app.id}`}>
                              <Button variant="accent" size="sm" className="text-[11px] h-7 px-2.5 font-semibold">
                                Leave Review
                              </Button>
                            </Link>
                          )}
                          <Link href={`/appointments/${app.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs h-7">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

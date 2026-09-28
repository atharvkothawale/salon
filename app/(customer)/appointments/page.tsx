import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getCustomerAppointments } from "@/lib/actions/appointments";
import { PageHeader } from "@/components/shared/page-header";
import { AppointmentsDashboard } from "@/components/customer/appointments-dashboard";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "My Appointments",
  description: `Manage your upcoming and past salon reservations at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic user route

export default async function AppointmentsPage() {
  const appointments = await getCustomerAppointments();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      <PageHeader
        title="My Reservations"
        description="View and track your upcoming salon appointments, stylist assignments, and treatment history."
        action={
          <Link href="/book">
            <Button variant="accent" size="sm" className="gap-2 font-semibold text-xs px-4">
              <Calendar className="h-4 w-4" />
              Book New Session
            </Button>
          </Link>
        }
      />

      <AppointmentsDashboard appointments={appointments} />
    </div>
  );
}

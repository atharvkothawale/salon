import React from "react";
import { Metadata } from "next";
import { getServiceCategories, getActiveServices, getActiveStaff } from "@/services/public-data";
import { getCurrentUserProfile } from "@/lib/actions/auth";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: `Schedule your atelier session at ${SALON_CONFIG.name}. Select services, preferred stylists, and appointment dates.`,
};

export default async function BookingPage() {
  const [categories, services, staffList, userProfile] = await Promise.all([
    getServiceCategories(),
    getActiveServices(),
    getActiveStaff(),
    getCurrentUserProfile(),
  ]);

  return (
    <div className="bg-background min-h-screen">
      <BookingWizard
        categories={categories}
        services={services}
        staffList={staffList}
        userProfile={userProfile}
      />
    </div>
  );
}

import React from "react";
import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StaffCard } from "@/components/customer/staff-card";
import { getActiveStaff } from "@/services/public-data";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Stylists & Experts",
  description: `Meet the master hair artists, colorists, and estheticians at ${SALON_CONFIG.name}.`,
};

export const revalidate = 60;

export default async function StaffPage() {
  const staffList = await getActiveStaff();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      <PageHeader
        title="Our Master Stylists & Therapists"
        description="Every team member at Lumière brings international background, deep expertise, and passion for personalized beauty care."
      />

      {staffList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {staffList.map((staff) => {
            const specialties = staff.staff_services
              ?.map((ss: { services: { name: string } | null }) => ss.services?.name)
              .filter((name: string | undefined): name is string => Boolean(name)) || [];

            return (
              <StaffCard
                key={staff.id}
                id={staff.id}
                name={staff.full_name}
                roleTitle={staff.role_title}
                bio={staff.bio}
                photoUrl={staff.photo_url}
                specialties={specialties}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card">
          <p className="text-xs text-muted-foreground">No staff directory records found.</p>
        </div>
      )}
    </div>
  );
}

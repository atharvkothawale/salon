import React from "react";
import Link from "next/link";
import { StaffCard } from "./staff-card";
import { Button } from "@/components/ui/button";
import { UserCheck, ArrowRight } from "lucide-react";

interface StaffMember {
  id: string;
  full_name: string;
  role_title: string;
  bio: string | null;
  photo_url: string | null;
  staff_services?: Array<{
    services: { name: string } | null;
  }>;
}

interface StaffSectionProps {
  staffList: StaffMember[];
}

export function StaffSection({ staffList }: StaffSectionProps) {
  if (staffList.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-card/40 border-y border-border/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/80">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              Master Artists & Therapists
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Meet Our Salon Experts
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Our team brings decades of international hair styling, balayage color, and holistic skin therapy expertise.
            </p>
          </div>

          <Link href="/staff" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <span>View All Experts</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {staffList.slice(0, 3).map((staff) => {
            const specialties = staff.staff_services
              ?.map((ss) => ss.services?.name)
              .filter((name): name is string => Boolean(name)) || [];

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
      </div>
    </section>
  );
}

import React from "react";
import Image from "next/image";
import { Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  full_name: string;
  role_title: string;
  bio: string | null;
  photo_url: string | null;
  staff_services?: Array<{
    services: { id: string; name: string } | null;
  }>;
}

interface StaffSelectionProps {
  qualifiedStaff: StaffMember[];
  selectedStaffId: string | null; // null represents "Any Available Stylist"
  onSelectStaff: (staffId: string | null, staffName: string) => void;
}

export function StaffSelection({
  qualifiedStaff,
  selectedStaffId,
  onSelectStaff,
}: StaffSelectionProps) {
  const defaultPhoto =
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-semibold text-foreground">Choose a Stylist</h3>
        <p className="text-xs text-muted-foreground">
          Select your preferred master stylist or choose &ldquo;Any available stylist&rdquo; for maximum time slot flexibility.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Any Available Stylist */}
        <Card
          onClick={() => onSelectStaff(null, "Any Available Stylist")}
          className={cn(
            "cursor-pointer border transition-all p-4 flex items-center gap-4 relative group",
            selectedStaffId === null
              ? "border-accent bg-accent/5 ring-1 ring-accent shadow-sm"
              : "border-border bg-card hover:border-accent/50"
          )}
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent border border-accent/20">
            <Sparkles className="h-7 w-7" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-semibold text-foreground">
                Any Available Stylist
              </h4>
              {selectedStaffId === null && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground shrink-0">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum slot flexibility. We will match you with the best available team member.
            </p>
          </div>
        </Card>

        {/* Option 2: Qualified Staff List */}
        {qualifiedStaff.map((staff) => {
          const isSelected = selectedStaffId === staff.id;

          return (
            <Card
              key={staff.id}
              onClick={() => onSelectStaff(staff.id, staff.full_name)}
              className={cn(
                "cursor-pointer border transition-all p-4 flex items-center gap-4 relative group",
                isSelected
                  ? "border-accent bg-accent/5 ring-1 ring-accent shadow-sm"
                  : "border-border bg-card hover:border-accent/50"
              )}
            >
              <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-full bg-secondary border border-border">
                <Image
                  src={staff.photo_url || defaultPhoto}
                  alt={staff.full_name}
                  fill
                  className="object-cover object-top"
                  sizes="64px"
                />
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base font-semibold text-foreground truncate">
                    {staff.full_name}
                  </h4>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground shrink-0">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <Badge variant="outline" className="text-[10px] font-medium bg-secondary border-border text-secondary-foreground">
                  {staff.role_title}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

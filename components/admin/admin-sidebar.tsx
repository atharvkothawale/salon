"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Users,
  UserCheck,
  Scissors,
  CreditCard,
  Tag,
  Star,
  BarChart3,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/staff", label: "Staff", icon: UserCheck },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/offers", label: "Offers & Coupons", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col justify-between shrink-0 hidden lg:flex min-h-screen sticky top-0 h-screen">
      <div>
        {/* Header Branding */}
        <div className="h-20 border-b border-border flex items-center px-6 gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Scissors className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm font-semibold text-foreground tracking-tight">
              {SALON_CONFIG.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto">
          {ADMIN_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground font-semibold border-l-2 border-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-accent" : "text-muted-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Back Link */}
      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Salon Site</span>
        </Link>
      </div>
    </aside>
  );
}

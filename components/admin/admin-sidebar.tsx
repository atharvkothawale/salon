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
  LogOut,
} from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/actions/auth";
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

interface AdminSidebarProps {
  profile?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  onNavigate?: () => void;
}

export function AdminSidebar({ profile, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col justify-between shrink-0 h-full min-h-screen sticky top-0">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header Branding */}
        <div className="h-20 border-b border-border flex items-center px-6 gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Scissors className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm font-semibold text-foreground tracking-tight">
              {SALON_CONFIG.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-accent font-bold">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
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
                onClick={onNavigate}
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

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-border space-y-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar className="h-8 w-8 border border-accent/30">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-accent text-accent-foreground text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-foreground truncate">{profile?.full_name || "Salon Admin"}</span>
            <span className="text-[10px] text-muted-foreground truncate">{profile?.email || "admin@salon.com"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link href="/" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-[11px] h-8 gap-1.5 justify-start">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Salon Site</span>
            </Button>
          </Link>

          <form action={logoutUser}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Log Out">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scissors, Menu, X, LogOut, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutUser } from "@/lib/actions/auth";
import { SALON_CONFIG } from "@/lib/constants/theme";

interface AdminHeaderProps {
  profile?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

export function AdminHeader({ profile }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header className="h-20 border-b border-border bg-card/95 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle admin navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Scissors className="h-4 w-4" />
          </div>
          <span className="font-serif text-sm font-semibold text-foreground">{SALON_CONFIG.name}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground bg-accent/5 px-3 py-1 rounded-full border border-accent/20">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          <span className="font-semibold text-foreground">Admin Console</span>
          <span>•</span>
          <span>Authenticated Operational Mode</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-accent/30">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-accent text-accent-foreground font-semibold text-xs">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground">{profile?.full_name || "Salon Administrator"}</span>
            <span className="text-[10px] text-muted-foreground">{profile?.email || "admin@lumieresalon.com"}</span>
          </div>
        </div>

        <form action={logoutUser} className="hidden sm:block">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Log Out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bg-card border-b border-border shadow-xl p-6 z-40 animate-in slide-in-from-top-2 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">{profile?.full_name}</p>
            <p className="text-[11px] text-muted-foreground">{profile?.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/appointments" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Appointments
              </Button>
            </Link>
            <Link href="/admin/calendar" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Calendar
              </Button>
            </Link>
            <Link href="/admin/customers" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Customers
              </Button>
            </Link>
            <Link href="/admin/staff" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Staff
              </Button>
            </Link>
            <Link href="/admin/services" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Services
              </Button>
            </Link>
            <Link href="/admin/payments" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Payments
              </Button>
            </Link>
            <Link href="/admin/offers" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Offers
              </Button>
            </Link>
            <Link href="/admin/reviews" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Reviews
              </Button>
            </Link>
            <Link href="/admin/settings" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                Settings
              </Button>
            </Link>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
            <Link href="/" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full text-xs gap-1.5 justify-center">
                <ArrowLeft className="h-3.5 w-3.5" />
                Client Website
              </Button>
            </Link>
            <form action={logoutUser} className="flex-1">
              <Button variant="destructive" className="w-full text-xs gap-1.5 justify-center">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

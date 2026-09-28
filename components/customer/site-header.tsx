"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors, Menu, X, Calendar, LogIn, MessageCircle } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/staff", label: "Stylists" },
];

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
  role: string;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name, avatar_url")
            .eq("id", user.id)
            .single();
          if (profile) {
            setUserProfile(profile);
          }
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
        }
      } catch {
        // Fallback unauthenticated
      }
    }
    checkAuth();
  }, [pathname]);

  const initials = userProfile?.full_name
    ? userProfile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  const isAdmin = userProfile?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:bg-accent transition-colors">
            <Scissors className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold tracking-wide text-foreground">
              {SALON_CONFIG.name}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              {SALON_CONFIG.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent relative py-1",
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
          {isLoggedIn && (
            <Link
              href="/appointments"
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent relative py-1",
                pathname === "/appointments"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              )}
            >
              My Bookings
              {pathname === "/appointments" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-accent rounded-full" />
              )}
            </Link>
          )}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* WhatsApp CTA */}
          <a
            href={SALON_CONFIG.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium">
              <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              WhatsApp Us
            </Button>
          </a>

          {isLoggedIn ? (
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2 text-xs pl-2 pr-3">
                <Avatar className="h-6 w-6 border border-accent/40">
                  {userProfile?.avatar_url ? (
                    <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-accent text-accent-foreground text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>My Account</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}

          <Link href="/book">
            <Button variant="accent" size="sm" className="gap-2 text-xs font-semibold px-4">
              <Calendar className="h-4 w-4" />
              Book Appointment
            </Button>
          </Link>

          {isAdmin && (
            <Link href="/admin" className="text-xs text-accent font-semibold hover:underline ml-1">
              Admin Portal
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href={SALON_CONFIG.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="text-xs px-2.5 py-1 text-emerald-700 dark:text-emerald-400 border-emerald-600/30">
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
          </a>
          <Link href="/book">
            <Button variant="accent" size="sm" className="text-xs px-3 py-1 font-semibold">
              Book
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 py-6 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors py-2 px-3 rounded-md",
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {isLoggedIn && (
              <Link
                href="/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors py-2 px-3 rounded-md",
                  pathname === "/appointments"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                My Bookings
              </Link>
            )}

            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <a
                href={SALON_CONFIG.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="outline" className="w-full justify-start gap-2 text-xs border-emerald-600/30 text-emerald-700 dark:text-emerald-400">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </Button>
              </a>

              {isLoggedIn ? (
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2.5 text-xs">
                    <Avatar className="h-5 w-5 border border-accent/40">
                      {userProfile?.avatar_url ? (
                        <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-accent text-accent-foreground text-[9px] font-bold">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>My Account Profile</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2 text-xs">
                    <LogIn className="h-4 w-4" />
                    Sign In / Register
                  </Button>
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-xs text-accent font-semibold">
                    Admin Portal
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

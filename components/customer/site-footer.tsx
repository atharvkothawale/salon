import React from "react";
import Link from "next/link";
import { Scissors, MapPin, Phone, Mail, Clock } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Scissors className="h-4 w-4" />
              </div>
              <span className="font-serif text-lg font-semibold tracking-wide">
                {SALON_CONFIG.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {SALON_CONFIG.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground">
              Experience
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Services & Treatments
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-accent transition-colors">
                  Stylists & Experts
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-accent transition-colors">
                  Book Online
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="hover:text-accent transition-colors">
                  My Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent" />
              Opening Hours
            </h4>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p className="flex justify-between">
                <span>Mon - Fri:</span>
                <span className="font-medium text-foreground">{SALON_CONFIG.hours.weekday}</span>
              </p>
              <p className="flex justify-between">
                <span>Sat - Sun:</span>
                <span className="font-medium text-foreground">{SALON_CONFIG.hours.weekend}</span>
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground">
              Salon Location
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>{SALON_CONFIG.contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <span>{SALON_CONFIG.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <span>{SALON_CONFIG.contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} {SALON_CONFIG.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/admin" className="hover:text-accent font-medium">Admin Sign In</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import { OpeningHours } from "./opening-hours";
import { MapPin, Phone, Mail, Award, Heart, ShieldCheck, MessageCircle } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";

interface SalonSettings {
  salon_name: string;
  address: string;
  phone: string;
  email: string;
  cancellation_policy: string | null;
}

interface BusinessHour {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface AboutSectionProps {
  settings: SalonSettings;
  hours: BusinessHour[];
}

export function AboutSection({ settings, hours }: AboutSectionProps) {
  const telNumber = `tel:${settings.phone.replace(/[^+\d]/g, "")}`;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Text & Location Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                The Lumière Standard
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground tracking-tight leading-snug">
                Crafting Timeless Beauty & Personal Luxury
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Founded with a vision to redefine the salon experience in Pune, {settings.salon_name} combines modern artistry with supreme Indian hospitality. Every appointment is treated as a personalized sanctuary session tailored to your natural hair texture and skin health.
              </p>
            </div>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2 p-4 rounded-lg bg-card border border-border">
                <Award className="h-5 w-5 text-accent" />
                <h4 className="text-xs font-semibold text-foreground">Precision Artistry</h4>
                <p className="text-[11px] text-muted-foreground">Experienced master stylists trained in precision cutting, balayage, and advanced skin therapy.</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-card border border-border">
                <Heart className="h-5 w-5 text-accent" />
                <h4 className="text-xs font-semibold text-foreground">Clean Formulations</h4>
                <p className="text-[11px] text-muted-foreground">Premium, dermatologically tested, cruelty-free hair and skin care products.</p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-card border border-border">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <h4 className="text-xs font-semibold text-foreground">Hygienic Sanctuary</h4>
                <p className="text-[11px] text-muted-foreground">Single-use disposables & hospital-grade sterilization standards for ultimate peace of mind.</p>
              </div>
            </div>

            {/* Contact & Location Box */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <h3 className="font-serif text-base font-semibold text-foreground">Visit Our Salon</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-accent shrink-0" />
                  <a href={telNumber} className="hover:text-accent transition-colors font-medium">
                    {settings.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <a
                    href={SALON_CONFIG.contact.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors text-emerald-700 dark:text-emerald-400 font-medium"
                  >
                    WhatsApp Us
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-accent transition-colors truncate">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hours Sidebar */}
          <div className="lg:col-span-5">
            <OpeningHours hours={hours} />
          </div>

        </div>
      </div>
    </section>
  );
}

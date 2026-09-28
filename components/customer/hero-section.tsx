import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Clock, MapPin, MessageCircle } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";

interface HeroSectionProps {
  salonName: string;
  address: string;
}

export function HeroSection({ salonName, address }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-background py-12 md:py-20 lg:py-24 border-b border-border/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              {SALON_CONFIG.tagline}
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-foreground">
              LUXURY, MADE PERSONAL
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Premium hair, beauty and wellness services designed around you at {salonName} in Baner, Pune.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/book" className="w-full sm:w-auto">
                <Button variant="accent" size="lg" className="w-full sm:w-auto px-8 py-6 text-sm font-semibold gap-2 shadow-md hover:shadow-lg transition-all">
                  <Calendar className="h-4 w-4" />
                  Book Appointment
                </Button>
              </Link>
              <a
                href={SALON_CONFIG.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-sm font-medium gap-2 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                  <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  WhatsApp Us
                </Button>
              </a>
            </div>

            <div className="pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                <span>{address}</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent shrink-0" />
                <span>Mon – Sun: 10:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Right Imagery Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Decorative Image Frame */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000"
                  alt="Modern Luxury Salon Interior"
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating Badge Card */}
              <div className="absolute -bottom-6 -left-6 bg-card border border-border p-4 rounded-xl shadow-lg flex items-center gap-3.5 hidden sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-serif font-bold text-sm">
                  5.0
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Top Rated Salon in Pune</p>
                  <p className="text-[10px] text-muted-foreground">Over 500+ satisfied clients</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

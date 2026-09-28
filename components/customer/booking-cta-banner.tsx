import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, MessageCircle } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";

export function BookingCtaBanner() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          Ready For Your Transformation?
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
          Reserve Your Salon Session Today
        </h2>
        <p className="text-xs sm:text-sm text-primary-foreground/80 leading-relaxed max-w-xl mx-auto font-normal">
          Select your service, choose your favorite stylist, and secure your time slot in less than two minutes.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/book" className="w-full sm:w-auto">
            <Button variant="accent" size="lg" className="w-full sm:w-auto px-8 py-6 text-sm font-semibold gap-2 shadow-lg">
              <Calendar className="h-4 w-4" />
              Book Appointment Now
            </Button>
          </Link>
          <a
            href={SALON_CONFIG.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-sm font-semibold gap-2 bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              WhatsApp Us
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

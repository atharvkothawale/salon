"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ServiceCard } from "./service-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  service_categories?: { name: string } | null;
}

interface FeaturedServicesProps {
  categories: Category[];
  services: Service[];
}

export function FeaturedServices({ categories, services }: FeaturedServicesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((s) => s.category_id === selectedCategory);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/80">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5" />
              Tailored Care & Styling
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
              Featured Salon Services
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore our signatures: precision cuts, bespoke color balayage, hydrating skin therapy, and spa wellness.
            </p>
          </div>

          <Link href="/services" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <span>View All Services</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Category Pill Filters */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              )}
            >
              All Treatments
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.slice(0, 6).map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                price={Number(service.price)}
                durationMinutes={service.duration_minutes}
                imageUrl={service.image_url}
                categoryName={service.service_categories?.name}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card">
            <p className="text-xs text-muted-foreground">No services found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}

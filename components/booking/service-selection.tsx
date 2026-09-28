"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

import { cn, formatINR } from "@/lib/utils";

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

interface ServiceSelectionProps {
  categories: Category[];
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (service: Service) => void;
}

export function ServiceSelection({
  categories,
  services,
  selectedServiceId,
  onSelectService,
}: ServiceSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((s) => s.category_id === selectedCategory);

  const defaultImage =
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-semibold text-foreground">Select a Service</h3>
        <p className="text-xs text-muted-foreground">
          Choose from our menu of artisan hair care, styling, skin therapy, or spa treatments.
        </p>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
            )}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service) => {
          const isSelected = selectedServiceId === service.id;

          return (
            <Card
              key={service.id}
              onClick={() => onSelectService(service)}
              className={cn(
                "cursor-pointer border transition-all p-4 flex gap-4 items-start relative group",
                isSelected
                  ? "border-accent bg-accent/5 ring-1 ring-accent shadow-sm"
                  : "border-border bg-card hover:border-accent/50"
              )}
            >
              <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                <Image
                  src={service.image_url || defaultImage}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-serif text-base font-semibold text-foreground truncate">
                    {service.name}
                  </h4>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground shrink-0">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {service.description || "Tailored salon service."}
                </p>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-accent" />
                    {service.duration_minutes} mins
                  </span>
                  <span className="font-serif text-sm font-semibold text-foreground">
                    {formatINR(service.price)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

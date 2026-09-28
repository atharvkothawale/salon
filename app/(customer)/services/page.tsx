import React from "react";
import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { FeaturedServices } from "@/components/customer/featured-services";
import { getServiceCategories, getActiveServices } from "@/services/public-data";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Services & Treatments",
  description: `Discover haute hair styling, color treatments, hydration facials, and luxury spa treatments at ${SALON_CONFIG.name}.`,
};

export const revalidate = 60;

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([
    getServiceCategories(),
    getActiveServices(),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      <PageHeader
        title="Services & Treatments Catalog"
        description="Explore our complete menu of artisan hair cuts, sun-kissed balayage, skin revival facials, and restorative spa rituals."
      />

      <FeaturedServices categories={categories} services={services} />
    </div>
  );
}

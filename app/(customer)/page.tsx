import React from "react";
import { HeroSection } from "@/components/customer/hero-section";
import { FeaturedServices } from "@/components/customer/featured-services";
import { StaffSection } from "@/components/customer/staff-section";
import { AboutSection } from "@/components/customer/about-section";
import { ReviewsSection } from "@/components/customer/reviews-section";
import { BookingCtaBanner } from "@/components/customer/booking-cta-banner";
import {
  getSalonSettings,
  getBusinessHours,
  getServiceCategories,
  getActiveServices,
  getActiveStaff,
  getApprovedReviews,
} from "@/services/public-data";

export const revalidate = 60; // Revalidate public cache every 60s

export default async function HomePage() {
  const [settings, hours, categories, services, staffList, reviews] =
    await Promise.all([
      getSalonSettings(),
      getBusinessHours(),
      getServiceCategories(),
      getActiveServices(),
      getActiveStaff(),
      getApprovedReviews(),
    ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection
        salonName={settings.salon_name}
        address={settings.address}
      />

      {/* 2. Featured Services Section */}
      <FeaturedServices categories={categories} services={services} />

      {/* 3. Staff Showcase Section */}
      <StaffSection staffList={staffList} />

      {/* 4. About & Operating Hours Section */}
      <AboutSection settings={settings} hours={hours} />

      {/* 5. Approved Client Reviews Section */}
      <ReviewsSection reviews={reviews} />

      {/* 6. Conversion Booking Banner */}
      <BookingCtaBanner />
    </div>
  );
}

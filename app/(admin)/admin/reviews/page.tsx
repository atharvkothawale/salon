import React from "react";
import { Metadata } from "next";
import { getAdminReviews } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { AdminReviewsManager } from "@/components/admin/admin-reviews-manager";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Reviews",
  description: `Review moderation, star ratings, and client feedback at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic admin data

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Review Moderation"
        description="Moderate guest reviews, approve client testimonials for public website display, and reject inappropriate feedback."
      />

      <AdminReviewsManager initialReviews={reviews} />
    </div>
  );
}

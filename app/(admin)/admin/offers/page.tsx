import React from "react";
import { Metadata } from "next";
import { getAdminCoupons } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { AdminOffersManager } from "@/components/admin/admin-offers-manager";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Offers & Coupons",
  description: `Manage promotional coupons, discount codes, and usage limits at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic admin data

export default async function AdminOffersPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Promotional Offers & Coupons"
        description="Configure discount promo codes, percentage or fixed value vouchers, minimum booking amounts, and validity date ranges."
      />

      <AdminOffersManager initialCoupons={coupons} />
    </div>
  );
}

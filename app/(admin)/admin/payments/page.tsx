import React from "react";
import { Metadata } from "next";
import { getAdminPayments } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { AdminPaymentsManager } from "@/components/admin/admin-payments-manager";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Payments",
  description: `Payment records, transaction history, and settlement statuses at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic admin data

export default async function AdminPaymentsPage() {
  const payments = await getAdminPayments();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payment Records"
        description="Administrative audit log of appointment payments, recorded cash/card settlements, and transaction statuses."
      />

      <AdminPaymentsManager initialPayments={payments} />
    </div>
  );
}

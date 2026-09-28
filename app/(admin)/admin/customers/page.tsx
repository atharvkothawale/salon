import React from "react";
import { Metadata } from "next";
import { getAdminCustomers } from "@/lib/actions/admin";
import { PageHeader } from "@/components/shared/page-header";
import { AdminCustomersManager } from "@/components/admin/admin-customers-manager";
import { SALON_CONFIG } from "@/lib/constants/theme";

export const metadata: Metadata = {
  title: "Admin Customers",
  description: `Customer directory, guest accounts, and appointment spend history at ${SALON_CONFIG.name}.`,
};

export const revalidate = 0; // Dynamic admin data

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customer Directory"
        description="Search client accounts, inspect reservation history, phone numbers, and lifetime salon spend."
      />

      <AdminCustomersManager initialCustomers={customers} />
    </div>
  );
}

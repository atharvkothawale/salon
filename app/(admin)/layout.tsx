import React from "react";
import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/actions/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export const revalidate = 0; // Dynamic admin route

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAdminRole();

  if (!auth.authorized) {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      <AdminSidebar profile={auth.profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader profile={auth.profile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

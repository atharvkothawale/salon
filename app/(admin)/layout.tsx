import React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

import React from "react";
import { SiteHeader } from "@/components/customer/site-header";
import { SiteFooter } from "@/components/customer/site-footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

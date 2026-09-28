import React from "react";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Scissors className="h-5 w-5" />
            </div>
          </Link>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            {SALON_CONFIG.name}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}

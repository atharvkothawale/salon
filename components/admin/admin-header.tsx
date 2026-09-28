"use client";

import React from "react";
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AdminHeader() {
  return (
    <header className="h-20 border-b border-border bg-background/95 backdrop-blur-xs px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger placeholder */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card text-xs text-muted-foreground w-64">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>Search appointments, staff...</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
        </Button>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold text-xs">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground">Salon Manager</span>
            <span className="text-[10px] text-muted-foreground">Admin Account</span>
          </div>
        </div>
      </div>
    </header>
  );
}

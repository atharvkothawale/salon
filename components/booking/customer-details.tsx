"use client";

import React from "react";
import Link from "next/link";
import { User, Mail, Phone, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface CustomerDetailsProps {
  userProfile: CustomerProfile | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  onUpdateName: (v: string) => void;
  onUpdateEmail: (v: string) => void;
  onUpdatePhone: (v: string) => void;
  onUpdateNotes: (v: string) => void;
}

export function CustomerDetails({
  userProfile,
  customerName,
  customerEmail,
  customerPhone,
  notes,
  onUpdateName,
  onUpdateEmail,
  onUpdatePhone,
  onUpdateNotes,
}: CustomerDetailsProps) {
  if (!userProfile) {
    return (
      <Card className="border-border bg-card p-8 text-center space-y-6 max-w-md mx-auto my-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mx-auto">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-semibold text-foreground">Sign In to Continue</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please log in or create a customer account to confirm your salon reservation. Your selected service and time slot will be preserved.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Link href="/login?redirect=/book">
            <Button variant="accent" className="w-full font-semibold gap-2">
              <span>Sign In to Account</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register?redirect=/book">
            <Button variant="outline" className="w-full">
              Create New Account
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-semibold text-foreground">Customer Information</h3>
        <p className="text-xs text-muted-foreground">
          Confirm your contact details and add any special requests or notes for your stylist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cust-name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="cust-name"
              className="pl-9"
              value={customerName}
              onChange={(e) => onUpdateName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cust-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="cust-email"
              type="email"
              className="pl-9"
              value={customerEmail}
              onChange={(e) => onUpdateEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="cust-phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="cust-phone"
              className="pl-9"
              value={customerPhone}
              onChange={(e) => onUpdatePhone(e.target.value)}
              placeholder="+91 90000 00000"
            />
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="cust-notes">Anything we should know? (Optional)</Label>
            <span className="text-[10px] text-muted-foreground">{notes.length}/200</span>
          </div>
          <div className="relative">
            <textarea
              id="cust-notes"
              maxLength={200}
              rows={3}
              value={notes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="e.g. Sensitive scalp, preferred hair length, or color history"
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { formatINR } from "@/lib/utils";
import { CreditCard, Search, Calendar } from "lucide-react";

interface PaymentRecord {
  id: string;
  amount: number;
  method: string;
  status: string;
  provider: string | null;
  provider_reference: string | null;
  created_at: string;
  appointments?: {
    booking_code: string;
    services?: { name: string } | null;
    profiles?: { full_name: string; email: string } | null;
  } | null;
}

interface AdminPaymentsManagerProps {
  initialPayments: PaymentRecord[];
}

export function AdminPaymentsManager({ initialPayments }: AdminPaymentsManagerProps) {
  const [payments] = useState<PaymentRecord[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const matchCode = p.appointments?.booking_code.toLowerCase().includes(q);
    const matchCust = p.appointments?.profiles?.full_name.toLowerCase().includes(q) || p.appointments?.profiles?.email.toLowerCase().includes(q);
    const matchRef = p.provider_reference?.toLowerCase().includes(q);
    return matchCode || matchCust || matchRef;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <Card className="p-4 border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search code, customer, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-background"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 rounded-md border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground">
          Showing {filteredPayments.length} payment record(s)
        </span>
      </Card>

      {/* Payment Table / Cards */}
      {filteredPayments.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border bg-card space-y-2">
          <CreditCard className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-semibold text-foreground">No Payment Records</h4>
          <p className="text-xs text-muted-foreground">No recorded transaction logs match the selected filter criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredPayments.map((pm) => (
            <Card key={pm.id} className="p-4 border-border bg-card hover:border-accent/40 transition-all space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/20">
                    {pm.appointments?.booking_code || "RESERVATION"}
                  </span>
                  <Badge
                    variant={
                      pm.status === "PAID"
                        ? "accent"
                        : pm.status === "FAILED"
                        ? "destructive"
                        : "outline"
                    }
                    className="text-[10px] font-semibold"
                  >
                    {pm.status}
                  </Badge>
                </div>

                <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {format(new Date(pm.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Customer</span>
                  <p className="font-semibold text-foreground">{pm.appointments?.profiles?.full_name || "Guest"}</p>
                  <p className="text-[11px] text-muted-foreground">{pm.appointments?.profiles?.email}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Service & Method</span>
                  <p className="font-semibold text-foreground">{pm.appointments?.services?.name || "Salon Treatment"}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    Method: {pm.method.replace(/_/g, " ").toLowerCase()} ({pm.provider || "Salondesk"})
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Recorded Amount</span>
                  <p className="font-serif text-base font-bold text-foreground">
                    {formatINR(pm.amount)}
                  </p>
                  {pm.provider_reference && (
                    <p className="text-[10px] text-muted-foreground font-mono">Ref: {pm.provider_reference}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

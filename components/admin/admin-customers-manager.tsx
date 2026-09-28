"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { formatINR } from "@/lib/utils";
import { Search, Mail, Phone, Eye, UserCheck } from "lucide-react";

interface CustomerAppointment {
  id: string;
  amount: number;
  appointment_status: string;
  start_datetime: string;
}

interface CustomerRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  totalAppointments: number;
  completedAppointments: number;
  totalSpent: number;
  appointments?: CustomerAppointment[];
}

interface AdminCustomersManagerProps {
  initialCustomers: CustomerRecord[];
}

export function AdminCustomersManager({ initialCustomers }: AdminCustomersManagerProps) {
  const [customers] = useState<CustomerRecord[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const filteredCustomers = customers.filter((cust) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cust.full_name.toLowerCase().includes(q) ||
      cust.email.toLowerCase().includes(q) ||
      (cust.phone && cust.phone.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="p-4 border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-background"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Total Guests: <strong className="text-foreground">{customers.length}</strong>
        </span>
      </Card>

      {/* Customer Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border bg-card space-y-2">
          <UserCheck className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-semibold text-foreground">No Customers Found</h4>
          <p className="text-xs text-muted-foreground">No registered customer profiles match your search criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const initials = cust.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            return (
              <Card key={cust.id} className="p-5 border-border bg-card space-y-4 hover:border-accent/40 transition-all">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <Avatar className="h-10 w-10 border border-accent/30">
                    {cust.avatar_url ? (
                      <AvatarImage src={cust.avatar_url} alt={cust.full_name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-accent text-accent-foreground font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-base font-semibold text-foreground truncate">{cust.full_name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 text-accent shrink-0" />
                      <span>{cust.email}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Completed Sessions</span>
                    <p className="font-semibold text-foreground text-sm">{cust.completedAppointments} Treatment(s)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Revenue</span>
                    <p className="font-serif text-sm font-bold text-foreground">
                      {formatINR(cust.totalSpent)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {cust.phone || "No phone listed"}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(cust)}
                    className="text-xs h-8 gap-1 text-accent font-semibold"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Profile
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Customer Detail Dialog */}
      {selectedCustomer && (
        <Dialog open={Boolean(selectedCustomer)} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="sm:max-w-lg bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-accent/40">
                  {selectedCustomer.avatar_url ? (
                    <AvatarImage src={selectedCustomer.avatar_url} alt={selectedCustomer.full_name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-accent text-accent-foreground font-bold text-sm">
                      {selectedCustomer.full_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <DialogTitle className="font-serif text-xl font-semibold">{selectedCustomer.full_name}</DialogTitle>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Customer account record, contact details, and historical appointment log.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</span>
                  <p className="font-semibold text-foreground">{selectedCustomer.phone || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Joined Date</span>
                  <p className="font-semibold text-foreground">
                    {format(new Date(selectedCustomer.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Sessions</span>
                  <p className="font-semibold text-foreground">{selectedCustomer.totalAppointments} Scheduled</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Lifetime Spend</span>
                  <p className="font-serif text-sm font-bold text-foreground">
                    {formatINR(selectedCustomer.totalSpent)}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)} className="text-xs">
                Close Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

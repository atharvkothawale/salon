"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { updateAdminAppointmentStatus } from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { formatINR } from "@/lib/utils";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  DollarSign,
  Eye,
  Loader2,
  AlertTriangle,
  FileText,
  History,
} from "lucide-react";

interface ServiceItem {
  id?: string;
  name: string;
  price?: number;
  duration_minutes?: number;
}

interface StaffItem {
  id?: string;
  full_name: string;
  role_title?: string;
}

interface CustomerProfile {
  full_name: string;
  email: string;
  phone: string | null;
}

interface AppointmentEvent {
  id: string;
  event_type: string;
  old_status: string | null;
  new_status: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

interface AppointmentRecord {
  id: string;
  booking_code: string;
  customer_id: string;
  staff_id: string | null;
  service_id: string;
  start_datetime: string;
  end_datetime: string;
  appointment_status: string;
  payment_status: string;
  payment_method: string;
  amount: number;
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  services?: ServiceItem | null;
  staff?: StaffItem | null;
  profiles?: CustomerProfile | null;
  appointment_events?: AppointmentEvent[] | null;
}

interface AdminAppointmentsManagerProps {
  initialAppointments: AppointmentRecord[];
  staffList: StaffItem[];
  servicesList: ServiceItem[];
}

export function AdminAppointmentsManager({
  initialAppointments,
  staffList,
  servicesList,
}: AdminAppointmentsManagerProps) {
  const router = useRouter();

  const [appointments, setAppointments] = useState<AppointmentRecord[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [staffFilter, setStaffFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [cancelModalAppointmentId, setCancelModalAppointmentId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Client-side filtering logic
  const filteredAppointments = appointments.filter((app) => {
    if (statusFilter !== "ALL" && app.appointment_status !== statusFilter) return false;
    if (staffFilter !== "ALL" && app.staff_id !== staffFilter) return false;
    if (serviceFilter !== "ALL" && app.service_id !== serviceFilter) return false;

    if (dateFilter) {
      const appDateStr = new Date(app.start_datetime).toISOString().split("T")[0];
      if (appDateStr !== dateFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = app.booking_code.toLowerCase().includes(q);
      const matchCust = app.profiles?.full_name.toLowerCase().includes(q) || app.profiles?.email.toLowerCase().includes(q);
      const matchServ = app.services?.name.toLowerCase().includes(q);
      const matchStaff = app.staff?.full_name.toLowerCase().includes(q);
      if (!matchCode && !matchCust && !matchServ && !matchStaff) return false;
    }

    return true;
  });

  // Handle status update
  const handleStatusChange = async (appointmentId: string, newStatus: string, reason?: string) => {
    setStatusMessage(null);
    setSubmittingStatus(true);

    try {
      const res = await updateAdminAppointmentStatus({
        appointmentId,
        status: newStatus as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
        cancellationReason: reason,
      });

      if (res.error) {
        setStatusMessage({ type: "error", text: res.message || "Failed to update appointment." });
      } else {
        setStatusMessage({ type: "success", text: res.message || "Status updated successfully." });
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  appointment_status: newStatus,
                  payment_status: newStatus === "COMPLETED" ? "PAID" : a.payment_status,
                  cancellation_reason: reason || a.cancellation_reason,
                }
              : a
          )
        );
        if (selectedAppointment && selectedAppointment.id === appointmentId) {
          setSelectedAppointment({
            ...selectedAppointment,
            appointment_status: newStatus,
            payment_status: newStatus === "COMPLETED" ? "PAID" : selectedAppointment.payment_status,
            cancellation_reason: reason || selectedAppointment.cancellation_reason,
          });
        }
        router.refresh();
      }
    } catch {
      setStatusMessage({ type: "error", text: "An unexpected error occurred during status update." });
    } finally {
      setSubmittingStatus(false);
      setCancelModalAppointmentId(null);
      setCancellationReason("");
    }
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          className={`flex items-center gap-2 p-3.5 text-xs rounded-lg border ${
            statusMessage.type === "success"
              ? "bg-accent/10 text-foreground border-accent/30"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <Card className="p-4 border-border bg-card space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search booking code, customer name, email, stylist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-background"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Label htmlFor="filter-date" className="text-xs whitespace-nowrap">
              Date:
            </Label>
            <Input
              id="filter-date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs h-9 w-auto bg-background"
            />
            {dateFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateFilter("")}
                className="text-[11px] h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/80">
          {/* Status Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" /> Status Filter
            </Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-md border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="NO_SHOW">NO_SHOW</option>
            </select>
          </div>

          {/* Staff Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <UserCheck className="h-3 w-3" /> Stylist Filter
            </Label>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-md border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Stylists</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Service Filter
            </Label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-md border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Services</option>
              {servicesList.map((sv) => (
                <option key={sv.id} value={sv.id}>
                  {sv.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Appointments List / Table */}
      {filteredAppointments.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border bg-card space-y-2">
          <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-semibold text-foreground">No Appointments Found</h4>
          <p className="text-xs text-muted-foreground">
            No salon appointments match the selected search criteria or filters.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Showing {filteredAppointments.length} appointment reservation(s)</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredAppointments.map((app) => {
              const startDate = new Date(app.start_datetime);
              const endDate = new Date(app.end_datetime);
              const formattedDate = format(startDate, "EEE, MMM d, yyyy");
              const formattedStartTime = format(startDate, "h:mm a");
              const formattedEndTime = format(endDate, "h:mm a");

              return (
                <Card
                  key={app.id}
                  className="p-4 border-border bg-card hover:border-accent/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent bg-accent/5 px-2.5 py-1 rounded border border-accent/20">
                        {app.booking_code}
                      </span>
                      <Badge
                        variant={
                          app.appointment_status === "COMPLETED"
                            ? "accent"
                            : app.appointment_status === "CANCELLED"
                            ? "destructive"
                            : app.appointment_status === "CONFIRMED"
                            ? "accent"
                            : "outline"
                        }
                        className="text-[10px] font-semibold"
                      >
                        {app.appointment_status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                        Payment: {app.payment_status}
                      </Badge>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      Booked on {format(new Date(app.created_at), "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {/* Customer */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Customer</span>
                      <p className="font-semibold text-foreground">{app.profiles?.full_name || "Guest Customer"}</p>
                      <p className="text-[11px] text-muted-foreground">{app.profiles?.email}</p>
                      <p className="text-[11px] text-muted-foreground">{app.profiles?.phone || "No phone"}</p>
                    </div>

                    {/* Service & Stylist */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Service & Stylist</span>
                      <p className="font-semibold text-foreground">{app.services?.name || "Treatment"}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Stylist: <span className="text-foreground">{app.staff?.full_name || "Any Stylist"}</span>
                      </p>
                      <p className="text-[11px] text-accent font-medium">
                        Duration: {app.services?.duration_minutes || 30} Mins
                      </p>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Scheduled Time</span>
                      <p className="font-semibold text-foreground">{formattedDate}</p>
                      <p className="text-[11px] text-accent font-medium">
                        {formattedStartTime} – {formattedEndTime}
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="space-y-0.5 sm:text-right flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Authoritative Amount</span>
                        <p className="font-serif text-lg font-bold text-foreground">
                          {formatINR(app.amount)}
                        </p>
                      </div>

                      {/* Action Buttons Bar */}
                      <div className="flex items-center gap-1.5 pt-2 sm:justify-end flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(app);
                            setIsDetailOpen(true);
                          }}
                          className="text-[11px] h-7 px-2 gap-1"
                        >
                          <Eye className="h-3 w-3" /> Details
                        </Button>

                        {app.appointment_status !== "CONFIRMED" && app.appointment_status !== "COMPLETED" && app.appointment_status !== "CANCELLED" && (
                          <Button
                            variant="accent"
                            size="sm"
                            disabled={submittingStatus}
                            onClick={() => handleStatusChange(app.id, "CONFIRMED")}
                            className="text-[11px] h-7 px-2 font-semibold"
                          >
                            Confirm
                          </Button>
                        )}

                        {app.appointment_status !== "COMPLETED" && app.appointment_status !== "CANCELLED" && (
                          <Button
                            variant="accent"
                            size="sm"
                            disabled={submittingStatus}
                            onClick={() => handleStatusChange(app.id, "COMPLETED")}
                            className="text-[11px] h-7 px-2 font-semibold bg-accent text-accent-foreground"
                          >
                            Complete
                          </Button>
                        )}

                        {app.appointment_status !== "CANCELLED" && app.appointment_status !== "COMPLETED" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={submittingStatus}
                            onClick={() => setCancelModalAppointmentId(app.id)}
                            className="text-[11px] h-7 px-2 font-semibold"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold text-accent border-accent/30 bg-accent/5">
                  {selectedAppointment.booking_code}
                </Badge>
                <Badge variant="accent" className="text-xs font-semibold">
                  {selectedAppointment.appointment_status}
                </Badge>
              </div>
              <DialogTitle className="font-serif text-xl font-semibold">
                Appointment Record & Audit Trail
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Authoritative record details, customer contact info, payment metrics, and status event logs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-3 text-xs">
              {/* Customer Info Card */}
              <div className="p-3.5 rounded-lg bg-secondary/50 border border-border space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-accent flex items-center gap-1">
                  <UserCheck className="h-3 w-3" /> Customer Information
                </span>
                <p className="font-semibold text-foreground text-sm">{selectedAppointment.profiles?.full_name}</p>
                <p className="text-muted-foreground">Email: {selectedAppointment.profiles?.email}</p>
                <p className="text-muted-foreground">Phone: {selectedAppointment.profiles?.phone || "N/A"}</p>
              </div>

              {/* Service & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-secondary/50 border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-accent flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Scheduled Time & Duration
                  </span>
                  <p className="font-semibold text-foreground">
                    {format(new Date(selectedAppointment.start_datetime), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-accent font-medium">
                    {format(new Date(selectedAppointment.start_datetime), "h:mm a")} – {format(new Date(selectedAppointment.end_datetime), "h:mm a")}
                  </p>
                  <p className="text-muted-foreground">{selectedAppointment.services?.duration_minutes || 30} Minutes</p>
                </div>

                <div className="p-3.5 rounded-lg bg-secondary/50 border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-accent flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Service & Price
                  </span>
                  <p className="font-semibold text-foreground">{selectedAppointment.services?.name}</p>
                  <p className="text-muted-foreground">Stylist: {selectedAppointment.staff?.full_name || "Any Stylist"}</p>
                  <p className="font-serif text-base font-bold text-foreground">
                    {formatINR(selectedAppointment.amount)} ({selectedAppointment.payment_status})
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="space-y-1 p-3 rounded-lg bg-card border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3 text-accent" /> Customer Notes
                  </span>
                  <p className="italic text-foreground/90">&ldquo;{selectedAppointment.notes}&rdquo;</p>
                </div>
              )}

              {/* Audit Trail Event History */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <History className="h-4 w-4 text-accent" />
                  Audit Event History Log
                </span>

                {selectedAppointment.appointment_events && selectedAppointment.appointment_events.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAppointment.appointment_events.map((ev) => (
                      <div key={ev.id} className="p-2.5 rounded bg-card border border-border text-[11px] flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-foreground">Event: {ev.event_type}</p>
                          <p className="text-muted-foreground">
                            Status: {ev.old_status || "NONE"} &rarr; <span className="font-semibold text-accent">{ev.new_status}</span>
                          </p>
                        </div>
                        <span className="text-muted-foreground text-[10px]">
                          {format(new Date(ev.created_at), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No event log entries found.</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)} className="text-xs">
                Close Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Reason Modal */}
      {cancelModalAppointmentId && (
        <Dialog open={Boolean(cancelModalAppointmentId)} onOpenChange={() => setCancelModalAppointmentId(null)}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="h-6 w-6" />
              </div>
              <DialogTitle className="font-serif text-lg font-semibold">
                Cancel Appointment Record
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Please enter a reason for cancelling this appointment reservation. An audit event will be recorded.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <Label htmlFor="cancel-reason" className="text-xs">Cancellation Reason (Optional)</Label>
              <Input
                id="cancel-reason"
                className="text-xs"
                placeholder="Client requested, stylist unavailable, etc."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCancelModalAppointmentId(null)} disabled={submittingStatus}>
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={submittingStatus}
                onClick={() => handleStatusChange(cancelModalAppointmentId, "CANCELLED", cancellationReason)}
                className="font-semibold text-xs gap-1.5"
              >
                {submittingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

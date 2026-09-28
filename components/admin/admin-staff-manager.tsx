"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAdminStaff, saveStaffWorkingHours } from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  Clock,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ServiceOption {
  id: string;
  name: string;
}

interface StaffWorkingHour {
  day_of_week: number;
  is_working: boolean;
  start_time: string;
  end_time: string;
}

interface StaffServiceRelation {
  service_id: string;
  services?: { id: string; name: string } | null;
}

interface StaffRecord {
  id: string;
  full_name: string;
  role_title: string;
  bio: string | null;
  phone: string | null;
  photo_url: string | null;
  is_active: boolean;
  staff_services?: StaffServiceRelation[];
  staff_working_hours?: StaffWorkingHour[];
}

interface AdminStaffManagerProps {
  initialStaffList: StaffRecord[];
  allServices: ServiceOption[];
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AdminStaffManager({ initialStaffList, allServices }: AdminStaffManagerProps) {
  const router = useRouter();

  const [staffList, setStaffList] = useState<StaffRecord[]>(initialStaffList);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  // Staff Form State
  const [fullName, setFullName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Working Hours State
  const [workingHoursState, setWorkingHoursState] = useState<StaffWorkingHour[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Open Create/Edit Modal
  const handleOpenForm = (staff?: StaffRecord) => {
    setMessage(null);
    if (staff) {
      setSelectedStaff(staff);
      setFullName(staff.full_name);
      setRoleTitle(staff.role_title);
      setBio(staff.bio || "");
      setPhone(staff.phone || "");
      setPhotoUrl(staff.photo_url || "");
      setIsActive(staff.is_active);
      const assignedIds = staff.staff_services?.map((ss) => ss.service_id) || [];
      setSelectedServiceIds(assignedIds);
    } else {
      setSelectedStaff(null);
      setFullName("");
      setRoleTitle("");
      setBio("");
      setPhone("");
      setPhotoUrl("");
      setIsActive(true);
      setSelectedServiceIds([]);
    }
    setIsFormOpen(true);
  };

  // Toggle Service Checkbox
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  // Submit Staff Form
  const handleSubmitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await saveAdminStaff({
        id: selectedStaff?.id,
        fullName,
        roleTitle,
        bio,
        phone,
        photoUrl,
        isActive,
        serviceIds: selectedServiceIds,
      });

      if (res.error) {
        setMessage({ type: "error", text: res.message || "Failed to save staff record." });
      } else {
        setMessage({ type: "success", text: res.message || "Staff profile saved successfully." });
        setIsFormOpen(false);
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred while saving." });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Soft Active Status
  const handleToggleActive = async (staff: StaffRecord) => {
    setMessage(null);
    try {
      const res = await saveAdminStaff({
        id: staff.id,
        fullName: staff.full_name,
        roleTitle: staff.role_title,
        bio: staff.bio,
        phone: staff.phone,
        photoUrl: staff.photo_url,
        isActive: !staff.is_active,
        serviceIds: staff.staff_services?.map((ss) => ss.service_id),
      });

      if (res.error) {
        setMessage({ type: "error", text: res.message });
      } else {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staff.id ? { ...s, is_active: !staff.is_active } : s))
        );
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to toggle active status." });
    }
  };

  // Open Working Hours Modal
  const handleOpenHours = (staff: StaffRecord) => {
    setSelectedStaff(staff);
    const existing = staff.staff_working_hours || [];
    const fullWeek = Array.from({ length: 7 }).map((_, day) => {
      const found = existing.find((h) => h.day_of_week === day);
      return (
        found || {
          day_of_week: day,
          is_working: day !== 0, // Default Sunday closed
          start_time: "09:00:00",
          end_time: "18:00:00",
        }
      );
    });
    setWorkingHoursState(fullWeek);
    setIsHoursModalOpen(true);
  };

  // Save Working Hours
  const handleSaveHours = async () => {
    if (!selectedStaff) return;
    setSubmitting(true);
    try {
      const res = await saveStaffWorkingHours(selectedStaff.id, workingHoursState);
      if (res.error) {
        setMessage({ type: "error", text: res.message });
      } else {
        setMessage({ type: "success", text: "Working hours updated." });
        setIsHoursModalOpen(false);
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save working hours." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-2 p-3.5 text-xs rounded-lg border ${
            message.type === "success"
              ? "bg-accent/10 text-foreground border-accent/30"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">Stylist & Specialist Roster</h3>
          <p className="text-xs text-muted-foreground">Manage active stylists, service qualifications, and shift hours.</p>
        </div>

        <Button variant="accent" size="sm" onClick={() => handleOpenForm()} className="font-semibold text-xs gap-1.5">
          <Plus className="h-4 w-4" /> Add New Stylist
        </Button>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffList.map((st) => {
          const initials = st.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          const assignedServices = st.staff_services?.map((ss) => ss.services?.name).filter(Boolean) || [];

          return (
            <Card
              key={st.id}
              className={`p-5 border-border bg-card space-y-4 transition-all ${
                !st.is_active ? "opacity-60" : "hover:border-accent/40"
              }`}
            >
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <Avatar className="h-12 w-12 border-2 border-accent/30">
                  {st.photo_url ? (
                    <AvatarImage src={st.photo_url} alt={st.full_name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-accent text-accent-foreground font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-semibold text-foreground truncate">{st.full_name}</h4>
                    <Badge variant={st.is_active ? "accent" : "outline"} className="text-[9px] px-1.5 py-0">
                      {st.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{st.role_title}</p>
                </div>
              </div>

              {/* Bio & Phone */}
              {st.bio && <p className="text-xs text-muted-foreground line-clamp-2 italic">&ldquo;{st.bio}&rdquo;</p>}

              {/* Assigned Service Qualifications */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Scissors className="h-3 w-3 text-accent" /> Qualified Services ({assignedServices.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {assignedServices.length > 0 ? (
                    assignedServices.map((name, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] text-muted-foreground bg-secondary/40">
                        {name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">No services assigned yet</span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border/80">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(st)}
                  className={`text-[11px] h-7 px-2 font-semibold ${st.is_active ? "text-destructive" : "text-accent"}`}
                >
                  {st.is_active ? "Deactivate" : "Activate"}
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenHours(st)}
                    className="text-[11px] h-7 px-2 gap-1"
                  >
                    <Clock className="h-3 w-3" /> Hours
                  </Button>

                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleOpenForm(st)}
                    className="text-[11px] h-7 px-2 gap-1 font-semibold"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Staff Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-xl font-semibold">
              {selectedStaff ? "Edit Stylist Profile" : "Add New Salon Stylist"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure stylist name, role title, bio, photo URL, and assign qualified treatment services.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitStaff} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="st-name" className="text-xs">Full Name</Label>
                <Input
                  id="st-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aisha Sharma"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="st-role" className="text-xs">Role Title</Label>
                <Input
                  id="st-role"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Master Hair Stylist"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="st-phone" className="text-xs">Phone Number</Label>
                <Input
                  id="st-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 90000 00000"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="st-photo" className="text-xs">Photo URL</Label>
                <Input
                  id="st-photo"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="st-bio" className="text-xs">Bio & Specialization</Label>
                <textarea
                  id="st-bio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="10+ years experience in couture hair coloring and balayage..."
                  className="w-full rounded-md border border-border bg-background p-2 text-xs"
                />
              </div>
            </div>

            {/* Service Qualifications Checklist */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs font-semibold text-foreground">Assigned Qualified Services</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-lg border border-border bg-secondary/30 text-xs">
                {allServices.map((sv) => (
                  <label key={sv.id} className="flex items-center gap-2 cursor-pointer hover:text-accent">
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(sv.id)}
                      onChange={() => handleServiceToggle(sv.id)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="truncate">{sv.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsFormOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" disabled={submitting} className="font-semibold gap-1.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Stylist Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Staff Working Hours Modal */}
      {selectedStaff && (
        <Dialog open={isHoursModalOpen} onOpenChange={setIsHoursModalOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-serif text-lg font-semibold">
                Working Hours: {selectedStaff.full_name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set weekly working shifts and operating availability per day of week.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs">
              {workingHoursState.map((h, index) => (
                <div key={h.day_of_week} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-secondary/30 gap-2">
                  <div className="flex items-center gap-2 w-28">
                    <input
                      type="checkbox"
                      checked={h.is_working}
                      onChange={(e) => {
                        const updated = [...workingHoursState];
                        updated[index].is_working = e.target.checked;
                        setWorkingHoursState(updated);
                      }}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="font-semibold text-foreground">{DAYS_OF_WEEK[h.day_of_week]}</span>
                  </div>

                  {h.is_working ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Input
                        type="time"
                        value={h.start_time}
                        onChange={(e) => {
                          const updated = [...workingHoursState];
                          updated[index].start_time = e.target.value;
                          setWorkingHoursState(updated);
                        }}
                        className="text-xs h-7 w-24 bg-background"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={h.end_time}
                        onChange={(e) => {
                          const updated = [...workingHoursState];
                          updated[index].end_time = e.target.value;
                          setWorkingHoursState(updated);
                        }}
                        className="text-xs h-7 w-24 bg-background"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Day Off</span>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsHoursModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={handleSaveHours} disabled={submitting} className="font-semibold">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Working Hours"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

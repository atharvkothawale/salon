"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateCustomerProfile } from "@/lib/actions/profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface ProfileFormProps {
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    role: string;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url || null);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Avatar Image File Upload Handler
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);

    // Client File Validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Invalid file type. Only JPG, PNG, and WebP images are allowed." });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setMessage({ type: "error", text: "File size exceeds 5 MB limit." });
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}/avatar.${fileExt}`;

      // Upsert avatar to 'avatars' storage bucket with user-scoped RLS
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setMessage({ type: "error", text: uploadError.message || "Failed to upload avatar image." });
        setUploading(false);
        return;
      }

      // Retrieve Public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(publicUrl);
      setMessage({ type: "success", text: "Avatar uploaded. Click Save Changes to update profile." });
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred during image upload." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await updateCustomerProfile({
        fullName,
        phone,
        avatarUrl,
      });

      if (res.error) {
        setMessage({ type: "error", text: res.message || "Failed to update profile." });
      } else {
        setMessage({ type: "success", text: "Profile details updated successfully." });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred while saving." });
    } finally {
      setSubmitting(false);
    }
  };

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="border-border bg-card shadow-sm p-6 sm:p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
        {/* Avatar Display & Upload */}
        <div className="relative group">
          <Avatar className="h-24 w-24 border-2 border-accent/40 shadow-sm">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-accent text-accent-foreground text-xl font-bold font-serif">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>

          <label
            htmlFor="avatar-upload-input"
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md cursor-pointer hover:bg-accent/90 transition-transform hover:scale-105"
            title="Upload new profile avatar"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </label>
          <input
            id="avatar-upload-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarFileChange}
            disabled={uploading}
          />
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">{fullName}</h2>
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold text-accent border-accent/30 bg-accent/5">
              {profile.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
          <p className="text-[11px] text-muted-foreground">Click the upload icon on your avatar to change photo (Max 5 MB)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="prof-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="prof-name"
                className="pl-9"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof-email">Email Address (Read-only)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="prof-email"
                type="email"
                className="pl-9 bg-muted/50 cursor-not-allowed"
                value={profile.email}
                disabled
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="prof-phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="prof-phone"
                className="pl-9"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={submitting || uploading}
            className="font-semibold text-xs gap-2 px-8"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

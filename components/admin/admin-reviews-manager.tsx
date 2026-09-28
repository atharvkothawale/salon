"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdminReviewModeration } from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle2, XCircle, Filter, AlertTriangle, Loader2, MessageSquare } from "lucide-react";

interface ReviewRecord {
  id: string;
  rating: number;
  comment: string | null;
  moderation_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  profiles?: { full_name: string; email: string; avatar_url: string | null } | null;
  appointments?: {
    booking_code: string;
    services?: { name: string } | null;
    staff?: { full_name: string } | null;
  } | null;
}

interface AdminReviewsManagerProps {
  initialReviews: ReviewRecord[];
}

export function AdminReviewsManager({ initialReviews }: AdminReviewsManagerProps) {
  const router = useRouter();

  const [reviews, setReviews] = useState<ReviewRecord[]>(initialReviews);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState(0);

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle Moderation Action
  const handleModeration = async (reviewId: string, status: "APPROVED" | "REJECTED" | "PENDING") => {
    setMessage(null);
    setSubmittingId(reviewId);

    try {
      const res = await updateAdminReviewModeration(reviewId, status);
      if (res.error) {
        setMessage({ type: "error", text: res.message });
      } else {
        setMessage({ type: "success", text: res.message });
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, moderation_status: status } : r))
        );
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update review moderation status." });
    } finally {
      setSubmittingId(null);
    }
  };

  // Filter Reviews
  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== "ALL" && r.moderation_status !== statusFilter) return false;
    if (ratingFilter > 0 && r.rating !== ratingFilter) return false;
    return true;
  });

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

      {/* Filter Toolbar */}
      <Card className="p-4 border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs h-9 rounded-md border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto"
            >
              <option value="ALL">All Moderation Statuses</option>
              <option value="PENDING">PENDING Approval</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
              className="text-xs h-9 rounded-md border border-border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-muted-foreground">
          Showing {filteredReviews.length} review(s)
        </span>
      </Card>

      {/* Reviews Cards List */}
      {filteredReviews.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border bg-card space-y-2">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-semibold text-foreground">No Reviews Found</h4>
          <p className="text-xs text-muted-foreground">No customer reviews match the selected moderation filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => {
            const initials = (rev.profiles?.full_name || "Guest")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            const isSubmittingThis = submittingId === rev.id;

            return (
              <Card key={rev.id} className="p-5 border-border bg-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-accent/30">
                      {rev.profiles?.avatar_url ? (
                        <AvatarImage src={rev.profiles.avatar_url} alt={rev.profiles.full_name} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-accent text-accent-foreground font-bold text-[10px]">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-foreground">{rev.profiles?.full_name || "Guest"}</h4>
                      <p className="text-[10px] text-muted-foreground">{rev.profiles?.email}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      rev.moderation_status === "APPROVED"
                        ? "accent"
                        : rev.moderation_status === "REJECTED"
                        ? "destructive"
                        : "outline"
                    }
                    className="text-[10px] font-semibold px-2 py-0.5"
                  >
                    {rev.moderation_status}
                  </Badge>
                </div>

                {/* Rating Stars & Comment */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < rev.rating ? "fill-accent text-accent" : "text-border"}`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-foreground ml-1.5">{rev.rating} / 5</span>
                  </div>

                  {rev.comment ? (
                    <p className="text-xs text-foreground/90 italic bg-secondary/30 p-2.5 rounded border border-border">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No written comment provided.</p>
                  )}
                </div>

                {/* Appointment Context */}
                <div className="text-[11px] text-muted-foreground flex justify-between items-center pt-2 border-t border-border/80">
                  <div>
                    <span className="font-semibold text-foreground">{rev.appointments?.services?.name || "Treatment"}</span>
                    <span> • Stylist: {rev.appointments?.staff?.full_name || "Any Stylist"}</span>
                  </div>
                  <span className="font-mono text-[10px] text-accent font-bold">
                    {rev.appointments?.booking_code}
                  </span>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  {rev.moderation_status !== "APPROVED" && (
                    <Button
                      variant="accent"
                      size="sm"
                      disabled={isSubmittingThis}
                      onClick={() => handleModeration(rev.id, "APPROVED")}
                      className="text-[11px] h-7 px-2.5 font-semibold gap-1"
                    >
                      {isSubmittingThis ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                      Approve Review
                    </Button>
                  )}

                  {rev.moderation_status !== "REJECTED" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isSubmittingThis}
                      onClick={() => handleModeration(rev.id, "REJECTED")}
                      className="text-[11px] h-7 px-2.5 font-semibold gap-1"
                    >
                      {isSubmittingThis ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                      Reject Review
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

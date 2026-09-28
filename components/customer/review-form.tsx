"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/lib/actions/appointments";
import { Star, Loader2, AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ReviewFormProps {
  appointmentId: string;
  serviceName: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
    moderation_status: string;
  } | null;
}

export function ReviewForm({
  appointmentId,
  serviceName,
  existingReview,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(
    existingReview
      ? existingReview.moderation_status === "APPROVED"
        ? "Your review has been published."
        : "Your review has been submitted and is awaiting approval."
      : null
  );

  if (submittedMessage) {
    return (
      <Card className="border-border bg-card p-6 text-center space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h4 className="font-serif text-lg font-semibold text-foreground">Thank You for Your Feedback!</h4>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">{submittedMessage}</p>
        <div className="flex items-center justify-center gap-1 text-accent pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "fill-accent text-accent" : "text-border"
              }`}
            />
          ))}
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await submitReview({
        appointmentId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (res.error) {
        setError(res.message || "Failed to submit review.");
        setSubmitting(false);
      } else {
        setSubmittedMessage(res.message || "Review submitted successfully.");
        setSubmitting(false);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred while submitting your review.");
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <Card className="border-border bg-card p-6 space-y-5">
      <div className="space-y-1">
        <h4 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" />
          Leave a Treatment Review
        </h4>
        <p className="text-xs text-muted-foreground">
          How was your experience with your {serviceName} session?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Rating Stars Selection */}
        <div className="space-y-1.5">
          <Label className="text-xs">Overall Rating</Label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const starValue = index + 1;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-ring transition-transform hover:scale-110"
                  aria-label={`Rate ${starValue} stars out of 5`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      starValue <= displayRating
                        ? "fill-accent text-accent"
                        : "text-border hover:text-accent/60"
                    }`}
                  />
                </button>
              );
            })}
            <span className="text-xs font-semibold text-foreground ml-2">
              {displayRating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Comment Text Area */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="review-comment" className="text-xs">Your Review & Feedback (Optional)</Label>
            <span className="text-[10px] text-muted-foreground">{comment.length}/1000</span>
          </div>
          <textarea
            id="review-comment"
            maxLength={1000}
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience, hair results, or stylist service..."
            className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </div>

        <Button
          type="submit"
          variant="accent"
          size="sm"
          disabled={submitting}
          className="font-semibold text-xs gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Review...</span>
            </>
          ) : (
            "Submit Review for Moderation"
          )}
        </Button>
      </form>
    </Card>
  );
}

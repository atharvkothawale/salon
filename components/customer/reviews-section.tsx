import React from "react";
import { Star, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="py-16 md:py-24 bg-card/40 border-t border-border/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold flex items-center justify-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            Client Testimonials
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Loved by Our Guests
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Read verified experiences and reviews shared by our salon guests.
          </p>
        </div>

        {/* Reviews Grid / Empty State */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => {
              const name = rev.profiles?.full_name || "Verified Client";
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <Card key={rev.id} className="border-border bg-card p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-accent">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rev.rating ? "fill-accent text-accent" : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-foreground/90 italic leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{name}</p>
                      <p className="text-[10px] text-muted-foreground">Verified Salon Guest</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 max-w-md mx-auto border border-dashed border-border rounded-xl bg-card">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-foreground mb-1">No Reviews Published Yet</h4>
            <p className="text-xs text-muted-foreground">
              Be among our first guests to experience our haute salon treatments and leave a review.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

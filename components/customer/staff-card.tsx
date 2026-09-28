import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StaffCardProps {
  id: string;
  name: string;
  roleTitle: string;
  bio: string | null;
  photoUrl: string | null;
  specialties?: string[];
}

export function StaffCard({
  id,
  name,
  roleTitle,
  bio,
  photoUrl,
  specialties = [],
}: StaffCardProps) {
  const defaultPhoto =
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400";

  return (
    <Card className="group overflow-hidden border-border bg-card flex flex-col h-full hover:border-accent/40 transition-all duration-300 hover:shadow-md">
      {/* Staff Portrait Photo */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
        <Image
          src={photoUrl || defaultPhoto}
          alt={name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="font-serif text-xl font-semibold tracking-tight leading-tight">
            {name}
          </h3>
          <p className="text-xs text-white/80 font-medium tracking-wide">
            {roleTitle}
          </p>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {bio || "Dedicated salon professional specializing in tailored cut, color, and wellness treatments."}
        </p>

        {specialties.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Specialties
            </span>
            <div className="flex flex-wrap gap-1.5">
              {specialties.slice(0, 3).map((spec, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[10px] font-medium bg-secondary text-secondary-foreground"
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="px-5 pb-5 pt-0">
        <Link href={`/book?staffId=${id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-2 group-hover:border-accent group-hover:text-accent">
            <Calendar className="h-3.5 w-3.5" />
            Book with {name.split(" ")[0]}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

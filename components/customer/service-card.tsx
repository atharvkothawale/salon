import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SALON_CONFIG } from "@/lib/constants/theme";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
  categoryName?: string;
}

export function ServiceCard({
  id,
  name,
  description,
  price,
  durationMinutes,
  imageUrl,
  categoryName,
}: ServiceCardProps) {
  const defaultImage =
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600";

  return (
    <Card className="group overflow-hidden border-border bg-card flex flex-col h-full hover:border-accent/40 transition-all duration-300 hover:shadow-md">
      {/* Image Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
        <Image
          src={imageUrl || defaultImage}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {categoryName && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs text-[10px] uppercase tracking-wider font-semibold border border-border">
              {categoryName}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <Link href={`/services/${id}`} className="group-hover:text-accent transition-colors">
            <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground flex items-center justify-between">
              <span>{name}</span>
              <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description || "Personalized treatment tailored by our master stylists."}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-accent" />
            <span>{durationMinutes} min</span>
          </div>
          <div className="font-serif text-base font-semibold text-foreground">
            {SALON_CONFIG.currency.symbol}{price.toFixed(2)}
          </div>
        </div>
      </CardContent>

      {/* Action Footer */}
      <CardFooter className="px-5 pb-5 pt-0">
        <Link href={`/book?serviceId=${id}`} className="w-full">
          <Button variant="accent" size="sm" className="w-full text-xs font-semibold gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Book Service
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

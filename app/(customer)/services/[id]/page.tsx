import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceById, getActiveStaff } from "@/services/public-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowLeft, CheckCircle2, UserCheck } from "lucide-react";
import { SALON_CONFIG } from "@/lib/constants/theme";
import { formatINR } from "@/lib/utils";

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) return { title: "Service Not Found" };
  return {
    title: `${service.name} — Salon Treatment`,
    description: service.description || `Book ${service.name} at ${SALON_CONFIG.name}.`,
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = await params;
  const [service, allStaff] = await Promise.all([
    getServiceById(id),
    getActiveStaff(),
  ]);

  if (!service || !service.is_active) {
    notFound();
  }

  // Filter staff who perform this service
  const qualifiedStaff = allStaff.filter((st) =>
    st.staff_services?.some((ss: { services: { name: string } | null }) => ss.services?.name === service.name)
  );

  const defaultImage =
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Back Button */}
      <Link href="/services" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Services Menu
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Image */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-secondary shadow-md">
            <Image
              src={service.image_url || defaultImage}
              alt={service.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Right Column: Service Details */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3">
            {service.service_categories?.name && (
              <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                {service.service_categories.name}
              </Badge>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              {service.name}
            </h1>
            <div className="flex items-center gap-6 pt-1 text-sm font-medium">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-accent" />
                <span>{service.duration_minutes} Minutes Session</span>
              </div>
              <div className="font-serif text-2xl font-bold text-foreground">
                {formatINR(service.price)}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-foreground">
              Treatment Overview
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {service.description ||
                "Enjoy an exquisite, tailored atelier session with scalp diagnostics, luxury organic hair formulations, and a customized finish."}
            </p>

            <ul className="space-y-2 pt-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                <span>Includes comprehensive personal consultation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                <span>Organic, cruelty-free professional salon products</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                <span>Complimentary beverage selection (champagne, artisan tea, espresso)</span>
              </li>
            </ul>
          </div>

          {/* Qualified Staff Showcase */}
          {qualifiedStaff.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-accent" />
                Stylists Qualified for this Treatment
              </h4>
              <div className="flex flex-wrap gap-2">
                {qualifiedStaff.map((staff) => (
                  <Link key={staff.id} href={`/book?serviceId=${service.id}&staffId=${staff.id}`}>
                    <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium bg-card hover:bg-secondary transition-colors cursor-pointer border-border">
                      {staff.full_name} ({staff.role_title})
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-6 border-t border-border">
            <Link href={`/book?serviceId=${service.id}`}>
              <Button variant="accent" size="lg" className="w-full sm:w-auto px-10 py-6 text-sm font-semibold gap-2 shadow-md">
                <Calendar className="h-4 w-4" />
                Book This Service Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

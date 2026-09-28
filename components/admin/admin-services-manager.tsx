"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveAdminService, saveAdminCategory } from "@/lib/actions/admin";
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
import { SALON_CONFIG } from "@/lib/constants/theme";
import { formatINR } from "@/lib/utils";
import { Plus, Edit2, Clock, DollarSign, CheckCircle2, AlertTriangle, Loader2, Layers } from "lucide-react";

interface CategoryRecord {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface ServiceRecord {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  is_active: boolean;
  service_categories?: { name: string } | null;
}

interface AdminServicesManagerProps {
  initialServices: ServiceRecord[];
  initialCategories: CategoryRecord[];
}

export function AdminServicesManager({ initialServices, initialCategories }: AdminServicesManagerProps) {
  const router = useRouter();

  const [services] = useState<ServiceRecord[]>(initialServices);
  const [categories] = useState<CategoryRecord[]>(initialCategories);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryRecord | null>(null);

  // Service Form State
  const [serviceName, setServiceName] = useState("");
  const [serviceCategoryId, setServiceCategoryId] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState<number>(50);
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [serviceImageUrl, setServiceImageUrl] = useState("");
  const [serviceIsActive, setServiceIsActive] = useState(true);

  // Category Form State
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catSortOrder, setCatSortOrder] = useState(0);
  const [catIsActive, setCatIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Open Service Modal
  const handleOpenServiceModal = (sv?: ServiceRecord) => {
    setMessage(null);
    if (sv) {
      setSelectedService(sv);
      setServiceName(sv.name);
      setServiceCategoryId(sv.category_id);
      setServiceDescription(sv.description || "");
      setServicePrice(Number(sv.price));
      setServiceDuration(sv.duration_minutes);
      setServiceImageUrl(sv.image_url || "");
      setServiceIsActive(sv.is_active);
    } else {
      setSelectedService(null);
      setServiceName("");
      setServiceCategoryId(categories[0]?.id || "");
      setServiceDescription("");
      setServicePrice(50);
      setServiceDuration(30);
      setServiceImageUrl("");
      setServiceIsActive(true);
    }
    setIsServiceModalOpen(true);
  };

  // Open Category Modal
  const handleOpenCategoryModal = (cat?: CategoryRecord) => {
    setMessage(null);
    if (cat) {
      setSelectedCategory(cat);
      setCatName(cat.name);
      setCatDescription(cat.description || "");
      setCatSortOrder(cat.sort_order);
      setCatIsActive(cat.is_active);
    } else {
      setSelectedCategory(null);
      setCatName("");
      setCatDescription("");
      setCatSortOrder(0);
      setCatIsActive(true);
    }
    setIsCategoryModalOpen(true);
  };

  // Save Service Submit
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await saveAdminService({
        id: selectedService?.id,
        categoryId: serviceCategoryId,
        name: serviceName,
        description: serviceDescription,
        price: servicePrice,
        durationMinutes: serviceDuration,
        imageUrl: serviceImageUrl,
        isActive: serviceIsActive,
      });

      if (res.error) {
        setMessage({ type: "error", text: res.message || "Failed to save service." });
      } else {
        setMessage({ type: "success", text: res.message || "Service saved successfully." });
        setIsServiceModalOpen(false);
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred while saving." });
    } finally {
      setSubmitting(false);
    }
  };

  // Save Category Submit
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await saveAdminCategory({
        id: selectedCategory?.id,
        name: catName,
        description: catDescription,
        sortOrder: catSortOrder,
        isActive: catIsActive,
      });

      if (res.error) {
        setMessage({ type: "error", text: res.message || "Failed to save category." });
      } else {
        setMessage({ type: "success", text: res.message || "Category saved successfully." });
        setIsCategoryModalOpen(false);
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Services
  const filteredServices = services.filter((sv) => {
    if (selectedCategoryFilter !== "ALL" && sv.category_id !== selectedCategoryFilter) {
      return false;
    }
    return true;
  });

  const defaultImg = "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600";

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

      {/* Categories Toolbar & Actions */}
      <Card className="p-4 border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">Treatment Catalog</h3>
            <p className="text-xs text-muted-foreground">Manage salon treatment offerings, pricing, durations, and categories.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenCategoryModal()} className="text-xs gap-1.5">
              <Layers className="h-4 w-4 text-accent" /> Manage Categories
            </Button>

            <Button variant="accent" size="sm" onClick={() => handleOpenServiceModal()} className="text-xs font-semibold gap-1.5">
              <Plus className="h-4 w-4" /> Add New Treatment
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border overflow-x-auto">
          <button
            onClick={() => setSelectedCategoryFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategoryFilter === "ALL"
                ? "bg-accent text-accent-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Services ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategoryFilter === cat.id
                  ? "bg-accent text-accent-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((sv) => (
          <Card
            key={sv.id}
            className={`p-5 border-border bg-card space-y-4 transition-all ${
              !sv.is_active ? "opacity-60" : "hover:border-accent/40"
            }`}
          >
            <div className="flex gap-4 items-center">
              <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary border border-border">
                <Image
                  src={sv.image_url || defaultImg}
                  alt={sv.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-serif text-base font-semibold text-foreground truncate">{sv.name}</h4>
                  <Badge variant={sv.is_active ? "accent" : "outline"} className="text-[9px] px-1.5 py-0 shrink-0">
                    {sv.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{sv.service_categories?.name || "Care Category"}</p>
              </div>
            </div>

            {sv.description && <p className="text-xs text-muted-foreground line-clamp-2">{sv.description}</p>}

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-accent" /> Duration
                </span>
                <p className="font-semibold text-foreground">{sv.duration_minutes} Mins</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-end gap-1">
                  <DollarSign className="h-3 w-3 text-accent" /> Price
                </span>
                <p className="font-serif font-bold text-foreground text-sm">
                  {formatINR(sv.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenServiceModal(sv)}
                className="text-[11px] h-7 px-3 font-semibold gap-1"
              >
                <Edit2 className="h-3 w-3" /> Edit Treatment
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Service Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-xl font-semibold">
              {selectedService ? "Edit Treatment Service" : "Add New Salon Treatment"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set authoritative treatment details, category, price, duration, and active booking status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveService} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="sv-name" className="text-xs">Treatment Name</Label>
                <Input
                  id="sv-name"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Signature Haute Haircut"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="sv-cat" className="text-xs">Category</Label>
                <select
                  id="sv-cat"
                  value={serviceCategoryId}
                  onChange={(e) => setServiceCategoryId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background h-9 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="" disabled>Select category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="sv-price" className="text-xs">Price ({SALON_CONFIG.currency.symbol})</Label>
                <Input
                  id="sv-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(Number(e.target.value))}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sv-dur" className="text-xs">Duration (Minutes)</Label>
                <Input
                  id="sv-dur"
                  type="number"
                  step="5"
                  min="5"
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(Number(e.target.value))}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="sv-img" className="text-xs">Image URL</Label>
                <Input
                  id="sv-img"
                  value={serviceImageUrl}
                  onChange={(e) => setServiceImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="sv-desc" className="text-xs">Description</Label>
                <textarea
                  id="sv-desc"
                  rows={3}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Detailed treatment process, styling techniques, and hair care description..."
                  className="w-full rounded-md border border-border bg-background p-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-2 pt-1">
                <input
                  type="checkbox"
                  id="sv-active"
                  checked={serviceIsActive}
                  onChange={(e) => setServiceIsActive(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <Label htmlFor="sv-active" className="text-xs font-semibold cursor-pointer">
                  Active for customer booking
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsServiceModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" disabled={submitting} className="font-semibold gap-1.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Treatment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-lg font-semibold">
              {selectedCategory ? "Edit Service Category" : "Add Service Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Categories group salon services for client browsing and booking.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="cat-name" className="text-xs">Category Name</Label>
              <Input
                id="cat-name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Hair Care & Styling"
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cat-desc" className="text-xs">Description</Label>
              <Input
                id="cat-desc"
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                placeholder="Master haircuts, balayage, and treatments..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cat-sort" className="text-xs">Sort Order</Label>
              <Input
                id="cat-sort"
                type="number"
                value={catSortOrder}
                onChange={(e) => setCatSortOrder(Number(e.target.value))}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsCategoryModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" disabled={submitting} className="font-semibold">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

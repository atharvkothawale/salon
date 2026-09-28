"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { saveAdminCoupon } from "@/lib/actions/admin";
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
import { Tag, Plus, Edit2, CheckCircle2, AlertTriangle, Loader2, Calendar } from "lucide-react";

interface CouponRecord {
  id: string;
  code: string;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: number;
  minimum_amount: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
}

interface AdminOffersManagerProps {
  initialCoupons: CouponRecord[];
}

export function AdminOffersManager({ initialCoupons }: AdminOffersManagerProps) {
  const router = useRouter();

  const [coupons] = useState<CouponRecord[]>(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponRecord | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minimumAmount, setMinimumAmount] = useState<number>(0);
  const [validFrom, setValidFrom] = useState(() => new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(() =>
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleOpenModal = (cp?: CouponRecord) => {
    setMessage(null);
    if (cp) {
      setSelectedCoupon(cp);
      setCode(cp.code);
      setDiscountType(cp.discount_type);
      setDiscountValue(Number(cp.discount_value));
      setMinimumAmount(Number(cp.minimum_amount));
      setValidFrom(new Date(cp.valid_from).toISOString().split("T")[0]);
      setValidUntil(new Date(cp.valid_until).toISOString().split("T")[0]);
      setUsageLimit(cp.usage_limit || "");
      setIsActive(cp.is_active);
    } else {
      setSelectedCoupon(null);
      setCode("");
      setDiscountType("PERCENTAGE");
      setDiscountValue(15);
      setMinimumAmount(0);
      setValidFrom(new Date().toISOString().split("T")[0]);
      setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setUsageLimit("");
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await saveAdminCoupon({
        id: selectedCoupon?.id,
        code,
        discountType,
        discountValue,
        minimumAmount,
        validFrom: `${validFrom}T00:00:00.000Z`,
        validUntil: `${validUntil}T23:59:59.999Z`,
        usageLimit: usageLimit === "" ? null : Number(usageLimit),
        isActive,
      });

      if (res.error) {
        setMessage({ type: "error", text: res.message || "Failed to save coupon." });
      } else {
        setMessage({ type: "success", text: res.message || "Coupon code saved successfully." });
        setIsModalOpen(false);
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred while saving." });
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

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">Promotional Offer Coupons</h3>
          <p className="text-xs text-muted-foreground">Manage discount codes, percentage vouchers, and validity limits.</p>
        </div>

        <Button variant="accent" size="sm" onClick={() => handleOpenModal()} className="font-semibold text-xs gap-1.5">
          <Plus className="h-4 w-4" /> Create Coupon Code
        </Button>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border bg-card space-y-2">
          <Tag className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-semibold text-foreground">No Offers Configured</h4>
          <p className="text-xs text-muted-foreground">No promotional coupons exist in the system yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((cp) => (
            <Card key={cp.id} className={`p-5 border-border bg-card space-y-3 ${!cp.is_active ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-mono text-sm font-bold text-accent bg-accent/5 px-2.5 py-0.5 rounded border border-accent/30">
                  {cp.code}
                </span>
                <Badge variant={cp.is_active ? "accent" : "outline"} className="text-[10px] px-2 py-0.5">
                  {cp.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="font-serif text-lg font-bold text-foreground">
                  {cp.discount_type === "PERCENTAGE"
                    ? `${cp.discount_value}% OFF`
                    : `${formatINR(cp.discount_value)} OFF`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Min Amount: {formatINR(cp.minimum_amount)}
                </p>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground p-2.5 rounded bg-secondary/40 border border-border">
                <p className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-accent" />
                  <span>Valid: {format(new Date(cp.valid_from), "MMM d, yyyy")} – {format(new Date(cp.valid_until), "MMM d, yyyy")}</span>
                </p>
                <p>
                  Used: <span className="font-semibold text-foreground">{cp.used_count}</span>
                  {cp.usage_limit ? ` / ${cp.usage_limit} max limit` : " (Unlimited)"}
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(cp)}
                  className="text-[11px] h-7 px-2.5 font-semibold gap-1"
                >
                  <Edit2 className="h-3 w-3" /> Edit Code
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Coupon Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-lg font-semibold">
              {selectedCoupon ? "Edit Coupon Code" : "Create Promotional Coupon"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define promo code, discount type, value, validity date range, and usage limit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCoupon} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="cp-code" className="text-xs">Coupon Code (Uppercase)</Label>
              <Input
                id="cp-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. LUMIERE15"
                required
                className="text-xs font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cp-type" className="text-xs">Discount Type</Label>
                <select
                  id="cp-type"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED_AMOUNT")}
                  className="w-full rounded-md border border-border bg-background h-9 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="cp-val" className="text-xs">Discount Value</Label>
                <Input
                  id="cp-val"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cp-from" className="text-xs">Valid From Date</Label>
                <Input
                  id="cp-from"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cp-until" className="text-xs">Valid Until Date</Label>
                <Input
                  id="cp-until"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cp-min" className="text-xs">Minimum Booking Amount (₹)</Label>
                <Input
                  id="cp-min"
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumAmount}
                  onChange={(e) => setMinimumAmount(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cp-limit" className="text-xs">Usage Limit (Optional)</Label>
                <Input
                  id="cp-limit"
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Unlimited if blank"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="cp-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <Label htmlFor="cp-active" className="text-xs font-semibold cursor-pointer">
                Active for promotion
              </Label>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" disabled={submitting} className="font-semibold gap-1.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Promo Code"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { z } from "zod";

export const UpdateAppointmentStatusSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment ID"),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  cancellationReason: z.string().max(500).optional().nullable(),
});

export const StaffInputSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(2, "Full name is required").max(100),
  roleTitle: z.string().min(2, "Role title is required").max(100),
  bio: z.string().max(500, "Bio too long").optional().nullable(),
  phone: z.string().max(20, "Phone too long").optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  serviceIds: z.array(z.string().uuid()).optional(),
});

export const ServiceInputSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid("Please select a service category"),
  name: z.string().min(2, "Service name is required").max(100),
  description: z.string().max(1000, "Description too long").optional().nullable(),
  price: z.number().min(0, "Price cannot be negative"),
  durationMinutes: z.number().int().min(5, "Duration must be at least 5 minutes"),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const CategoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Category name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const CouponInputSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(3, "Code must be at least 3 characters").max(50),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minimumAmount: z.number().min(0, "Minimum amount cannot be negative").default(0),
  validFrom: z.string().min(1, "Valid from date is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const SalonSettingsInputSchema = z.object({
  salonName: z.string().min(2, "Salon name is required"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email("Invalid email address"),
  cancellationPolicy: z.string().optional().nullable(),
  bookingIntervalMinutes: z.number().int().min(5).max(120).default(30),
});

export const SalonClosureInputSchema = z.object({
  startDatetime: z.string().min(1, "Start datetime required"),
  endDatetime: z.string().min(1, "End datetime required"),
  reason: z.string().min(2, "Reason is required"),
});

export type UpdateAppointmentStatusInput = z.infer<typeof UpdateAppointmentStatusSchema>;
export type StaffInput = z.infer<typeof StaffInputSchema>;
export type ServiceInput = z.infer<typeof ServiceInputSchema>;
export type CategoryInput = z.infer<typeof CategoryInputSchema>;
export type CouponInput = z.infer<typeof CouponInputSchema>;
export type SalonSettingsInput = z.infer<typeof SalonSettingsInputSchema>;
export type SalonClosureInput = z.infer<typeof SalonClosureInputSchema>;

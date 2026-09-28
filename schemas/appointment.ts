import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID"),
  staffId: z.string().uuid("Invalid staff ID").optional().nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTimeIso: z.string().min(1, "Start time ISO string is required"),
  notes: z
    .string()
    .max(200, "Notes cannot exceed 200 characters")
    .optional()
    .nullable(),
});

export const CancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment ID"),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Name too long"),
  phone: z.string().max(20, "Phone number too long").optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export const SubmitReviewSchema = z.object({
  appointmentId: z.string().uuid("Invalid appointment ID"),
  rating: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().max(1000, "Comment cannot exceed 1000 characters").optional().nullable(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type SubmitReviewInput = z.infer<typeof SubmitReviewSchema>;

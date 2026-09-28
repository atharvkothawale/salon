import { z } from "zod";

export const AvailabilityQuerySchema = z.object({
  serviceId: z.string().uuid("Invalid service ID format"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  preferredStaffId: z.string().uuid("Invalid staff ID format").optional().nullable(),
});

export type AvailabilityQueryInput = z.infer<typeof AvailabilityQuerySchema>;

export type AvailabilityErrorReason =
  | "INVALID_INPUT"
  | "SERVICE_NOT_FOUND"
  | "SERVICE_INACTIVE"
  | "STAFF_NOT_FOUND"
  | "STAFF_NOT_QUALIFIED"
  | "SALON_CLOSED"
  | "SALON_CLOSURE_HOLIDAY"
  | "NO_AVAILABILITY";

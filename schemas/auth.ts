import { z } from "zod";

export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

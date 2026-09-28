export type UserRole = "customer" | "admin" | "staff";

export interface SalonBaseConfig {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  defaultAccent: string;
}

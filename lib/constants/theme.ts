export const SALON_CONFIG = {
  name: "Lumière Salon & Spa",
  tagline: "Uncompromising elegance & personalized hair & beauty care",
  defaultAccent: "#9E7757", // Champagne Gold / Muted Rose Accent
  currency: {
    code: "USD",
    symbol: "$",
  },
  contact: {
    phone: "+1 (555) 234-5678",
    email: "hello@lumieresalon.com",
    address: "124 Atelier Blvd, Suite 100, New York, NY 10012",
  },
  hours: {
    weekday: "9:00 AM - 8:00 PM",
    weekend: "10:00 AM - 6:00 PM",
  },
} as const;

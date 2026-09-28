export const SALON_CONFIG = {
  name: "Lumière Salon & Spa",
  tagline: "PREMIUM HAIR • BEAUTY • WELLNESS",
  defaultAccent: "#9E7757", // Champagne Gold Accent
  currency: {
    code: "INR",
    symbol: "₹",
  },
  contact: {
    phone: "+91 90000 00000",
    whatsappPhone: "919000000000",
    whatsappUrl: "https://wa.me/919000000000?text=Hello%20Lumi%C3%A8re%20Salon%2C%20I%20would%20like%20to%20inquire%20about%20an%20appointment.",
    email: "hello@lumieresalon.com",
    address: "Baner, Pune, Maharashtra, India",
    city: "Pune",
    state: "Maharashtra",
  },
  hours: {
    weekday: "9:00 AM - 8:00 PM",
    weekend: "10:00 AM - 6:00 PM",
  },
} as const;

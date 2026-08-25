export const BUSINESS_TYPES = [
  "D2C / Ecommerce",
  "Local Business",
  "Real Estate",
  "Healthcare",
  "Coaching / Consulting",
  "Startup",
  "Luxury Brand",
  "Other",
] as const;

export const AD_BUDGETS = [
  "Not yet spending",
  "Under ₹50,000",
  "₹50,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "₹5,00,000+",
] as const;

export const CONTACT_METHODS = ["Email", "Phone", "WhatsApp"] as const;

// Mirrors the real categories in the Services section — not generic agency options.
export const SERVICE_INTERESTS = [
  "Performance Marketing",
  "SEO & Local",
  "Web & Landing Pages",
  "Content & Social",
  "Automation & CRO",
  "Brand & Strategy",
] as const;

export const SERVICE_BLURBS: Record<(typeof SERVICE_INTERESTS)[number], string> = {
  "Performance Marketing": "Ads that hit a CAC target, not just reach.",
  "SEO & Local": "Show up where buyers are already searching.",
  "Web & Landing Pages": "Pages built to convert, not just look nice.",
  "Content & Social": "Content and email that keep showing up.",
  "Automation & CRO": "Get more from the traffic you already have.",
  "Brand & Strategy": "Positioning that makes everything else work harder.",
};

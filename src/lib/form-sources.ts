export const FORM_SOURCES = ["Contact Form", "Newsletter Footer"] as const;

export type FormSource = (typeof FORM_SOURCES)[number];

export const CONTACT_FORM_SOURCE: FormSource = "Contact Form";
export const NEWSLETTER_FORM_SOURCE: FormSource = "Newsletter Footer";

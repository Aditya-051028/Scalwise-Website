export const FORM_SOURCES = ["Contact Form", "Newsletter Footer", "Custom Quote"] as const;

export type FormSource = (typeof FORM_SOURCES)[number];

export const CONTACT_FORM_SOURCE: FormSource = "Contact Form";
export const NEWSLETTER_FORM_SOURCE: FormSource = "Newsletter Footer";
export const CUSTOM_QUOTE_FORM_SOURCE: FormSource = "Custom Quote";

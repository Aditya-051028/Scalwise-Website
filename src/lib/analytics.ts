/**
 * Single integration point for product-funnel event tracking. No analytics
 * provider is wired up on this site yet — SiteSettings.analytics (ga4Id,
 * gtmId, metaPixelId, linkedInPartnerId) exists in the schema but nothing
 * reads it, and no GTM/GA snippet is loaded anywhere. This function is a
 * documented no-op until that lands: call sites (Buy Now buttons, the
 * download CTA, etc.) already fire the right event names and payloads, so
 * wiring a real provider later means filling in this one function, not
 * touching every call site.
 */
export type AnalyticsEvent =
  | "ebook_page_view"
  | "ebook_product_view"
  | "ai_cashflow_cta_click"
  | "ai_cashflow_buy_click"
  | "checkout_redirect"
  | "purchase_success"
  | "ebook_download";

export function trackEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event, payload ?? {});
  }
  // TODO: once GTM/GA4 is wired up (SiteSettings.analytics), dispatch here, e.g.:
  // window.dataLayer?.push({ event, ...payload });
}

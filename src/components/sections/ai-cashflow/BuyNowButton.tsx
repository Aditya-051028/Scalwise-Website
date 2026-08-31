"use client";

import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

type BuyNowButtonProps = {
  checkoutUrl?: string | null;
  active: boolean;
  label?: string;
  location: string;
  className?: string;
};

/** The one place Buy Now's live/inert behavior is decided. `active` requires
 *  both the product's status being "Available" and a real checkoutUrl being
 *  configured — until then this renders a disabled, clearly-labeled state
 *  instead of a broken link or a raw placeholder URL. Once a real gateway
 *  checkout link is set on the product, every instance of this button
 *  across the page goes live at once. */
export function BuyNowButton({
  checkoutUrl,
  active,
  label = "Buy Now",
  location,
  className = "",
}: BuyNowButtonProps) {
  if (!active || !checkoutUrl) {
    return (
      <Button variant="secondary" disabled className={className}>
        Checkout Coming Soon
      </Button>
    );
  }

  return (
    <Button
      href={checkoutUrl}
      variant="primary"
      className={className}
      onClick={() => {
        trackEvent("ai_cashflow_buy_click", { location });
        trackEvent("checkout_redirect", { location, checkoutUrl });
      }}
    >
      {label}
    </Button>
  );
}

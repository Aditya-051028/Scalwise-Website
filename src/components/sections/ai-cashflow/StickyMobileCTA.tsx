"use client";

import { PriceTag } from "./PriceTag";
import { BuyNowButton } from "./BuyNowButton";

type StickyMobileCTAProps = {
  price: number | null | undefined;
  currency: string | null | undefined;
  checkoutUrl?: string | null;
  active: boolean;
};

/** Fixed bottom bar, mobile only — gives the funnel a persistent Buy Now
 *  without repeating the full CTA block every section. */
export function StickyMobileCTA({ price, currency, checkoutUrl, active }: StickyMobileCTAProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-void/90 px-4 py-3 backdrop-blur-xl sm:hidden">
      <div className="flex items-center justify-between gap-3">
        <PriceTag price={price} currency={currency} />
        <BuyNowButton
          checkoutUrl={checkoutUrl}
          active={active}
          label="Buy AI Cashflow"
          location="sticky_mobile"
          className="flex-1"
        />
      </div>
    </div>
  );
}

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { WHATS_INCLUDED } from "@/lib/content/ai-cashflow";
import { BuyNowButton } from "./BuyNowButton";
import { PriceTag } from "./PriceTag";

type WhatsIncludedProps = {
  price: number | null | undefined;
  originalPrice?: number | null;
  currency: string | null | undefined;
  checkoutUrl?: string | null;
  active: boolean;
};

export function WhatsIncluded({
  price,
  originalPrice,
  currency,
  checkoutUrl,
  active,
}: WhatsIncludedProps) {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <GlassPanel className="p-8 sm:p-10">
            <p className="font-mono text-xs uppercase tracking-wide text-neon">AI Cashflow</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-paper">
              83-Page Expanded Edition
            </h3>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {WHATS_INCLUDED.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-snug text-lavender">
                  <span className="font-mono text-neon">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
              <PriceTag price={price} originalPrice={originalPrice} currency={currency} className="text-lg" />
              <BuyNowButton checkoutUrl={checkoutUrl} active={active} location="whats_included" />
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}

import Image from "next/image";
import { HERO } from "@/lib/content/ai-cashflow";
import { BuyNowButton } from "./BuyNowButton";
import { PriceTag } from "./PriceTag";

type CashflowHeroProps = {
  price: number | null | undefined;
  originalPrice?: number | null;
  currency: string | null | undefined;
  checkoutUrl?: string | null;
  active: boolean;
  coverUrl?: string | null;
  coverAlt?: string | null;
};

export function CashflowHero({
  price,
  originalPrice,
  currency,
  checkoutUrl,
  active,
  coverUrl,
  coverAlt,
}: CashflowHeroProps) {
  return (
    <section className="px-6 pt-16 pb-20 md:px-12 md:pt-24 md:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className="eyebrow">{HERO.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl font-bold text-paper sm:text-6xl">
            {HERO.title}
          </h1>
          <p className="mt-4 font-display text-xl font-bold text-paper sm:text-2xl">
            {HERO.subheadline}
          </p>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-lavender sm:text-base">
            {HERO.supportingCopy}
          </p>
          <p className="mt-3 font-mono text-sm text-neon">{HERO.supportingLine}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PriceTag price={price} originalPrice={originalPrice} currency={currency} className="text-lg" />
            <BuyNowButton checkoutUrl={checkoutUrl} active={active} location="hero" />
          </div>
          <p className="mt-3 font-mono text-[11px] text-lavender/70">
            {active ? HERO.buyNoteActive : HERO.buyNoteInactive}
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          {coverUrl ? (
            <div className="overflow-hidden rounded-2xl border border-line shadow-glow-purple">
              <Image
                src={coverUrl}
                alt={coverAlt ?? "AI Cashflow ebook cover"}
                width={800}
                height={1132}
                className="h-auto w-full"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-line bg-void-3/60">
              <span className="font-mono text-xs uppercase tracking-wide text-lavender/60">
                Cover coming soon
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

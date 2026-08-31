import { Reveal } from "@/components/motion/Reveal";
import { FINAL_CTA } from "@/lib/content/ai-cashflow";
import { BuyNowButton } from "./BuyNowButton";

type FinalCTAProps = { checkoutUrl?: string | null; active: boolean };

export function FinalCTA({ checkoutUrl, active }: FinalCTAProps) {
  return (
    <section id="buy" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <h2 className="whitespace-pre-line font-display text-3xl font-bold text-paper sm:text-4xl">
            {FINAL_CTA.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-lavender">
            {FINAL_CTA.body}
          </p>
          <div className="mt-8 flex justify-center">
            <BuyNowButton
              checkoutUrl={checkoutUrl}
              active={active}
              label={FINAL_CTA.buttonLabel}
              location="final_cta"
            />
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-lavender/70">
            {FINAL_CTA.microcopy}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

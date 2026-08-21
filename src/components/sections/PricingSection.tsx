import { getPayloadClient } from "@/lib/payload";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PricingInteractive } from "./PricingInteractive";

export async function PricingSection() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "pricing", sort: "order", limit: 10 });

  return (
    <section id="pricing" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Pick your growth plan"
          description="Content, ads, and local visibility — scaled to where your brand is right now. Tap a plan to see what's included."
          align="center"
        />

        <Reveal className="mt-8 flex justify-center">
          <span className="flex items-center gap-2.5 rounded-full border border-neon/30 bg-neon/[0.07] px-5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-paper">
            <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-glow-neon" />
            Founding-client pricing — locked in for your first cohort
          </span>
        </Reveal>

        <Reveal className="mt-12" delay={0.08}>
          <PricingInteractive plans={docs} />
        </Reveal>

        <p className="mx-auto mt-12 max-w-2xl text-center font-mono text-[11px] leading-loose text-lavender/70">
          All plans billed monthly · GST/applicable taxes extra · Meta/Google ad spend billed
          separately, paid direct to platform · Founding-client pricing, subject to revision
          after the first cohort · Custom scopes available on request
        </p>
      </div>
    </section>
  );
}

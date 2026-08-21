import { getPayloadClient } from "@/lib/payload";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export async function PricingSection() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "pricing", sort: "order", limit: 10 });

  return (
    <section id="pricing" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Pick your growth plan"
          description="Content, ads, and local visibility — scaled to where your brand is right now."
          align="center"
        />

        <Reveal className="mt-8 flex justify-center">
          <span className="flex items-center gap-2.5 rounded-full border border-neon/30 bg-neon/[0.07] px-5 py-2.5 font-mono text-[11px] uppercase tracking-wide text-paper">
            <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-glow-neon" />
            Founding-client pricing — locked in for your first cohort
          </span>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-start">
          {docs.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08}>
              <div
                className={`relative flex h-full flex-col rounded-[22px] border p-8 ${
                  plan.popular
                    ? "border-neon bg-gradient-to-br from-purple/25 to-void-3 shadow-glow-neon lg:-translate-y-3.5"
                    : "border-line bg-void-3/50"
                }`}
              >
                {plan.popular ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-neon px-4 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wide text-void">
                    Recommended
                  </span>
                ) : null}

                <span
                  className={`font-mono text-[11px] uppercase tracking-wide ${
                    plan.popular ? "text-neon" : "text-lavender"
                  }`}
                >
                  {plan.tierLabel}
                </span>
                <h3 className="mt-2.5 font-display text-2xl font-bold text-paper">
                  {plan.planName}
                </h3>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold text-paper">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </span>
                  <span className="font-mono text-xs text-lavender">
                    / {plan.billingPeriod?.toLowerCase()}
                  </span>
                </div>
                {plan.priceNote ? (
                  <p className="mt-1 font-mono text-[10.5px] text-lavender/75">{plan.priceNote}</p>
                ) : null}

                <div className="mt-6 flex-1 border-t border-line pt-6">
                  <ul className="space-y-3.5">
                    {plan.features?.map((f) => (
                      <li
                        key={f.id ?? f.label}
                        className={`flex gap-2.5 text-[13.5px] leading-snug ${
                          plan.popular ? "text-paper" : "text-lavender"
                        }`}
                      >
                        <span className="font-mono text-neon">✓</span>
                        {f.label}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.adSpendNote ? (
                  <div
                    className={`mt-6 rounded-xl border p-3.5 ${
                      plan.popular
                        ? "border-neon/25 bg-black/20"
                        : "border-dashed border-line bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`mb-1.5 inline-block font-mono text-[9.5px] uppercase tracking-wide ${
                        plan.popular
                          ? "rounded bg-neon px-1.5 py-0.5 text-void"
                          : "text-neon"
                      }`}
                    >
                      Ad spend
                    </span>
                    <p
                      className={`text-[11.5px] leading-relaxed ${
                        plan.popular ? "text-paper/85" : "text-lavender"
                      }`}
                    >
                      {plan.adSpendNote}
                    </p>
                  </div>
                ) : null}

                <div className="mt-7">
                  <Button
                    href="#contact"
                    variant={plan.popular ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {plan.ctaLabel}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center font-mono text-[11px] leading-loose text-lavender/70">
          All plans billed monthly · GST/applicable taxes extra · Meta/Google ad spend billed
          separately, paid direct to platform · Founding-client pricing, subject to revision
          after the first cohort · Custom scopes available on request
        </p>
      </div>
    </section>
  );
}

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/motion/Reveal";
import type { Pricing } from "@/payload-types";

export function PricingPlans({ plans }: { plans: Pricing[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan, i) => (
        <Reveal key={plan.id} delay={i * 0.08}>
          <TiltCard tiltDegrees={6} className="h-full">
            <GlassPanel
              className={`flex h-full flex-col p-6 transition-[border-color,box-shadow] duration-300 ease-premium sm:p-7 ${
                plan.popular
                  ? "border-neon/40 shadow-glow-neon"
                  : "hover:border-purple-light/50 hover:shadow-glow-purple"
              }`}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-paper">{plan.planName}</h3>
                {plan.popular ? (
                  <span className="rounded-full bg-neon px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-void">
                    Recommended
                  </span>
                ) : null}
              </div>
              {plan.tierLabel ? (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-lavender/70">
                  {plan.tierLabel}
                </p>
              ) : null}

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features?.map((f) => (
                  <li
                    key={f.id ?? f.label}
                    className="flex gap-2.5 text-[13.5px] leading-snug text-lavender"
                  >
                    <span className="font-mono text-neon">✓</span>
                    {f.label}
                  </li>
                ))}
              </ul>

              {plan.adSpendNote ? (
                <div className="mt-5 rounded-xl border border-dashed border-line bg-white/[0.03] p-3">
                  <span className="mb-1 inline-block font-mono text-[9.5px] uppercase tracking-wide text-neon">
                    Ad spend
                  </span>
                  <p className="text-[11px] leading-relaxed text-lavender">{plan.adSpendNote}</p>
                </div>
              ) : null}

              <Button
                href="#contact"
                variant={plan.popular ? "primary" : "secondary"}
                className="mt-6 w-full"
              >
                Inquire Now
              </Button>
            </GlassPanel>
          </TiltCard>
        </Reveal>
      ))}
    </div>
  );
}

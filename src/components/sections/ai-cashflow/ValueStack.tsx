import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/motion/Reveal";
import { VALUE_STACK } from "@/lib/content/ai-cashflow";
import { BuyNowButton } from "./BuyNowButton";

type ValueStackProps = { checkoutUrl?: string | null; active: boolean };

export function ValueStack({ checkoutUrl, active }: ValueStackProps) {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="What's inside" title="What You Get" align="center" />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_STACK.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <TiltCard tiltDegrees={6} className="h-full">
                <GlassPanel className="h-full p-6 transition-[border-color,box-shadow] duration-300 ease-premium hover:border-purple-light/50 hover:shadow-glow-purple">
                  <span className="stat-mono text-sm text-neon">{item.number}</span>
                  <h3 className="mt-2 font-display text-base font-bold text-paper">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-lavender">{item.description}</p>
                </GlassPanel>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-12 flex justify-center">
            <BuyNowButton checkoutUrl={checkoutUrl} active={active} location="value_stack" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

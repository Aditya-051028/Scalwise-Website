import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/motion/Reveal";
import { THIRTY_DAY_WEEKS } from "@/lib/content/ai-cashflow";

export function ThirtyDayPlan() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Part VI"
          title="30 Days. One System. Real Execution."
          description="You don't just read the book. You use it — the 30-Day Action Plan takes you through it week by week."
          align="center"
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {THIRTY_DAY_WEEKS.map((week, i) => (
            <Reveal key={week.week} delay={i * 0.06}>
              <TiltCard tiltDegrees={6} className="h-full">
                <GlassPanel className="h-full p-6 transition-[border-color,box-shadow] duration-300 ease-premium hover:border-neon/40">
                  <span className="font-mono text-xs uppercase tracking-wide text-neon">
                    {week.week}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold text-paper">{week.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-lavender">{week.description}</p>
                </GlassPanel>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

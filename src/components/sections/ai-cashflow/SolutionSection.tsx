import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { SOLUTION, OPERATING_SYSTEM_STEPS } from "@/lib/content/ai-cashflow";

export function SolutionSection() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="The AI Cashflow Operating System"
          title={SOLUTION.headline}
          description={SOLUTION.body}
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OPERATING_SYSTEM_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.03}>
              <div className="border-t border-line pt-4">
                <span className="stat-mono text-sm text-neon">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-base font-bold text-paper">{step.title}</h3>
                <p className="mt-1 text-sm leading-snug text-lavender">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <GlassPanel className="mt-12 border-l-2 border-l-neon p-6 sm:p-8">
            <p className="font-display text-lg leading-relaxed text-paper sm:text-xl">
              “{SOLUTION.coreIdea}”
            </p>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}

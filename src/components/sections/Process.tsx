import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PROCESS_STEPS } from "@/lib/content/process";

export function Process() {
  return (
    <section id="process" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="How we work"
          title="Wise before wide"
          description="We diagnose before we spend. Five steps, same order, every time."
        />
        <div className="mt-14 grid gap-8 md:grid-cols-5">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className="border-t border-line pt-5">
                <span className="stat-mono text-sm text-neon">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-paper">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-lavender">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

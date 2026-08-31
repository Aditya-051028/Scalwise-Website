import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { CONTENT_ENGINE_STEPS, CONTENT_ENGINE_NOTE } from "@/lib/content/ai-cashflow";

export function ContentEngine() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Chapter 6"
          title="The AI Content Engine"
          description={CONTENT_ENGINE_NOTE}
        />

        <Reveal delay={0.08}>
          <div className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-4">
            {CONTENT_ENGINE_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-line bg-void-3/60 px-4 py-2 font-mono text-xs uppercase tracking-wide text-paper">
                  {step}
                </span>
                {i < CONTENT_ENGINE_STEPS.length - 1 ? (
                  <span className="text-neon" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

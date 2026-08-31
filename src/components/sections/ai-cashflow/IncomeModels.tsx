import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { INCOME_MODELS, INCOME_MODELS_NOTE } from "@/lib/content/ai-cashflow";

export function IncomeModels() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Chapter 2"
          title="15 AI Income Models"
          description={INCOME_MODELS_NOTE}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          {INCOME_MODELS.map((group, gi) => (
            <Reveal key={group.category} delay={gi * 0.08}>
              <h3 className="font-mono text-xs uppercase tracking-wide text-neon">
                {group.category}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.models.map((model) => (
                  <li key={model.name} className="border-t border-line pt-3">
                    <p className="font-display text-sm font-bold text-paper">{model.name}</p>
                    <p className="mt-0.5 text-xs leading-snug text-lavender">Solves: {model.solves}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

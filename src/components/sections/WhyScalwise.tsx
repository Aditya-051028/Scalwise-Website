import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const PILLARS = [
  {
    tag: "Performance",
    title: "Numbers, not noise",
    description:
      "Every recommendation ties back to a metric — CAC, ROAS, ranking position, lead volume. No vanity work.",
  },
  {
    tag: "Strategy",
    title: "Wise before wide",
    description:
      "We diagnose before we spend. The right channel and offer beat more channels and more budget.",
  },
  {
    tag: "Execution",
    title: "Bold, fast, visible",
    description:
      "Creative that stands out in-feed, copy that's direct, and reporting you can actually read.",
  },
];

export function WhyScalwise() {
  return (
    <section id="why-scalwise" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why Scalwise"
          title="Scale smarter, not louder"
          description="Three principles applied to every account — not marketing copy, a description of how we actually operate."
        />
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.tag} delay={i * 0.08}>
              <div className="border-t border-line pt-5">
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-neon">
                  {p.tag}
                </span>
                <h3 className="mt-2.5 font-display text-xl font-bold text-paper">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-lavender">{p.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

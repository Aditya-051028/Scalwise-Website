import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PROBLEM } from "@/lib/content/ai-cashflow";

export function ProblemSection() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="The real problem" title={PROBLEM.headline} align="center" />
        <Reveal delay={0.06}>
          <p className="mx-auto mt-8 max-w-xl text-center text-[15px] leading-relaxed text-lavender">
            {PROBLEM.body}
          </p>
          <ul className="mx-auto mt-6 grid max-w-lg gap-2.5 sm:grid-cols-2">
            {PROBLEM.points.map((point) => (
              <li
                key={point}
                className="rounded-lg border border-line px-3 py-2.5 text-sm text-lavender"
              >
                {point}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-xl text-center text-[15px] leading-relaxed text-paper">
            {PROBLEM.closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

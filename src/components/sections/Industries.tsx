import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { INDUSTRIES } from "@/lib/content/industries";

export function Industries() {
  return (
    <section id="industries" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Who we work with"
          title="Built for growth-stage and local operators"
          align="center"
        />
        <Reveal className="mt-12 flex flex-wrap justify-center gap-3">
          {INDUSTRIES.map((industry) => (
            <span
              key={industry}
              className="rounded-full border border-line bg-void-3/40 px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-lavender"
            >
              {industry}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

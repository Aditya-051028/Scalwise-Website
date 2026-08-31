import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { OBJECTIONS } from "@/lib/content/ai-cashflow";

export function ObjectionHandling() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Before you decide" title="Common Questions" align="center" />
        <div className="mt-12 space-y-6">
          {OBJECTIONS.map((item, i) => (
            <Reveal key={item.question} delay={i * 0.05}>
              <div className="border-l-2 border-l-line pl-5">
                <p className="font-display text-base font-bold text-paper">{item.question}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-lavender">{item.answer}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

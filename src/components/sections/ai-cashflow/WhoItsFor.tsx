import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { WHO_FOR, WHO_NOT_FOR } from "@/lib/content/ai-cashflow";

export function WhoItsFor() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Fit check" title="Who This Is For" align="center" />
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          <Reveal>
            <h3 className="font-mono text-xs uppercase tracking-wide text-neon">This is for:</h3>
            <ul className="mt-4 space-y-2.5">
              {WHO_FOR.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-snug text-lavender">
                  <span className="font-mono text-neon">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.06}>
            <h3 className="font-mono text-xs uppercase tracking-wide text-lavender/70">Not for:</h3>
            <ul className="mt-4 space-y-2.5">
              {WHO_NOT_FOR.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-snug text-lavender/70">
                  <span className="font-mono text-lavender/50">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

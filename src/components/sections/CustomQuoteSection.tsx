import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { CustomQuoteBuilder } from "./CustomQuoteBuilder";

export function CustomQuoteSection() {
  return (
    <section id="custom-quote" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Not a fit off the shelf?"
          title="Build your own plan"
          description="Pick the services you actually need and we'll size a real quote around them — no forcing you into a fixed tier."
          align="center"
        />

        <Reveal className="mt-12" delay={0.08}>
          <CustomQuoteBuilder />
        </Reveal>
      </div>
    </section>
  );
}

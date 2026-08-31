import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { FAQ_ITEMS } from "@/lib/content/ai-cashflow";

export function CashflowFAQ() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Questions, Answered Directly" align="center" />
        <div className="mt-12">
          <Accordion items={[...FAQ_ITEMS]} />
        </div>
      </div>
    </section>
  );
}

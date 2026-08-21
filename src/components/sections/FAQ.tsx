import { getPayloadClient } from "@/lib/payload";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "./FAQAccordion";

export async function FAQ() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "faqs", sort: "order", limit: 50 });

  return (
    <section id="faq" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Questions, answered directly" align="center" />
        <div className="mt-12">
          <FAQAccordion items={docs} />
        </div>
      </div>
    </section>
  );
}

import { Accordion } from "@/components/ui/Accordion";
import type { Faq } from "@/payload-types";

export function FAQAccordion({ items }: { items: Faq[] }) {
  return (
    <Accordion
      items={items.map((item) => ({ id: item.id, question: item.question, answer: item.answer }))}
    />
  );
}

import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "./ContactForm";

export function ContactSection() {
  return (
    <section id="contact" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Get started"
          title="Tell us about your business"
          description="No generic pitch back — we'll look at what you send and tell you plainly if we're a fit."
          align="center"
        />
        <div className="mt-12">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

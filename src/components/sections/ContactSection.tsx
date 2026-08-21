import { getPayloadClient } from "@/lib/payload";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "./ContactForm";

const SOCIAL_LABELS = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
} as const;

export async function ContactSection() {
  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings" });

  const socialEntries = (
    Object.entries(SOCIAL_LABELS) as [keyof typeof SOCIAL_LABELS, string][]
  ).filter(([key]) => settings.socials?.[key]);

  const hasDirectContact = Boolean(settings.contactEmail) || socialEntries.length > 0;

  return (
    <section id="contact" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Get started"
          title="Tell us about your business"
          description="No generic pitch back — we'll look at what you send and tell you plainly if we're a fit."
          align="center"
        />

        {hasDirectContact ? (
          <Reveal className="mt-8 flex flex-col items-center gap-2 text-center">
            {settings.contactEmail ? (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="font-mono text-sm text-neon hover:underline"
              >
                {settings.contactEmail}
              </a>
            ) : null}
            {socialEntries.length > 0 ? (
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-lavender">
                <span>or find us on</span>
                {socialEntries.map(([key, label]) => (
                  <a
                    key={key}
                    href={settings.socials?.[key] ?? "#"}
                    className="text-paper hover:text-neon"
                  >
                    {label}
                  </a>
                ))}
              </div>
            ) : null}
          </Reveal>
        ) : null}

        <div className="mt-12">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

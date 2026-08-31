import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";

// Real pages from the actual PDF (not mockups/invented screenshots), chosen to
// show the cover, the book's structure, and four of its core systems.
const PREVIEW_PAGES = [
  { src: "/ai-cashflow/cover.png", alt: "AI Cashflow ebook cover" },
  { src: "/ai-cashflow/preview-whats-inside.png", alt: "AI Cashflow table of contents" },
  { src: "/ai-cashflow/preview-income-models.png", alt: "15 AI Income Models chapter page" },
  { src: "/ai-cashflow/preview-content-engine.png", alt: "The AI Content Engine chapter page" },
  { src: "/ai-cashflow/preview-operating-system.png", alt: "The AI Cashflow Operating System page" },
  { src: "/ai-cashflow/preview-prompt-pack.png", alt: "The 100-Prompt Pack bonus page" },
] as const;

export function ProductPreview() {
  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Inside the book" title="A Look Inside" align="center" />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PREVIEW_PAGES.map((page, i) => (
            <Reveal key={page.src} delay={i * 0.05}>
              <GlassPanel className="overflow-hidden p-2">
                <Image
                  src={page.src}
                  alt={page.alt}
                  width={827}
                  height={1170}
                  className="h-auto w-full rounded-xl"
                  loading="lazy"
                />
              </GlassPanel>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

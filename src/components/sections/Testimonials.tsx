import { getPayloadClient } from "@/lib/payload";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { GlassPanel } from "@/components/ui/GlassPanel";

export async function Testimonials() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "testimonials", limit: 20 });

  return (
    <section id="testimonials" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="What clients say"
          title="Direct feedback, not review-site fluff"
          align="center"
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {docs.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08}>
              <GlassPanel className="flex h-full flex-col p-7">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-neon" aria-hidden>
                    {Array.from({ length: t.rating ?? 5 }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                  {t.sampleData ? (
                    <span className="rounded-full border border-neon/40 bg-neon/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-neon">
                      Sample
                    </span>
                  ) : null}
                </div>
                <p className="mt-5 flex-1 text-[15px] leading-relaxed text-paper">
                  “{t.quote}”
                </p>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-wide text-lavender">
                  {t.clientName}
                  {t.company ? ` · ${t.company}` : ""}
                </p>
              </GlassPanel>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

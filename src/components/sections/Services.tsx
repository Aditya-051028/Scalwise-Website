import { getPayloadClient } from "@/lib/payload";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TiltCard } from "@/components/ui/TiltCard";
import { SERVICE_INTERESTS as CATEGORY_ORDER, SERVICE_BLURBS as CATEGORY_BLURB } from "@/lib/content/plan-options";

export async function Services() {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "services",
    sort: "order",
    limit: 100,
  });

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    blurb: CATEGORY_BLURB[category],
    services: docs.filter((d) => d.category === category),
  })).filter((g) => g.services.length > 0);

  return (
    <section id="services" className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="What we do"
          title="Every channel, one CAC target"
          description="Fourteen services, six disciplines — picked and sequenced around your numbers, not sold as a bundle."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((g, i) => (
            <Reveal key={g.category} delay={i * 0.06}>
              <TiltCard tiltDegrees={6} className="h-full">
                <GlassPanel className="h-full p-7 transition-[border-color,box-shadow] duration-300 ease-premium hover:border-purple-light/50 hover:shadow-glow-purple">
                  <h3 className="font-display text-xl font-bold text-paper">{g.category}</h3>
                  <p className="mt-2 text-sm text-lavender">{g.blurb}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {g.services.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-lavender"
                      >
                        {s.title}
                      </li>
                    ))}
                  </ul>
                </GlassPanel>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

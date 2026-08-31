import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KineticGrid } from "@/components/effects/KineticGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/motion/Reveal";
import { getPayloadClient } from "@/lib/payload";
import { PageViewTracker } from "@/components/sections/ai-cashflow/PageViewTracker";
import { PriceTag } from "@/components/sections/ai-cashflow/PriceTag";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Books",
  description:
    "Practical digital playbooks from Scalwise Media, built to help you turn ideas into action.",
};

export default async function ProductsPage() {
  const payload = await getPayloadClient();
  const { docs: products } = await payload.find({
    collection: "products",
    sort: "order",
    limit: 100,
  });

  return (
    <>
      <KineticGrid className="z-0" />
      <PageViewTracker event="ebook_page_view" />
      <Header />
      <div className="relative z-10 flex flex-1 flex-col">
        <main className="flex-1 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Products"
              title="E-Books That Help You Build, Create & Grow"
              description="Practical digital playbooks built to help you turn ideas into action."
            />

            {products.length === 0 ? (
              <Reveal className="mt-14">
                <GlassPanel className="p-10 text-center">
                  <p className="font-display text-xl font-bold text-paper">
                    Our first e-book is on the way.
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-lavender">
                    We&rsquo;re finishing it up — check back soon, or{" "}
                    <Link href="/#contact" className="text-neon hover:underline">
                      get in touch
                    </Link>{" "}
                    and we&rsquo;ll let you know the moment it&rsquo;s live.
                  </p>
                </GlassPanel>
              </Reveal>
            ) : (
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, i) => (
                  <Reveal key={product.id} delay={i * 0.06}>
                    <TiltCard tiltDegrees={6} className="h-full">
                      <Link href={`/products/${product.slug}`} className="block h-full">
                        <GlassPanel className="flex h-full flex-col p-6 transition-[border-color,box-shadow] duration-300 ease-premium hover:border-purple-light/50 hover:shadow-glow-purple">
                          <div className="relative mb-4">
                            {product.coverImage && typeof product.coverImage === "object" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.coverImage.url ?? undefined}
                                alt={product.coverImage.alt ?? product.title}
                                className="aspect-[3/4] w-full rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-xl border border-line bg-void-3/60">
                                <span className="font-mono text-xs uppercase tracking-wide text-lavender/60">
                                  Cover coming soon
                                </span>
                              </div>
                            )}
                            {product.featured ? (
                              <span className="absolute top-3 left-3 rounded-full bg-neon px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-wide text-void">
                                Featured
                              </span>
                            ) : null}
                          </div>
                          <span className="font-mono text-[10px] uppercase tracking-wide text-neon">
                            {product.productType}
                            {product.status === "Coming Soon" ? " · Coming Soon" : ""}
                          </span>
                          <h3 className="mt-2 font-display text-lg font-bold text-paper">
                            {product.title}
                          </h3>
                          {product.shortDescription ? (
                            <p className="mt-2 text-sm text-lavender">{product.shortDescription}</p>
                          ) : null}
                          <PriceTag
                            price={product.price}
                            originalPrice={product.originalPrice}
                            currency={product.currency}
                            className="mt-4 text-sm"
                          />
                          <span className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-neon">
                            {product.status === "Available" ? "View Book →" : "Learn More →"}
                          </span>
                        </GlassPanel>
                      </Link>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description: "E-books and other resources from Scalwise Media.",
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
      <Header />
      <div className="relative z-10 flex flex-1 flex-col">
        <main className="flex-1 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Products"
              title="E-books"
              description="Practical, no-fluff guides on performance marketing and local growth — built from the same playbook we run for clients."
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
                          {product.coverImage && typeof product.coverImage === "object" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.coverImage.url ?? undefined}
                              alt={product.coverImage.alt ?? product.title}
                              className="mb-4 aspect-[3/4] w-full rounded-xl object-cover"
                            />
                          ) : null}
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
                          {product.price ? (
                            <p className="mt-4 font-mono text-sm text-paper">
                              {product.currency === "INR" ? "₹" : `${product.currency} `}
                              {product.price}
                            </p>
                          ) : null}
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KineticGrid } from "@/components/effects/KineticGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "products",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return docs[0] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.shortDescription ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <KineticGrid className="z-0" />
      <Header />
      <div className="relative z-10 flex flex-1 flex-col">
        <main className="flex-1 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <Link href="/products" className="font-mono text-xs text-lavender hover:text-neon">
                ← All products
              </Link>
            </Reveal>

            <Reveal delay={0.05}>
              <GlassPanel className="mt-6 p-6 sm:p-10">
                {product.coverImage && typeof product.coverImage === "object" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.coverImage.url ?? undefined}
                    alt={product.coverImage.alt ?? product.title}
                    className="mb-6 aspect-[3/2] w-full rounded-xl object-cover"
                  />
                ) : null}

                <span className="font-mono text-[10px] uppercase tracking-wide text-neon">
                  {product.productType}
                </span>
                <h1 className="mt-2 font-display text-3xl font-bold text-paper">{product.title}</h1>
                {product.shortDescription ? (
                  <p className="mt-2 text-base text-lavender">{product.shortDescription}</p>
                ) : null}

                {product.description ? (
                  <div className="prose prose-invert mt-6 max-w-none text-[15px] leading-relaxed text-lavender">
                    <RichText data={product.description} />
                  </div>
                ) : null}

                <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
                  {product.price ? (
                    <span className="font-mono text-lg text-paper">
                      {product.currency === "INR" ? "₹" : `${product.currency} `}
                      {product.price}
                    </span>
                  ) : null}

                  {product.status === "Available" ? (
                    <Button href={`/products/${product.slug}/buy`} variant="primary">
                      Buy Now
                    </Button>
                  ) : (
                    <span className="rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-wide text-lavender">
                      Coming Soon
                    </span>
                  )}
                </div>
              </GlassPanel>
            </Reveal>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

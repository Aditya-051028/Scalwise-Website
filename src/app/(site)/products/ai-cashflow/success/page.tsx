import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KineticGrid } from "@/components/effects/KineticGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { getPayloadClient } from "@/lib/payload";
import { AI_CASHFLOW_SLUG, THANK_YOU } from "@/lib/content/ai-cashflow";
import { DownloadButton } from "@/components/sections/ai-cashflow/DownloadButton";
import { PageViewTracker } from "@/components/sections/ai-cashflow/PageViewTracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "AI Cashflow order confirmation and download.",
  robots: { index: false, follow: false },
};

type SearchParams = { order_id?: string; payment_id?: string; verified?: string };

/** NOTE for whoever wires up the real payment gateway: this page currently
 *  treats `?verified=true` in the URL as the only signal that a purchase
 *  happened — that is NOT real payment verification, it's a placeholder so
 *  the page has something to gate on today. A query param is trivially
 *  fakeable by anyone. Replace this check with a real server-side lookup
 *  (session, signed token, or an order record fetched by order_id and
 *  confirmed server-side against the gateway/webhook) before this goes live
 *  with real money moving through it. Until then, this page deliberately
 *  refuses to show "You're In" for a bare, unverified visit. */
export default async function AiCashflowSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const verified = params.verified === "true";

  if (!verified) {
    return (
      <>
        <KineticGrid className="z-0" />
        <Header />
        <div className="relative z-10 flex flex-1 flex-col">
          <main className="flex-1 px-6 py-24 md:px-12 md:py-32">
            <div className="mx-auto max-w-xl text-center">
              <GlassPanel className="p-8 sm:p-10">
                <p className="font-mono text-xs uppercase tracking-wide text-lavender">
                  Order status
                </p>
                <h1 className="mt-3 font-display text-2xl font-bold text-paper">
                  We couldn&rsquo;t confirm an order here.
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-lavender">
                  If you just completed a purchase, check your email for confirmation and your
                  download link. If something went wrong or you got here by mistake, get in touch
                  and we&rsquo;ll sort it out directly — no need to repurchase.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button href="/products/ai-cashflow" variant="secondary">
                    Back to AI Cashflow
                  </Button>
                  <Button href="/#contact" variant="primary">
                    Contact Us
                  </Button>
                </div>
              </GlassPanel>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "products",
    where: { slug: { equals: AI_CASHFLOW_SLUG } },
    limit: 1,
  });
  const product = docs[0] ?? null;

  return (
    <>
      <KineticGrid className="z-0" />
      <PageViewTracker event="purchase_success" />
      <Header />
      <div className="relative z-10 flex flex-1 flex-col">
        <main className="flex-1 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-xl">
            <GlassPanel className="p-8 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-wide text-neon">
                Payment successful (development preview — see note below)
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold text-paper">
                {THANK_YOU.headline}
              </h1>
              <p className="mt-1 font-display text-lg font-bold text-paper">
                {THANK_YOU.subheadline}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-lavender">{THANK_YOU.body}</p>

              <ol className="mt-8 space-y-4">
                {THANK_YOU.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="stat-mono shrink-0 text-sm text-neon">
                      Step {i + 1}
                    </span>
                    <span className="text-sm text-paper">{step.title}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-line pt-6">
                <p className="font-mono text-[10px] uppercase tracking-wide text-lavender/70">
                  AI Cashflow — 83-Page Expanded Edition
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-lavender">
                  <li>✓ Full ebook</li>
                  <li>✓ 30-Day AI Cashflow Challenge</li>
                  <li>✓ 100-Prompt Pack</li>
                  <li>✓ AI Cashflow Operating System</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <DownloadButton deliveryUrl={product?.deliveryUrl} />
                <Link
                  href="/products/ai-cashflow"
                  className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 font-mono text-[13px] font-medium uppercase tracking-[0.1em] text-paper transition-colors duration-200 ease-premium hover:border-neon hover:text-neon"
                >
                  Open the 30-Day Playbook
                </Link>
              </div>

              {(params.order_id || params.payment_id) && (
                <p className="mt-6 font-mono text-[10px] text-lavender/50">
                  {params.order_id ? `Order: ${params.order_id} ` : ""}
                  {params.payment_id ? `· Payment: ${params.payment_id}` : ""}
                </p>
              )}
            </GlassPanel>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

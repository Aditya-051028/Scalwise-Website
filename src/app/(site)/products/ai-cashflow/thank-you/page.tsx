import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { KineticGrid } from "@/components/effects/KineticGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { signDownloadToken } from "@/lib/download-token";
import { THANK_YOU } from "@/lib/content/ai-cashflow";
import { DownloadButton } from "@/components/sections/ai-cashflow/DownloadButton";
import { PageViewTracker } from "@/components/sections/ai-cashflow/PageViewTracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thanks for grabbing AI Cashflow — download it here.",
  robots: { index: false, follow: false },
};

// Manual fallback: paste this page's URL into the Razorpay Payment Page's
// "Redirect to your website" field. Not gated to a specific buyer or order —
// the download link it mints is the same for everyone who lands here, since
// Payment Pages don't currently give us a way to verify a specific redirect
// is tied to a specific completed payment. The confirmation email (per-order,
// verified) remains the real delivery record; this exists only so a buyer who
// lands here right after paying isn't left looking at Razorpay's own page.
export default function AiCashflowThankYouPage() {
  const token = signDownloadToken("manual-redirect-fallback");

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
                Payment successful
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
                    <span className="stat-mono shrink-0 text-sm text-neon">Step {i + 1}</span>
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
                <DownloadButton deliveryUrl={`/api/download/ai-cashflow?token=${token}`} />
                <Link
                  href="/products/ai-cashflow"
                  className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3.5 font-mono text-[13px] font-medium uppercase tracking-[0.1em] text-paper transition-colors duration-200 ease-premium hover:border-neon hover:text-neon"
                >
                  Open the 30-Day Playbook
                </Link>
              </div>

              <p className="mt-6 font-mono text-[10px] text-lavender/50">
                Trouble downloading? Check your email for your confirmation, or{" "}
                <Link href="/#contact" className="underline hover:text-neon">
                  get in touch
                </Link>
                .
              </p>
            </GlassPanel>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

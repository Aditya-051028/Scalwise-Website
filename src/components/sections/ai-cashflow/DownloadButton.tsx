"use client";

import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

export function DownloadButton({ deliveryUrl }: { deliveryUrl?: string | null }) {
  if (!deliveryUrl) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.03] p-4 text-sm text-lavender">
        Your download link is being finalized — we&rsquo;ll email it to you shortly. If it&rsquo;s
        been a while, get in touch and we&rsquo;ll sort it out directly.
      </div>
    );
  }

  return (
    <Button
      href={deliveryUrl}
      variant="primary"
      className="w-full sm:w-auto"
      onClick={() => trackEvent("ebook_download")}
    >
      Download AI Cashflow
    </Button>
  );
}

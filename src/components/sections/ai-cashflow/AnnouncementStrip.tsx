import { ANNOUNCEMENT_STRIP } from "@/lib/content/ai-cashflow";

export function AnnouncementStrip() {
  return (
    <div className="border-b border-line bg-void-3/40 px-6 pt-24 pb-2.5 text-center md:px-12 md:pt-28">
      <p className="font-mono text-[11px] uppercase tracking-wide text-lavender">
        {ANNOUNCEMENT_STRIP}
      </p>
    </div>
  );
}

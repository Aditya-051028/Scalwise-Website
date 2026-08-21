const PLATFORMS = [
  "Meta Ads",
  "Google Ads",
  "Google Business Profile",
  "Instagram",
  "Google Analytics",
];

export function TrustStrip() {
  return (
    <div className="border-y border-line px-6 py-6 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {PLATFORMS.map((platform) => (
          <span
            key={platform}
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-lavender/70"
          >
            {platform}
          </span>
        ))}
      </div>
    </div>
  );
}

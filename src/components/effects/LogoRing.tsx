"use client";

import { type ComponentType } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { useInView } from "@/lib/hooks/use-in-view";
import { TiltCard } from "@/components/ui/TiltCard";
import {
  MetaIcon,
  GoogleAdsIcon,
  GoogleBusinessIcon,
  InstagramIcon,
  GoogleAnalyticsIcon,
} from "@/components/effects/PlatformIcons";

type Platform = { name: string; Icon: ComponentType<{ className?: string }> };

const PLATFORMS: Platform[] = [
  { name: "Meta Ads", Icon: MetaIcon },
  { name: "Google Ads", Icon: GoogleAdsIcon },
  { name: "Google Business Profile", Icon: GoogleBusinessIcon },
  { name: "Instagram", Icon: InstagramIcon },
  { name: "Google Analytics", Icon: GoogleAnalyticsIcon },
];

const FLOAT_STAGGER_S = 0.7;

function PlatformCard({ name, Icon, floatDelay }: { name: string; Icon: Platform["Icon"]; floatDelay: number }) {
  return (
    <TiltCard
      tiltDegrees={14}
      className="group flex shrink-0 items-center gap-3 rounded-2xl border border-line bg-void-3/40 px-6 py-4 backdrop-blur-sm transition-colors duration-300 ease-premium hover:border-neon/40 hover:bg-void-3/70"
    >
      <div className="animate-float" style={{ animationDelay: `${floatDelay}s` }}>
        <Icon className="h-6 w-6 text-lavender/80 transition-colors duration-300 ease-premium group-hover:text-neon" />
      </div>
      <span className="font-mono text-[11px] whitespace-nowrap uppercase tracking-[0.15em] text-lavender/70 transition-colors duration-300 ease-premium group-hover:text-paper">
        {name}
      </span>
    </TiltCard>
  );
}

/** Continuous right-to-left marquee of platform cards with per-card 3D mouse
 *  tilt and a gentle idle float. Pauses off-screen and collapses to a static
 *  wrapped row under prefers-reduced-motion, matching the site's other
 *  continuous-loop effects (see KineticGrid). */
export function LogoRing() {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0 });

  if (reducedMotion) {
    return (
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4">
        {PLATFORMS.map((platform) => (
          <PlatformCard key={platform.name} {...platform} floatDelay={0} />
        ))}
      </div>
    );
  }

  const loop = [...PLATFORMS, ...PLATFORMS];

  return (
    <div
      ref={ref}
      className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
    >
      <div
        className="animate-marquee flex w-max gap-4"
        style={{ animationPlayState: inView ? "running" : "paused" }}
      >
        {loop.map((platform, i) => (
          <PlatformCard
            key={`${platform.name}-${i}`}
            {...platform}
            floatDelay={(i % PLATFORMS.length) * FLOAT_STAGGER_S}
          />
        ))}
      </div>
    </div>
  );
}

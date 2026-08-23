import type { ComponentType } from "react";
import { TiltCard } from "@/components/ui/TiltCard";

type LogoBadgeProps = {
  label: string;
  Icon?: ComponentType<{ className?: string }>;
  /** Real brand hex (e.g. "#0866FF" for Facebook blue) used as the circle's
   *  background, icon rendered in white on top — like the platform's own app
   *  icon. Omit for Scalwise's own service badges (no third-party brand color
   *  applies), which fall back to the site's void/lavender treatment. */
  brandColor?: string;
  floatDelay?: number;
  className?: string;
};

/** Circular badge combining three independent motion layers: the parent
 *  InfiniteSlider drags/auto-scrolls the whole strip horizontally; this
 *  component adds its own idle float (reuses the site's --animate-float
 *  keyframe, staggered per item) and a cursor-reactive 3D tilt (TiltCard) on
 *  top. Each layer owns a different element in the stack so their transforms
 *  don't fight over the same CSS property. Visual language — circular tinted
 *  badge, soft shadow, hover scale — borrowed from motion-primitives'
 *  FloatingElements "Trusted by" treatment; real platforms get their actual
 *  brand color as the fill (icon in white, like the platform's own app icon)
 *  instead of a site-palette recolor, since these are specific, recognizable
 *  logos, not abstract marks. */
export function LogoBadge({ label, Icon, brandColor, floatDelay = 0, className = "" }: LogoBadgeProps) {
  return (
    <div className={`animate-float flex w-28 shrink-0 flex-col items-center gap-3 ${className}`} style={{ animationDelay: `${floatDelay}s` }}>
      <TiltCard tiltDegrees={16}>
        <div
          className="group flex h-20 w-20 items-center justify-center rounded-full border border-line shadow-[0_10px_28px_-10px_rgba(91,33,182,0.55)] transition-all duration-300 ease-premium hover:scale-110 hover:shadow-[0_14px_36px_-8px_rgba(212,255,61,0.35)]"
          style={brandColor ? { background: brandColor } : undefined}
        >
          <div
            className={
              brandColor
                ? "flex h-full w-full items-center justify-center rounded-full"
                : "flex h-full w-full items-center justify-center rounded-full bg-void-3/60 group-hover:bg-void-3"
            }
          >
            {Icon ? (
              <Icon
                className={
                  brandColor
                    ? "h-9 w-9 text-white"
                    : "h-9 w-9 text-lavender/80 transition-colors duration-300 ease-premium group-hover:text-neon"
                }
              />
            ) : (
              <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-lavender/70">
                More
              </span>
            )}
          </div>
        </div>
      </TiltCard>
      <span className="text-center font-mono text-[10px] leading-tight uppercase tracking-wide text-lavender/70">
        {label}
      </span>
    </div>
  );
}

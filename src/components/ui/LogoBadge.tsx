import type { ComponentType } from "react";

type LogoBadgeProps = {
  label: string;
  Icon?: ComponentType<{ className?: string }>;
  className?: string;
};

/** Circular icon badge with a per-item tinted ring and a hover lift — visual
 *  language borrowed from motion-primitives' FloatingElements "Trusted by"
 *  treatment (colored circle behind each logo, soft shadow, scale on hover),
 *  recolored to the site's void/purple/neon palette instead of literal
 *  per-brand background colors. Label sits below, matching the mono/uppercase
 *  eyebrow style used throughout the site rather than the source's tooltip-only
 *  approach, since these badges need to read without hovering. */
export function LogoBadge({ label, Icon, className = "" }: LogoBadgeProps) {
  return (
    <div className={`flex w-24 shrink-0 flex-col items-center gap-3 ${className}`}>
      <div className="group flex h-16 w-16 items-center justify-center rounded-full border border-line bg-void-3/60 shadow-[0_8px_24px_-8px_rgba(91,33,182,0.5)] transition-all duration-300 ease-premium hover:scale-110 hover:border-neon/40 hover:bg-void-3">
        {Icon ? (
          <Icon className="h-7 w-7 text-lavender/80 transition-colors duration-300 ease-premium group-hover:text-neon" />
        ) : (
          <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-lavender/70">
            More
          </span>
        )}
      </div>
      <span className="text-center font-mono text-[10px] leading-tight uppercase tracking-wide text-lavender/70">
        {label}
      </span>
    </div>
  );
}

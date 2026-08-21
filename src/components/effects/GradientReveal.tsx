"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Stop = { offset: number; color: string };

const VBW = 1271;
const VBH = 599;

// Scalwise-only palette: void floor -> signal purple -> vivid violet -> paper
// (bright peak) -> neon volt (signature accent) -> violet -> fade. No colors
// outside the brand system, unlike the source component's full rainbow.
const SCALWISE_STOPS: Stop[] = [
  { offset: 0, color: "#12051F" },
  { offset: 0.18, color: "#5B21B6" },
  { offset: 0.34, color: "#9061F9" },
  { offset: 0.5, color: "#F7F4FC" },
  { offset: 0.68, color: "#D4FF3D" },
  { offset: 0.84, color: "#9061F9" },
  { offset: 1, color: "#5B21B600" },
];

function bellHeights(n: number, peak: number, valley: number): number[] {
  const out: number[] = [];
  const mid = (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const t = mid === 0 ? 0 : Math.abs(i - mid) / mid;
    const eased = 1 - Math.pow(t, 1.24);
    out.push(peak * VBH * (valley + (1 - valley) * eased));
  }
  return out;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface GradientRevealProps {
  /** Content shown above the glow — this component renders the <footer> itself. */
  children?: ReactNode;
  /** Height of the glow band pinned to the viewport bottom; also the scroll
   *  distance the reveal takes and the room reserved beneath the content. */
  gradientHeight?: string;
  /** Resting height of the glow as a fraction of the band, before the reveal starts. */
  minReveal?: number;
  bars?: number;
  blur?: number;
  peak?: number;
  valley?: number;
  stops?: Stop[];
  className?: string;
  style?: CSSProperties;
}

/** A footer whose glow rises from the viewport floor over the last stretch of
 *  scroll, reaching full height exactly at the bottom of the page. Adapted from
 *  a Ruixen/Dia-Browser-style pattern, recolored to the Scalwise palette only. */
export function GradientReveal({
  children,
  gradientHeight = "50vh",
  minReveal = 0.045,
  bars = 9,
  blur = 15,
  peak = 0.98,
  valley = 0.55,
  stops = SCALWISE_STOPS,
  className,
  style,
}: GradientRevealProps) {
  const uid = useId().replace(/:/g, "");
  const bandRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(minReveal);

  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;

    const measure = () => {
      const h = el.offsetHeight || 1;
      const left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      const t = clamp01((h - left) / h);
      setProgress(minReveal + (1 - minReveal) * t);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [minReveal]);

  const colW = VBW / bars;

  return (
    <footer className={className} style={{ paddingBottom: gradientHeight, ...style }}>
      {children}

      <div
        ref={bandRef}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-10"
        style={{
          height: gradientHeight,
          transformOrigin: "bottom",
          transform: `scaleY(${progress})`,
          willChange: "transform",
        }}
      >
        <svg
          style={{ height: "100%", width: "100%", display: "block" }}
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id={`grad-${uid}`} x1="0" y1="1" x2="0" y2="0">
              {stops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
            <filter id={`blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          </defs>
          {bellHeights(bars, peak, valley).map((barH, i) => (
            <g key={i} filter={`url(#blur-${uid})`}>
              <rect
                x={i * colW}
                y={VBH - barH}
                width={colW * 1.23}
                height={barH}
                fill={`url(#grad-${uid})`}
              />
            </g>
          ))}
        </svg>
      </div>
    </footer>
  );
}

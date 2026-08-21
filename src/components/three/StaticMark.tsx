import Image from "next/image";

/** Fallback for mobile / reduced-motion — no WebGL, no JS animation loop. */
export function StaticMark() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        aria-hidden
        className="absolute h-[70%] w-[70%] rounded-full bg-purple/30 blur-[90px]"
      />
      <Image
        src="/brand/scalwise-icon-badge.svg"
        alt=""
        width={320}
        height={320}
        priority
        className="relative w-[55%] max-w-[280px] animate-float drop-shadow-[0_0_60px_rgba(212,255,61,0.2)]"
      />
    </div>
  );
}

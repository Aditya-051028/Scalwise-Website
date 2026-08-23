"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import useMeasure from "react-use-measure";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { useInView } from "@/lib/hooks/use-in-view";

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  reverse?: boolean;
  className?: string;
};

/** Auto-scrolling horizontal track the viewer can grab and drag back and
 *  forth — release it and it resumes the loop from wherever it was left, at
 *  the same constant speed, never snapping back. Pauses off-screen and
 *  collapses to a static row under prefers-reduced-motion, matching the
 *  site's other continuous effects (see KineticGrid).
 *
 *  Architecture adapted from motion-primitives' InfiniteSlider — duplicated
 *  content measured with react-use-measure, looped via an imperative
 *  framer-motion `animate()` on a shared motion value rather than CSS
 *  `@keyframes` — specifically because that shape is what lets the same
 *  motion value be handed to a drag gesture mid-loop, which a CSS marquee
 *  can't do. */
export function InfiniteSlider({
  children,
  gap = 16,
  duration = 32,
  durationOnHover,
  reverse = false,
  className = "",
}: InfiniteSliderProps) {
  const [measureRef, { width }] = useMeasure();
  const translation = useMotionValue(0);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({ threshold: 0 });

  useEffect(() => {
    if (reducedMotion || isDragging || !inView || width === 0) return;

    const distancePerCycle = (width + gap) / 2;
    const target = reverse ? 0 : -distancePerCycle;
    const activeDuration = isHovering && durationOnHover ? durationOnHover : duration;

    function playToTarget() {
      const remaining = Math.abs(target - translation.get());
      controlsRef.current = animate(translation, target, {
        duration: (remaining / distancePerCycle) * activeDuration,
        ease: "linear",
        onComplete: () => {
          translation.set(reverse ? -distancePerCycle : 0);
          playToTarget();
        },
      });
    }
    playToTarget();

    return () => controlsRef.current?.stop();
  }, [
    width,
    gap,
    duration,
    durationOnHover,
    isHovering,
    reverse,
    reducedMotion,
    isDragging,
    inView,
    translation,
  ]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={viewRef} className={`overflow-hidden ${className}`}>
      <motion.div
        ref={measureRef}
        className="flex w-max cursor-grab active:cursor-grabbing"
        style={{ x: translation, gap: `${gap}px` }}
        drag="x"
        dragConstraints={{ left: -Infinity, right: Infinity }}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

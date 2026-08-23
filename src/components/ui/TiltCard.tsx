"use client";

import { useRef, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { motion, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/use-media-query";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees at the card's edge. Keep small (6-8) for content-dense
   *  cards, larger (12-16) for sparse decorative ones — see LogoRing for the latter. */
  tiltDegrees?: number;
};

/** Wraps content in a spring-smoothed 3D tilt that follows the cursor — decorative
 *  only, so it's skipped entirely under prefers-reduced-motion. Mouse-reactive
 *  tilt technique per Emil Kowalski's design-engineering skill: interpolate with
 *  a spring rather than snapping directly to the pointer position. */
export function TiltCard({ children, className = "", tiltDegrees = 7 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const rotateX = useSpring(0, { stiffness: 220, damping: 22, mass: 0.6 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 22, mass: 0.6 });

  function handleMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * tiltDegrees);
    rotateX.set(py * -tiltDegrees);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reducedMotion ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  rest: {},
  risen: { transition: { staggerChildren: 0.04 } },
};

const letterVariants: Variants = {
  rest: { y: 0, opacity: 1, color: "var(--color-lavender)" },
  risen: {
    y: "-130%",
    opacity: 0,
    color: "var(--color-paper)",
    transition: { type: "spring", stiffness: 320, damping: 24 },
  },
};

const NBSP = " ";

/** Label whose letters fly up and fade on focus/fill, staggered left to right.
 *  Stays a real <label htmlFor>, so it's still announced by assistive tech
 *  regardless of its animated transform/opacity. */
export function AnimatedLabel({
  htmlFor,
  label,
  risen,
  className = "",
}: {
  htmlFor: string;
  label: string;
  risen: boolean;
  className?: string;
}) {
  return (
    <motion.label
      htmlFor={htmlFor}
      className={`pointer-events-none absolute overflow-hidden whitespace-nowrap ${className}`}
      variants={containerVariants}
      initial="rest"
      animate={risen ? "risen" : "rest"}
    >
      {label.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          className="inline-block text-sm"
          style={{ willChange: "transform" }}
        >
          {char === " " ? NBSP : char}
        </motion.span>
      ))}
    </motion.label>
  );
}

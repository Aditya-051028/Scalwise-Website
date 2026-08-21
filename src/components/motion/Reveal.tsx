"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "./variants";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Fades/rises content into view once, the first time it crosses ~20% into viewport. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

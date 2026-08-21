"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { HeroSceneLoader } from "@/components/three/HeroSceneLoader";
import { KineticGrid } from "@/components/effects/KineticGrid";
import { fadeUp, staggerContainer } from "@/components/motion/variants";

const CHIPS = [
  "Founding cohort · locked-in pricing",
  "Meta Ads · Google Business Profile",
  "Content system · local SEO",
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-center overflow-hidden px-6 pt-28 pb-16 md:px-12"
    >
      <KineticGrid className="z-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <motion.div variants={staggerContainer(0.09, 0.1)} initial="hidden" animate="show">
          <motion.p variants={fadeUp} className="eyebrow mb-5">
            Performance Marketing · Local SEO · Content
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="max-w-xl text-[2.75rem] leading-[1.05] font-bold text-paper sm:text-[3.25rem] lg:text-[4rem] xl:text-[4.75rem]"
          >
            Scale <span className="text-neon">smarter</span>, not louder.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-md text-[16px] leading-relaxed text-lavender sm:text-lg"
          >
            Scalwise Media turns ad spend and content into predictable growth for
            local and D2C brands — performance ads, GBP/local SEO, and content
            built around one goal: leads you can count.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="#contact" variant="primary">
              Get Your Growth Plan
            </Button>
            <Button href="#proof" variant="secondary">
              See Our Work
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-3">
            {CHIPS.map((chip) => (
              <GlassPanel key={chip} className="px-4 py-2.5">
                <span className="stat-mono text-[11px] uppercase tracking-[0.08em] text-lavender">
                  {chip}
                </span>
              </GlassPanel>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative h-[340px] sm:h-[420px] lg:h-[560px]">
          <HeroSceneLoader />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute inset-x-0 bottom-8 z-10 hidden justify-center sm:flex"
        aria-hidden
      >
        <div className="h-10 w-px animate-pulse bg-gradient-to-b from-transparent via-lavender/60 to-transparent" />
      </motion.div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { Button } from "@/components/ui/Button";
import { EASE_PREMIUM } from "@/components/motion/variants";
import type { Pricing } from "@/payload-types";

const ROW_HEIGHT = 84;
const ROW_GAP = 12;

export function PricingInteractive({ plans }: { plans: Pricing[] }) {
  const initialIndex = Math.max(
    plans.findIndex((p) => p.popular),
    0
  );
  const [active, setActive] = useState(initialIndex);
  const current = plans[active];

  if (!current) return null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-[32px] border border-line bg-void-3/60 p-4 shadow-glow-purple backdrop-blur-xl sm:p-5">
      <div className="relative w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 rounded-2xl border-2 border-neon"
          style={{
            height: ROW_HEIGHT,
            transform: `translateY(${active * (ROW_HEIGHT + ROW_GAP)}px)`,
            transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <div className="flex flex-col gap-3">
          {plans.map((plan, i) => {
            const isActive = i === active;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                style={{ height: ROW_HEIGHT }}
                className="relative z-10 flex w-full items-center justify-between rounded-2xl px-5 text-left"
              >
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 font-display text-lg font-bold text-paper">
                    {plan.planName}
                    {plan.popular ? (
                      <span className="rounded-full bg-neon px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-void">
                        Recommended
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 flex items-baseline gap-1.5">
                    <NumberFlow
                      value={plan.price}
                      locales="en-IN"
                      format={{ style: "currency", currency: "INR", maximumFractionDigits: 0 }}
                      className="font-mono text-[15px] font-semibold text-paper"
                    />
                    <span className="font-mono text-xs text-lavender">
                      / {plan.billingPeriod?.toLowerCase() ?? "monthly"}
                    </span>
                  </span>
                </span>
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 p-1 transition-colors duration-300 ease-premium"
                  style={{ borderColor: isActive ? "#D4FF3D" : "#B7A9D6" }}
                >
                  <span
                    className="size-2.5 rounded-full bg-neon transition-opacity duration-300 ease-premium"
                    style={{ opacity: isActive ? 1 : 0 }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: EASE_PREMIUM }}
        className="w-full rounded-2xl border border-line bg-void/40 p-5"
      >
        {current.priceNote ? (
          <p className="mb-3 font-mono text-[10.5px] text-lavender/75">{current.priceNote}</p>
        ) : null}
        <ul className="space-y-2.5">
          {current.features?.map((f) => (
            <li
              key={f.id ?? f.label}
              className="flex gap-2.5 text-[13.5px] leading-snug text-lavender"
            >
              <span className="font-mono text-neon">✓</span>
              {f.label}
            </li>
          ))}
        </ul>
        {current.adSpendNote ? (
          <div className="mt-4 rounded-xl border border-dashed border-line bg-white/[0.03] p-3">
            <span className="mb-1 inline-block font-mono text-[9.5px] uppercase tracking-wide text-neon">
              Ad spend
            </span>
            <p className="text-[11px] leading-relaxed text-lavender">{current.adSpendNote}</p>
          </div>
        ) : null}
      </motion.div>

      <Button href="#contact" variant="primary" className="w-full">
        {current.ctaLabel ?? "Get Started"}
      </Button>
    </div>
  );
}

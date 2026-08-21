"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { GlassPanel } from "@/components/ui/GlassPanel";
import type { CaseStudy } from "@/payload-types";

export function ProofGrid({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const industries = useMemo(() => {
    const unique = new Set(
      caseStudies.map((c) => c.industry).filter((x): x is string => Boolean(x))
    );
    return ["All", ...Array.from(unique)];
  }, [caseStudies]);

  const [active, setActive] = useState("All");
  const filtered =
    active === "All" ? caseStudies : caseStudies.filter((c) => c.industry === active);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-2">
        {industries.map((industry) => (
          <button
            key={industry}
            type="button"
            onClick={() => setActive(industry)}
            className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-wide transition-colors duration-200 ease-premium ${
              active === industry
                ? "border-neon text-neon"
                : "border-line text-lavender hover:border-purple-light/50 hover:text-paper"
            }`}
          >
            {industry}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {filtered.map((study, i) => (
          <Reveal key={study.id} delay={i * 0.06}>
            <GlassPanel className="flex h-full flex-col p-7">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-wide text-lavender/70">
                  {study.industry}
                </span>
                {study.sampleData ? (
                  <span className="shrink-0 rounded-full border border-neon/40 bg-neon/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-neon">
                    Sample
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-paper">{study.title}</h3>
              <div className="mt-6 flex flex-1 items-end gap-6">
                {study.results?.map((r) => (
                  <div key={r.id ?? r.label}>
                    <div className="font-display text-2xl font-bold text-neon">{r.stat}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-lavender">
                      {r.label}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { StaticMark } from "./StaticMark";

const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), {
  ssr: false,
});

/** Loads the WebGL scene only on capable devices; static mark everywhere else. */
export function HeroSceneLoader() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reducedMotion = usePrefersReducedMotion();
  const show3D = isDesktop && !reducedMotion;

  return (
    <div className="relative h-full w-full">
      {show3D ? <HeroScene /> : <StaticMark />}
    </div>
  );
}

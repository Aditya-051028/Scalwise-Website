"use client";

import dynamic from "next/dynamic";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks/use-media-query";
import { useInView } from "@/lib/hooks/use-in-view";
import { StaticMark } from "./StaticMark";

const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), {
  ssr: false,
});

/** Loads the WebGL scene only on capable devices; static mark everywhere else.
 *  Pauses the render loop entirely once the hero scrolls out of view. */
export function HeroSceneLoader() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reducedMotion = usePrefersReducedMotion();
  const show3D = isDesktop && !reducedMotion;
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.05 });

  return (
    <div ref={ref} className="relative h-full w-full">
      {show3D ? <HeroScene active={inView} /> : <StaticMark />}
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";

function subscribeFactory(query: string) {
  return (callback: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
}

/** SSR-safe media query hook. Returns `false` on the server and on first client render. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribeFactory(query),
    () => window.matchMedia(query).matches,
    () => false
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

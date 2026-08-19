"use client";

import { useEffect } from "react";
import { initLenis, destroyLenis } from "@/lib/lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    initLenis();
    return () => destroyLenis();
  }, [reducedMotion]);

  return <>{children}</>;
}

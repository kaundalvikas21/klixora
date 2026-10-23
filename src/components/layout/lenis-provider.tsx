"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Smooth scrolling, matching the reference. Disabled outright when the
 * visitor prefers reduced motion — hijacked scrolling is a motion effect.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
      {children}
    </ReactLenis>
  );
}

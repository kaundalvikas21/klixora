"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE, REVEAL_DURATION, VIEWPORT } from "@/utils/motion";

type RevealProps = {
  children: ReactNode;
  /** Travel distance in px. The reference uses 40 for sections, 44 for service cards. */
  y?: number;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
};

/**
 * The single scroll-reveal used across the whole site, so every section
 * enters on the same curve and timing instead of each re-declaring it.
 * Collapses to a plain wrapper when the visitor prefers reduced motion.
 */
export function Reveal({
  children,
  y = 40,
  delay = 0,
  className,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Comp = motion[as];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: REVEAL_DURATION, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

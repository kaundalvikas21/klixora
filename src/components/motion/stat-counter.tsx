"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const DURATION_MS = 1700;

/** Ease-out-cubic, matching the reference counter exactly. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type Props = { value: number; suffix: string; label: string; id: string };

export function StatCounter({ value, suffix, label, id }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // Reduced motion is handled by deriving `shown` below, so the effect only
    // ever runs the animation itself — no synchronous setState on mount.
    if (!inView || reduced) return;

    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      setDisplay(Math.round(value * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, reduced]);

  const shown = reduced ? value : display;

  return (
    <div ref={ref} data-testid={`stat-${id}`} className="text-center">
      <p className="font-display text-4xl font-extrabold tracking-tight sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl">
        <span className="text-gradient">
          {shown}
          {suffix}
        </span>
      </p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

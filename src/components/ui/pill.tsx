import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * The outlined micro-label used on cards: a mono, wide-tracked cap line in a
 * hairline capsule.
 *
 * One component rather than the same five utilities repeated per card grid,
 * so the border weight, the tint and the tracking stay identical everywhere
 * it appears. It is not interactive, so it has no hover or press state.
 */
export function Pill({
  children,
  tone = "cyan",
  className,
}: {
  children: ReactNode;
  /** Matches the accent the surrounding card already uses. */
  tone?: "cyan" | "violet" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.18em]",
        tone === "cyan" && "border-cyan-300/25 bg-cyan-400/[0.07] text-cyan-300",
        tone === "violet" && "border-violet-400/25 bg-violet-500/[0.07] text-violet-200",
        tone === "muted" && "border-white/12 bg-white/[0.04] text-slate-300",
        className,
      )}
    >
      {children}
    </span>
  );
}

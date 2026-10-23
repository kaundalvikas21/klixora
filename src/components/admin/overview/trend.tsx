import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Period-on-period change.
 *
 * Every KPI on this screen is higher-is-better, so rising is green. That is
 * a property of these metrics, not a universal rule, which is why it is a
 * prop: the day a bounce rate or a cost-per-lead appears here, it passes
 * `higherIsBetter={false}` and the colour follows the meaning rather than
 * the arrow.
 *
 * Colour is never the only cue. The icon changes shape with the direction,
 * and the accessible name says it in words.
 */
export function Trend({
  change,
  higherIsBetter = true,
  className,
}: {
  /** Percentage change, or null when there is no prior period to compare. */
  change: number | null;
  higherIsBetter?: boolean;
  className?: string;
}) {
  if (change === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-500",
          className,
        )}
        title="No earlier period to compare with yet"
      >
        <Minus size={10} aria-hidden="true" />
        <span className="sr-only">No baseline to compare with</span>
        <span aria-hidden="true">--</span>
      </span>
    );
  }

  const flat = change === 0;
  const good = higherIsBetter ? change > 0 : change < 0;
  const Icon = flat ? Minus : change > 0 ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
        flat
          ? "bg-white/5 text-slate-400"
          : good
            ? "bg-emerald-500/10 text-emerald-300"
            : "bg-rose-500/10 text-rose-300",
        className,
      )}
    >
      <Icon size={11} aria-hidden="true" />
      <span aria-hidden="true">{Math.abs(change)}%</span>
      <span className="sr-only">
        {flat
          ? "unchanged on the previous period"
          : `${change > 0 ? "up" : "down"} ${Math.abs(change)} percent on the previous period`}
      </span>
    </span>
  );
}

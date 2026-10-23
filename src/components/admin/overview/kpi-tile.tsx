import Link from "next/link";
import { Sparkline } from "@/components/admin/ui/charts";
import { Trend } from "@/components/admin/overview/trend";
import { MicroLabel } from "@/components/admin/ui/primitives";
import { STATUS, kpiTone } from "@/lib/status";
import type { KpiTile as Tile } from "@/server/admin";
import { cn } from "@/utils/cn";

/**
 * Four slots, the same four in every tile: a mono label with a status cue, a
 * big number, a trend mark, and a one-line footnote.
 *
 * The status colour is applied to the NUMBER and to a small icon beside the
 * label, never to the surrounding text, and it always arrives with a written
 * label. A RAG scale that lives only in hue is unreadable to roughly one man
 * in twelve, and invisible in a screenshot or in forced-colours mode.
 */
export function KpiTile({ tile }: { tile: Tile }) {
  const tone = kpiTone(tile.id, Number(tile.value), tile.change);
  const status = STATUS[tone];
  const StatusIcon = status.icon;

  return (
    <Link
      href={tile.href}
      // The whole tile is the target, so the status is announced with the
      // figure rather than as a separate, orphaned item.
      aria-label={`${tile.label}: ${tile.value}${tile.unit}. ${status.label}. ${tile.footnote}`}
      className="group flex min-w-0 flex-col rounded-xl border border-white/8 bg-card/70 p-4 transition-colors hover:border-cyan-300/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <StatusIcon
            size={12}
            aria-hidden="true"
            className={cn("shrink-0", status.text)}
          />
          <MicroLabel className="truncate">{tile.label}</MicroLabel>
        </span>

        <Trend change={tile.change} className="shrink-0" />
      </div>

      <p className="mt-3 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-mono text-3xl font-medium tabular-nums leading-none",
            status.text,
          )}
        >
          {tile.value}
        </span>
        <span className="font-mono text-xs text-slate-400">{tile.unit}</span>
      </p>

      {/* The written half of the status pairing. */}
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {status.label}
      </p>

      <div className="mt-2">
        <Sparkline values={tile.series} tone={tone} labels={tile.seriesLabels} />
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-400">{tile.footnote}</p>
    </Link>
  );
}

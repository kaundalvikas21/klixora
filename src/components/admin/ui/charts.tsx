"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { STATUS, seriesColour, type StatusTone } from "@/lib/status";
import { cn } from "@/utils/cn";

/**
 * The admin's chart marks.
 *
 * Recharts rather than hand-rolled SVG, because every one of these now
 * carries a hover layer: a chart a reader cannot interrogate is a picture of
 * data, not a view of it. Axes and grids stay recessive, marks stay thin,
 * and the series colour never leaks into the text around it.
 */
const TOOLTIP_SURFACE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  padding: "0.5rem 0.625rem",
  fontSize: "0.6875rem",
} as const;

function TooltipBody({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string;
  unit?: string;
}) {
  return (
    <div style={TOOLTIP_SURFACE}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-xs tabular-nums text-slate-100">
        {value}
        {unit ? <span className="text-slate-400"> {unit}</span> : null}
      </p>
    </div>
  );
}

/**
 * Daily trend behind a KPI number. Tinted by the tile's own status tone, so
 * the mark agrees with the figure above it rather than competing with it.
 */
export function Sparkline({
  values,
  tone = "neutral",
  labels,
  unit,
  height = 44,
  className,
}: {
  values: number[];
  tone?: StatusTone;
  /** One per value, e.g. a date. Falls back to an index. */
  labels?: string[];
  unit?: string;
  height?: number;
  className?: string;
}) {
  if (values.length < 2) {
    return <div style={{ height }} aria-hidden="true" className={className} />;
  }

  const colour = STATUS[tone].hex;
  const data = values.map((value, i) => ({
    value,
    label: labels?.[i] ?? `Point ${i + 1}`,
  }));
  const gradientId = `spark-${tone}`;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colour} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colour} stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Hidden axes: the sparkline's job is shape, not precise reading.
              The tooltip supplies the exact value on demand. */}
          <XAxis dataKey="label" hide />
          <YAxis hide domain={[0, "dataMax"]} />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TooltipBody
                  label={String(payload[0]!.payload.label)}
                  value={Number(payload[0]!.value)}
                  unit={unit}
                />
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={colour}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: colour }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * "Where leads come from", as vertical bars.
 *
 * Each source is a distinct identity, so it gets a distinct hue from the
 * categorical scale, assigned by fixed position and never cycled. These are
 * deliberately NOT the status colours: painting a lead source amber would
 * read as a warning about that source rather than as a label for it.
 */
export function SourceBars({
  items,
  emptyLabel = "No data in this range yet.",
}: {
  items: { source: string; count: number }[];
  emptyLabel?: string;
}) {
  if (!items.length) {
    return <p className="text-xs text-slate-400">{emptyLabel}</p>;
  }

  /**
   * One category is not a distribution, and a lone bar invites the reader to
   * compare it with something that is not there.
   *
   * A paragraph is not the answer either: a panel of running text beside a
   * row of tiles reads as a message about the dashboard rather than as part
   * of it. A single value is a stat, so it is drawn as one, with the same
   * categorical dot the bar would have carried so the identity still has a
   * colour, and the whole thing stays the shape of a reading.
   */
  if (items.length === 1) {
    const only = items[0]!;
    return (
      <div className="flex h-full flex-col justify-center gap-3 py-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-medium tabular-nums leading-none text-white">
            {only.count}
          </span>
          <span className="text-xs text-slate-400">
            {only.count === 1 ? "enquiry" : "enquiries"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: seriesColour(0) }}
          />
          <span className="min-w-0 truncate text-sm text-slate-200">
            {only.source}
          </span>
          <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
            100%
          </span>
        </div>

        <div
          aria-hidden="true"
          className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]"
        >
          <span
            className="block h-full w-full rounded-full"
            style={{ background: seriesColour(0) }}
          />
        </div>

        <p className="text-xs leading-relaxed text-slate-500">
          Every enquiry so far took the same route. A second one appears here
          as soon as it is used.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={items}
          margin={{ top: 22, right: 8, bottom: 4, left: 0 }}
          barCategoryGap="24%"
        >
          <XAxis
            dataKey="source"
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            interval={0}
            height={46}
            // Labels wear a text token, never the series colour, and wrap
            // onto a second line instead of being turned on their side.
            // Recharts types the tick props loosely; the renderer only
            // reads x, y and the label.
            tick={(props: unknown) => <WrappedTick {...(props as TickProps)} />}
          />
          <YAxis hide domain={[0, "dataMax"]} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TooltipBody
                  label={String(payload[0]!.payload.source)}
                  value={Number(payload[0]!.value)}
                  unit={Number(payload[0]!.value) === 1 ? "lead" : "leads"}
                />
              ) : null
            }
          />
          {/* Thin marks with a rounded data-end anchored to the baseline,
              and the value written above each bar so the chart reads
              without hovering. */}
          {/* Capped, so two sources are two bars and not two slabs. */}
          <Bar
            dataKey="count"
            radius={[5, 5, 0, 0]}
            maxBarSize={56}
            isAnimationActive={false}
          >
            {items.map((item, i) => (
              <Cell key={item.source} fill={seriesColour(i)} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              offset={8}
              className="fill-slate-300"
              style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Category labels wrapped onto two lines. Recharts' `angle` option turns
 * them diagonally, which is slower to read than a short wrap and collides
 * with the panel edge.
 */
type TickProps = {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string };
};

function WrappedTick({ x, y, payload }: TickProps) {
  const left = Number(x ?? 0);
  const top = Number(y ?? 0);
  const text = String(payload?.value ?? "");
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > 14 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
    if (lines.length === 2) break;
  }
  if (line && lines.length < 2) lines.push(line);

  return (
    <g transform={`translate(${left},${top + 12})`}>
      {lines.map((entry, i) => (
        <text
          key={i}
          x={0}
          y={i * 12}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={10}
        >
          {entry.length > 16 ? `${entry.slice(0, 15)}\u2026` : entry}
        </text>
      ))}
    </g>
  );
}

/** A score out of 100 as a ring. Colour comes from the shared status scale. */
export function ScoreRing({
  score,
  tone,
  size = 36,
  label,
}: {
  score: number;
  tone: StatusTone;
  size?: number;
  label?: string;
}) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `Score ${score} out of 100, ${STATUS[tone].label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={STATUS[tone].hex}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <span className="absolute font-mono text-[10px] tabular-nums text-slate-200">
        {score}
      </span>
    </span>
  );
}

/** Fit score as a short bar plus the number. Used in the leads table. */
export function FitBar({ score }: { score: number }) {
  const tone: StatusTone = score >= 70 ? "good" : score >= 40 ? "warning" : "neutral";

  return (
    <span className="flex items-center gap-2">
      <span
        className="h-1.5 w-14 overflow-hidden rounded-full bg-white/[0.08]"
        role="img"
        aria-label={`Fit score ${score} out of 100`}
      >
        <span
          aria-hidden="true"
          className={cn("block h-full rounded-full", STATUS[tone].dot)}
          style={{ width: `${Math.max(2, score)}%` }}
        />
      </span>
      <span className="font-mono text-[11px] tabular-nums text-slate-400">
        {score}
      </span>
    </span>
  );
}

/** Kept for the panels that still render a plain list beside a chart. */
export function BarList({
  items,
  emptyLabel,
}: {
  items: { source: string; count: number }[];
  emptyLabel?: string;
}) {
  return <SourceBars items={items} emptyLabel={emptyLabel} />;
}

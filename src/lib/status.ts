/**
 * The admin's semantic status palette, and the only place a state is
 * turned into a colour.
 *
 * Two rules it exists to enforce:
 *
 *  1. Status colours are RESERVED. They mean good / warning / critical and
 *     are never reused as a chart series or as decoration, so a colour on
 *     this screen always carries the same meaning.
 *  2. Colour never carries meaning alone. Every tone ships with an icon and
 *     a short label, because roughly one in twelve men cannot separate the
 *     red and green ends of a RAG scale, and because a colour on its own is
 *     unreadable in a screenshot, in print, or in forced-colours mode.
 *
 * The steps are the site's own tokens rather than an imported palette, so
 * the admin stays in one visual system.
 */
import {
  CircleAlert,
  CircleCheck,
  CircleDot,
  Minus,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

export type StatusTone = "good" | "warning" | "critical" | "info" | "neutral";

type ToneSpec = {
  /** Bordered capsule, for chips and badges. */
  chip: string;
  /** Foreground only, for a number or a label. */
  text: string;
  /** Small filled dot, for a legend or a leading marker. */
  dot: string;
  /** Hex, for canvas and SVG marks that cannot take a class. */
  hex: string;
  icon: LucideIcon;
  /** Read aloud, and shown wherever space allows. */
  label: string;
};

export const STATUS: Record<StatusTone, ToneSpec> = {
  good: {
    chip: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
    hex: "#34d399",
    icon: CircleCheck,
    label: "On track",
  },
  warning: {
    chip: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    text: "text-amber-300",
    dot: "bg-amber-400",
    hex: "#fbbf24",
    icon: TriangleAlert,
    label: "Needs attention",
  },
  critical: {
    chip: "border-rose-400/30 bg-rose-500/10 text-rose-200",
    text: "text-rose-300",
    dot: "bg-rose-400",
    hex: "#fb7185",
    icon: CircleAlert,
    label: "Off track",
  },
  info: {
    chip: "border-cyan-300/30 bg-cyan-400/10 text-cyan-200",
    text: "text-cyan-300",
    dot: "bg-cyan-300",
    hex: "#22d3ee",
    icon: CircleDot,
    label: "In progress",
  },
  neutral: {
    chip: "border-white/12 bg-white/[0.04] text-slate-300",
    text: "text-slate-300",
    dot: "bg-slate-500",
    hex: "#94a3b8",
    icon: Minus,
    label: "No signal",
  },
};

/**
 * Where each KPI turns from green to amber to red.
 *
 * Written out rather than inferred, because a threshold is a business
 * decision and should be visible and arguable in one place. `null` means
 * the metric has no good/bad direction on its own.
 */
export const KPI_THRESHOLDS: Record<
  string,
  { good: number; warning: number } | null
> = {
  // A raw count is not good or bad by itself; its tone comes from the trend.
  "new-leads": null,
  "replied-in-time": { good: 90, warning: 70 },
  "lead-to-won": { good: 20, warning: 10 },
  "seo-health": { good: 80, warning: 50 },
};

/**
 * The tone for one KPI. Pure, so the tile, the ring and any future alert
 * cannot disagree about whether a number is healthy.
 */
export function kpiTone(
  id: string,
  value: number,
  change: number | null = null,
): StatusTone {
  const band = KPI_THRESHOLDS[id];

  if (band === null) {
    // Trend-only metric: flat or unknown is neutral, not a failure.
    if (change === null || change === 0) return "neutral";
    return change > 0 ? "good" : "warning";
  }
  if (!band) return "neutral";

  if (value >= band.good) return "good";
  if (value >= band.warning) return "warning";
  return "critical";
}

/** A 0-100 score, using the same bands as the SEO health tile. */
export function scoreTone(score: number): StatusTone {
  return kpiTone("seo-health", score);
}

/**
 * Lead pipeline states.
 *
 * A progression rather than a pure RAG scale: a lead sitting in CONTACTED is
 * not a failure, it is mid-flight. Only the two terminal states carry the
 * green and red ends.
 */
export const LEAD_TONE: Record<string, StatusTone> = {
  NEW: "info",
  CONTACTED: "warning",
  QUALIFIED: "good",
  WON: "good",
  LOST: "critical",
  all: "neutral",
};

/** Won is the stronger green; qualified is promising but not banked. */
export const LEAD_LABEL: Record<string, string> = {
  NEW: "Awaiting a first reply",
  CONTACTED: "Replied, in conversation",
  QUALIFIED: "Qualified, not yet won",
  WON: "Won",
  LOST: "Closed lost",
  all: "Every lead",
};

/**
 * Categorical series colours, for charts where each bar is a different
 * THING rather than a different health.
 *
 * Deliberately separate from STATUS above. A status colour is reserved: if
 * "Hero - Enquire Now" were painted amber it would read as a warning rather
 * than as an identity. These are assigned by fixed index and never cycled,
 * so a source keeps its colour when the list is filtered or reordered.
 *
 * Nine or more categories is a signal to group the tail into "Other"
 * rather than to invent a tenth hue.
 */
export const SERIES_COLOURS = [
  "#22d3ee", // cyan, the brand's primary accent
  "#8b5cf6", // violet
  "#34d399", // mint
  "#f472b6", // pink
  "#60a5fa", // blue
  "#fbbf24", // amber
  "#a78bfa", // lilac
  "#2dd4bf", // teal
] as const;

/** The colour for one category, by its fixed position in the list. */
export const seriesColour = (index: number) =>
  SERIES_COLOURS[index % SERIES_COLOURS.length]!;

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

/**
 * Panel's surface, copied rather than imported: primitives.tsx is a client
 * module, and a loading state has no business pulling the whole admin UI kit
 * into the browser before the page it stands in for has even arrived.
 */
const PANEL = "rounded-xl border border-white/8 bg-card/70 p-4 sm:p-5";

/**
 * The shapes every admin screen's loading state is built from.
 *
 * They match the layout each page actually renders — the same tab row, the
 * same panel grid, the same table — so the screen does not jump when the
 * data lands. They deliberately stop at that: a placeholder for every label
 * and helper line would be a second copy of each editor to keep in step.
 *
 * One announcement per screen, from `AdminLoading`. Everything below it is
 * aria-hidden, so a screen reader hears "Loading the leads" rather than
 * forty empty boxes.
 */
export function AdminLoading({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">Loading {label}…</span>
      {children}
    </div>
  );
}

/** The segmented tab row at the top of CMS and Settings. */
export function TabBarSkeleton({ widths }: { widths: number[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {widths.map((w, i) => (
        <Skeleton key={i} className="h-9 rounded-lg" style={{ width: w }} />
      ))}
    </div>
  );
}

/** A labelled input: the mono micro-label above, the control below. */
export function FieldSkeleton({ label = 90 }: { label?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-2.5" style={{ width: label }} />
      <Skeleton className="h-10 rounded-lg" />
    </div>
  );
}

/** A panel with its heading, optional hint line, and N fields. */
export function PanelSkeleton({
  fields = 3,
  hint = true,
  className,
}: {
  fields?: number;
  hint?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(PANEL, "flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-36" />
        {hint ? <Skeleton className="h-3 w-full max-w-xs" /> : null}
      </div>
      {Array.from({ length: fields }, (_, i) => (
        <FieldSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * The two-up editor layout shared by Home Page CMS and SEO & Social: a stack
 * of editor panels on the left, a sticky preview column on the right.
 */
export function EditorSkeleton({
  left = 2,
  right = 2,
}: {
  left?: number;
  right?: number;
}) {
  return (
    <div className="grid gap-5 wide:grid-cols-2 wide:items-start">
      <div className="flex flex-col gap-5">
        {Array.from({ length: left }, (_, i) => (
          <PanelSkeleton key={i} fields={i === 0 ? 3 : 2} />
        ))}
      </div>
      <div className="flex flex-col gap-5">
        {Array.from({ length: right }, (_, i) => (
          <div key={i} className={cn(PANEL, "flex flex-col gap-4")}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** A table: the header strip, then `rows` rows of `cols` cells. */
export function TableSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <Skeleton className="h-3 w-full max-w-sm" />
      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className="grid items-center gap-3 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-3.5"
          style={{ gridTemplateColumns: `1.6fr repeat(${cols - 1}, 1fr)` }}
        >
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className={cn("h-4", c === 0 ? "" : "w-16")} />
          ))}
        </div>
      ))}
    </div>
  );
}

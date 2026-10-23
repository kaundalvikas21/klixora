import { cn } from "@/utils/cn";

/**
 * The numbered card marker: a mono index with a hairline running out beside
 * it to the card's edge, as on the reference build.
 *
 * One component rather than the same two spans repeated in each card grid,
 * so the rule's colour and weight stay identical everywhere it appears.
 *
 * The number is derived from position, never stored, so reordering a grid
 * renumbers it for free.
 */
export function CardIndex({
  index,
  className,
}: {
  /** Zero-based position in the grid. */
  index: number;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)} aria-hidden="true">
      <span className="font-mono text-[11px] tracking-[0.24em] text-cyan-300">
        {String(index + 1).padStart(2, "0")}
      </span>
      {/* Fades out as it runs, so it reads as a rule rather than a border. */}
      <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/40 to-transparent" />
    </span>
  );
}

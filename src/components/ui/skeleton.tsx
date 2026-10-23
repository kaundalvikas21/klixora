import type { ComponentProps } from "react";
import { cn } from "@/utils/cn";

/**
 * shadcn's Skeleton, with one change: the fill is a translucent white rather
 * than `bg-accent`, because `--accent` in this theme is the brand cyan and a
 * pulsing cyan block reads as content rather than as an absence of it.
 *
 * `animate-pulse` is already disabled by the reduced-motion rule in
 * globals.css, so the block simply sits still for anyone who asked for that.
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-white/[0.06]", className)}
      {...props}
    />
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils/cn";

/**
 * 7d / 30d. The range lives in the URL rather than in state, so a reload or
 * a shared link keeps it and the server can read it directly.
 */
export function RangeToggle({ days }: { days: 7 | 30 }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function select(next: 7 | 30) {
    const query = new URLSearchParams(params.toString());
    query.set("days", String(next));
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  }

  return (
    <div
      role="group"
      aria-label="Date range"
      className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
    >
      {([7, 30] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={days === option}
          onClick={() => select(option)}
          className={cn(
            "rounded-md px-3 py-1.5 font-mono text-[11px] tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
            days === option
              ? "bg-white/[0.08] text-white"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          {option}d
        </button>
      ))}
    </div>
  );
}

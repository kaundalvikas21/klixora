"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useNavGuard } from "@/components/admin/shell/nav-rail";
import { cn } from "@/utils/cn";

/**
 * Tabs as links with the active tab in the query string, so a reload, a
 * bookmark and a link from the Overview all land on the same tab. The
 * unsaved-changes guard applies here too: switching tab throws away a draft
 * just as surely as leaving the screen.
 */
export function AdminTabs({
  param = "tab",
  tabs,
  active,
  label,
}: {
  param?: string;
  tabs: { id: string; label: string; badge?: string }[];
  active: string;
  label: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const guard = useNavGuard();

  function hrefFor(id: string) {
    const query = new URLSearchParams(params.toString());
    query.set(param, id);
    return `${pathname}?${query.toString()}`;
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 no-scrollbar"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={hrefFor(tab.id)}
            role="tab"
            aria-selected={isActive}
            onClick={guard}
            scroll={false}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
              isActive
                ? "border-cyan-300/40 bg-cyan-400/10 text-white"
                : "border-white/8 text-slate-300 hover:border-white/15 hover:text-white",
            )}
          >
            {tab.label}
            {tab.badge ? (
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-slate-300">
                {tab.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

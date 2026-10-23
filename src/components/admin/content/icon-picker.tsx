"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ICON_NAMES, ICONS, type IconName } from "@/components/ui/icon";
import { Input, MicroLabel } from "@/components/admin/ui/primitives";
import { cn } from "@/utils/cn";

/**
 * Picks from the icon allowlist in components/ui/icon.tsx, which is the same
 * list the public cards can render. A free-text icon name would let the admin
 * save one the site cannot draw.
 */
export function IconPicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (name: IconName) => void;
  error?: string;
}) {
  const [query, setQuery] = useState("");

  const matches = query
    ? ICON_NAMES.filter((name) => name.toLowerCase().includes(query.toLowerCase()))
    : ICON_NAMES;

  return (
    <fieldset>
      <legend className="mb-1.5">
        <MicroLabel>Icon</MicroLabel>
      </legend>

      <div className="relative">
        <Search
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter icons"
          aria-label="Filter icons"
          className="pl-9"
        />
      </div>

      <div className="mt-2 grid max-h-44 grid-cols-7 gap-1.5 overflow-y-auto rounded-lg border border-white/8 p-2 sm:grid-cols-9">
        {matches.map((name) => {
          const Glyph = ICONS[name];
          const selected = value === name;
          return (
            <button
              key={name}
              type="button"
              title={name}
              aria-label={name}
              aria-pressed={selected}
              onClick={() => onChange(name)}
              className={cn(
                "flex h-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
                selected
                  ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-200"
                  : "border-transparent text-slate-400 hover:border-white/10 hover:text-slate-100",
              )}
            >
              <Glyph size={16} aria-hidden="true" />
            </button>
          );
        })}
        {matches.length === 0 ? (
          <p className="col-span-full py-3 text-center text-xs text-slate-400">
            No icon matches &ldquo;{query}&rdquo;.
          </p>
        ) : null}
      </div>

      <p className="mt-1.5 font-mono text-[10px] text-slate-500">{value}</p>
      <span aria-live="polite" className="mt-1 block min-h-4 text-xs text-rose-300">
        {error}
      </span>
    </fieldset>
  );
}

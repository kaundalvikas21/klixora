"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button, Input, MicroLabel } from "@/components/admin/ui/primitives";
import { SortableList, SortableRow } from "@/components/admin/ui/sortable";

/**
 * A list of plain strings, drag to reorder. Used for the hero headline
 * lines, the hero chips and the contact promises.
 *
 * Rows are keyed by index rather than by value: two identical lines are
 * legitimate while someone is mid-edit, and a value key would collapse them.
 */
export function StringRepeater({
  label,
  hint,
  values,
  onChange,
  placeholder,
  addLabel = "Add row",
  max = 8,
  /** Hero headline lines are uppercase on the live page. */
  uppercase = false,
  error,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  max?: number;
  uppercase?: boolean;
  error?: string;
}) {
  const rows = values.map((value, index) => ({ id: `row-${index}`, value, index }));

  function update(index: number, value: string) {
    const next = [...values];
    next[index] = uppercase ? value.toUpperCase() : value;
    onChange(next);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <MicroLabel>{label}</MicroLabel>
        <span className="font-mono text-[10px] tabular-nums text-slate-500">
          {values.length} / {max}
        </span>
      </div>

      <SortableList
        items={rows}
        getId={(row) => row.id}
        onReorder={(ids) => {
          const order = ids.map((id) => Number(id.replace("row-", "")));
          onChange(order.map((i) => values[i] ?? ""));
        }}
        className="flex flex-col gap-1.5"
      >
        {(row) => (
          <SortableRow
            key={row.id}
            id={row.id}
            label={`Reorder line ${row.index + 1}`}
          >
            <div className="flex items-center gap-2">
              <Input
                value={row.value}
                placeholder={placeholder}
                aria-label={`${label} line ${row.index + 1}`}
                onChange={(event) => update(row.index, event.target.value)}
                className={uppercase ? "uppercase" : undefined}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete line ${row.index + 1}`}
                disabled={values.length <= 1}
                onClick={() => onChange(values.filter((_, i) => i !== row.index))}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </SortableRow>
        )}
      </SortableList>

      <div className="mt-2 flex items-center gap-3 pl-8">
        <Button
          variant="secondary"
          size="sm"
          disabled={values.length >= max}
          onClick={() => onChange([...values, ""])}
        >
          <Plus size={13} /> {addLabel}
        </Button>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>

      <span aria-live="polite" className="mt-1 block min-h-4 text-xs text-rose-300">
        {error}
      </span>
    </div>
  );
}

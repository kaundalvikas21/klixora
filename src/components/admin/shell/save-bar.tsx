"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/primitives";
import { useDirty, type DirtyChange } from "@/components/admin/shell/dirty";
import type { ActionResult } from "@/server/actions/result";

/**
 * Sticky bar that appears as soon as anything is unsaved. It sits above the
 * mobile tab bar rather than on top of it, which is what the bottom inset
 * below is for.
 */
export function SaveBar({
  onSaveDraft,
  onPublish,
  onDiscard,
}: {
  onSaveDraft: () => Promise<ActionResult>;
  onPublish: () => Promise<ActionResult>;
  onDiscard: () => void;
}) {
  const router = useRouter();
  const { changes, count } = useDirty();
  const [pending, setPending] = useState<"draft" | "publish" | null>(null);

  if (count === 0) return null;

  async function run(kind: "draft" | "publish") {
    setPending(kind);
    try {
      const result = kind === "draft" ? await onSaveDraft() : await onPublish();

      if (result.ok) {
        toast.success(result.message);
        // Pull the saved values back down as the new baseline. Without this
        // the editor keeps comparing against what was on screen when the
        // page loaded, so the bar never closes after a save.
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("[save-bar]", error);
      toast.error("That did not save. Check your connection and try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(4.25rem+env(safe-area-inset-bottom))] rail:pb-4 rail:pl-[calc(4.5rem+0.75rem)] wide:pl-[calc(16rem+1rem)]"
    >
      <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col gap-3 rounded-xl border border-cyan-300/25 bg-surface/95 p-3 shadow-2xl shadow-black/60 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
            {count} unsaved change{count === 1 ? "" : "s"}
          </p>
          <p className="mt-1 truncate text-xs text-slate-300">{summarise(changes)}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDiscard} disabled={pending !== null}>
            <RotateCcw size={13} /> Discard
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => run("draft")}
            disabled={pending !== null}
          >
            {pending === "draft" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            Save draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => run("publish")}
            disabled={pending !== null}
          >
            {pending === "publish" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Upload size={13} />
            )}
            Save &amp; publish
          </Button>
        </div>
      </div>
    </div>
  );
}

/** "Sub-headline (142 to 151 characters), Headline lines (reordered)". */
function summarise(changes: Record<string, DirtyChange>) {
  const entries = Object.values(changes);
  const shown = entries
    .slice(0, 3)
    .map((change) => `${change.label} (${change.summary})`)
    .join(", ");
  const rest = entries.length - 3;
  return rest > 0 ? `${shown} and ${rest} more` : shown;
}

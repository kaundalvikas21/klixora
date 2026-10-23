"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Check, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/ui/drawer";
import { Button, EmptyState } from "@/components/admin/ui/primitives";
import { publishAll } from "@/server/actions/publish";
import type { Preflight } from "@/server/admin";

/**
 * Pre-flight before publishing. It states what is about to change and what
 * is wrong, which is the difference between a publish button and a dare.
 */
export function PublishDialog({
  open,
  onClose,
  preflight,
}: {
  open: boolean;
  onClose: () => void;
  preflight: Preflight;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handlePublish() {
    startTransition(async () => {
      const result = await publishAll();
      if (result.ok) {
        toast.success(result.message);
        setDone(true);
        onClose();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publish to the live site"
      description="Drafts are copied over the published copy. The live page updates on its next request, with no redeploy."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePublish}
            disabled={pending || preflight.changes.length === 0}
          >
            {pending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            Publish {preflight.changes.length || ""}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
            About to change
          </h3>
          {preflight.changes.length ? (
            <ul className="mt-3 flex flex-col gap-2.5">
              {preflight.changes.map((change) => (
                <li key={change.label} className="flex gap-2.5">
                  <Check
                    size={14}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-emerald-300"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-slate-200">{change.label}</span>
                    <span className="block text-xs leading-relaxed text-slate-400">
                      {change.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <EmptyState
                title={done ? "Published" : "Nothing to publish"}
                detail="Every draft already matches what the live page is rendering."
              />
            </div>
          )}
        </section>

        {preflight.warnings.length ? (
          <section>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
              Worth knowing
            </h3>
            <ul className="mt-3 flex flex-col gap-2.5">
              {preflight.warnings.map((warning) => (
                <li key={warning.label} className="flex gap-2.5">
                  <AlertTriangle
                    size={14}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-amber-300"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-slate-200">{warning.label}</span>
                    <span className="block text-xs leading-relaxed text-slate-400">
                      {warning.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Modal>
  );
}

"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/admin/ui/primitives";
import { cn } from "@/utils/cn";

/**
 * Side drawer and centred dialog, both on the native <dialog> element so the
 * browser supplies the focus trap, the Escape handler and the top layer. A
 * hand-rolled focus trap is the kind of thing that quietly breaks.
 */
type BaseProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // Covers Escape and the form's own close, so state stays in step.
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return ref;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
}: BaseProps & { width?: "md" | "lg" }) {
  const ref = useDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      aria-labelledby="drawer-title"
      className={cn(
        "ml-auto mr-0 h-dvh max-h-dvh w-full border-l border-white/10 bg-surface p-0 text-slate-200 backdrop:bg-ink/80 backdrop:backdrop-blur-sm",
        width === "lg" ? "max-w-2xl" : "max-w-lg",
      )}
    >
      <div className="flex h-dvh flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="drawer-title"
              className="font-display text-base font-bold tracking-tight text-white"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={16} />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/8 px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: BaseProps) {
  const ref = useDialog(open, onClose);
  // A generated id, not a constant: the sign-out confirmation is rendered
  // once per sign-out button, so several of these sit in the DOM at the same
  // time and a hardcoded id would be duplicated across all of them.
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="m-auto w-[calc(100vw-2rem)] max-w-lg rounded-xl border border-white/10 bg-surface p-0 text-slate-200 backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-base font-bold tracking-tight text-white"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/8 px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}

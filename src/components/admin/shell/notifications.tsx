"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Check, Inbox, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FitBar } from "@/components/admin/ui/charts";
import { Button } from "@/components/admin/ui/primitives";
import { markNotificationsSeen } from "@/server/actions/notifications";
import { timeAgo } from "@/lib/format";
import type { LeadNotifications } from "@/server/admin";
import { cn } from "@/utils/cn";

/**
 * How often the bell asks for new leads while the tab is in front. Leads
 * arrive a few times a day, not a few times a minute, so a tighter interval
 * would buy nothing and cost a request per operator per tick.
 */
const POLL_MS = 60_000;

/**
 * The header bell.
 *
 * It polls rather than holding a socket open. A realtime subscription is the
 * obvious alternative and would be a genuine upgrade for a busier inbox, but
 * it is a connection to keep alive through sleeps, redeploys and a serverless
 * host, in exchange for latency nobody is waiting on here.
 *
 * Polling stops while the tab is hidden and catches up the moment it comes
 * back, so a laptop left open overnight makes one request on wake rather than
 * several hundred it slept through.
 */
export function Notifications({ initial }: { initial: LeadNotifications }) {
  const [data, setData] = useState(initial);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        cache: "no-store",
      });
      // 401 means the session went away under us. Say nothing: the proxy
      // redirects to the login screen on the operator's next move, and a
      // toast from a background poll would land with no context.
      if (!response.ok) return;
      setData((await response.json()) as LeadNotifications);
    } catch {
      // Offline, or the tab is being torn down. The next tick covers it.
    }
  }, []);

  // Poll on a timer, but only while the tab is visible, and catch up as soon
  // as it is looked at again.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);


  // Dismiss on an outside click or Escape, and hand focus back to the bell so
  // a keyboard user is not dropped at the top of the document.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (bellRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      bellRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function markRead() {
    startTransition(async () => {
      const result = await markNotificationsSeen();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      // Clear locally rather than waiting for the next poll: the operator
      // just pressed the thing, and a badge that lingers reads as a failure.
      setData((current) => ({
        ...current,
        unread: 0,
        items: current.items.map((item) => ({ ...item, unread: false })),
      }));
    });
  }

  const unread = data.unread;
  const capped = unread > 99 ? "99+" : String(unread);

  return (
    <div className="relative">
      <button
        ref={bellRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          unread ? `Notifications, ${unread} unread` : "Notifications, none unread"
        }
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-[color,background-color,transform] duration-150 ease-out hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <Bell size={17} aria-hidden="true" />
        {unread > 0 ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 font-mono text-[9px] font-bold leading-4 text-ink",
              // Entering from 0.6 rather than 0: nothing in the world appears
              // out of nothing, and the overshoot is earned here because a
              // new lead genuinely arrived.
              "animate-in zoom-in-50 duration-200 motion-reduce:animate-none",
            )}
          >
            {capped}
          </span>
        ) : null}
      </button>

      {/* A live region outside the popover, so the count is announced whether
          or not the panel is open. */}
      <span aria-live="polite" className="sr-only">
        {unread > 0 ? `${unread} unread ${unread === 1 ? "lead" : "leads"}` : ""}
      </span>

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          // Scales out of the bell, not the centre of itself, so the panel
          // reads as coming from the control that opened it.
          className="absolute right-0 top-11 z-40 w-[min(22rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-xl border border-white/10 bg-surface shadow-2xl shadow-ink/60 animate-in fade-in-0 zoom-in-95 duration-150 ease-out motion-reduce:animate-none"
        >
          <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
            <h2 className="font-display text-sm font-bold tracking-tight text-white">
              New leads
            </h2>
            {unread > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={markRead}
                disabled={pending}
              >
                {pending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                Mark read
              </Button>
            ) : null}
          </header>

          {data.items.length ? (
            <ul className="max-h-[22rem] overflow-y-auto">
              {data.items.map((item) => (
                <li key={item.id} className="border-b border-white/5 last:border-0">
                  <Link
                    href={`/admin/leads?lead=${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    {/* The unread marker is a dot AND the name's weight, so
                        it never rests on colour alone. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        item.unread ? "bg-cyan-400" : "bg-white/15",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            item.unread
                              ? "font-semibold text-white"
                              : "text-slate-300",
                          )}
                        >
                          {item.name}
                          {item.unread ? (
                            <span className="sr-only"> (unread)</span>
                          ) : null}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                          {timeAgo(item.createdAt, data.now)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-400">
                        {item.goal}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <FitBar score={item.fitScore} />
                        <span className="font-mono text-[10px] text-slate-500">
                          {item.ref}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Inbox size={20} aria-hidden="true" className="text-slate-600" />
              <p className="text-sm text-slate-300">No enquiries yet</p>
              <p className="text-xs leading-relaxed text-slate-500">
                A lead from the contact form shows up here the moment it lands.
              </p>
            </div>
          )}

          <footer className="border-t border-white/8 px-4 py-2.5">
            <Link
              href="/admin/leads"
              onClick={() => setOpen(false)}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300 transition-colors hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              All leads
            </Link>
          </footer>
        </div>
      ) : null}
    </div>
  );
}

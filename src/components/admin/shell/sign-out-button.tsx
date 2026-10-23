"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/ui/drawer";
import { Button } from "@/components/admin/ui/primitives";
import { useDirty } from "@/components/admin/shell/dirty";
import { signOutAction } from "@/server/actions/auth";
import { LOGIN_PATH } from "@/lib/routes";
import { cn } from "@/utils/cn";

/**
 * Sign out, with the navigation gated on the action actually succeeding.
 *
 * The previous version redirected from inside the Server Action, so a failed
 * `signOut()` still sent the operator to the login screen while their
 * session stayed live on the server. Here a failure keeps them where they
 * are and says why, which is the only honest thing to do when the thing they
 * asked for did not happen.
 *
 * It asks first. Sign out sits in the rail a few pixels from the navigation,
 * it is the one control here that throws work away, and getting back costs a
 * password. Unsaved edits are named in the dialog rather than left to a
 * separate confirm, so the one question covers both.
 */
export function SignOutButton({
  /** Collapsed icon rail hides the label but keeps the accessible name. */
  labelHidden = false,
  className,
}: {
  labelHidden?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { count: unsaved } = useDirty();
  const [pending, startTransition] = useTransition();
  const [leaving, setLeaving] = useState(false);
  const [asking, setAsking] = useState(false);

  // The "signing out" state lasts until the navigation lands, and no longer.
  // The client router keeps this component mounted across sign out and the
  // next sign in, so without this the rail still read "Signing out..." to an
  // operator who was already back in. A changed pathname means the
  // navigation it was covering is over; a failed sign out never changes the
  // path, so the guard still holds exactly when it should.
  //
  // Adjusted during render rather than in an effect: this is state derived
  // from a change in the route, and an effect would paint the stale label
  // for a frame before correcting it.
  const [seenAt, setSeenAt] = useState(pathname);
  if (seenAt !== pathname) {
    setSeenAt(pathname);
    setLeaving(false);
  }

  // `leaving` outlives the transition: once the action has succeeded the
  // button must stay disabled through the navigation, or a second click
  // fires a sign-out against a session that is already gone.
  const busy = pending || leaving;

  function confirm() {
    if (busy) return;

    startTransition(async () => {
      try {
        const result = await signOutAction();

        if (!result.ok) {
          toast.error(result.message);
          return;
        }

        setLeaving(true);
        setAsking(false);
        router.replace(LOGIN_PATH);
        // Drops every cached Server Component payload rendered for the
        // signed-in operator, so nothing of theirs is left in memory for
        // whoever signs in next.
        router.refresh();
      } catch (error) {
        console.error("[sign-out]", error);
        toast.error(
          "Could not sign you out. Check your connection and try again.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAsking(true)}
        disabled={busy}
        aria-busy={busy}
        aria-label={labelHidden ? "Sign out" : undefined}
        title={labelHidden ? "Sign out" : undefined}
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-300 transition-[color,background-color,transform] duration-150 ease-out hover:bg-white/[0.04] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100",
          className,
        )}
      >
        {busy ? (
          <Loader2
            size={16}
            aria-hidden="true"
            className="shrink-0 animate-spin"
          />
        ) : (
          <LogOut size={16} aria-hidden="true" className="shrink-0" />
        )}
        <span className={cn("truncate", labelHidden && "sr-only")}>
          {busy ? "Signing out..." : "Sign out"}
        </span>
      </button>

      <Modal
        open={asking}
        onClose={() => {
          // Never let the dialog close out from under a request in flight:
          // the operator would be looking at the admin while the session is
          // already being torn down.
          if (!busy) setAsking(false);
        }}
        title="Sign out?"
        description="You will need your password to get back in."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setAsking(false)}
              disabled={busy}
            >
              Stay signed in
            </Button>
            <Button variant="danger" onClick={confirm} disabled={busy}>
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LogOut size={14} />
              )}
              Sign out
            </Button>
          </>
        }
      >
        {unsaved > 0 ? (
          <p className="text-sm leading-relaxed text-amber-200">
            {unsaved} unsaved {unsaved === 1 ? "change" : "changes"} on this
            screen will be lost. Cancel, save, and sign out after.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-slate-300">
            Everything is saved. The live site is unaffected either way.
          </p>
        )}
      </Modal>
    </>
  );
}

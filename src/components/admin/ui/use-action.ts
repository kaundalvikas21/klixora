"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/server/actions/result";

/**
 * Runs a Server Action optimistically: the caller has already applied the
 * change locally, and `rollback` puts it back if the action fails.
 *
 * Never block the UI on a round trip for a switch, which is why nothing here
 * awaits before the local state has already moved.
 */
export function useRowAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = useCallback(
    (
      action: () => Promise<ActionResult<unknown>>,
      options: { rollback?: () => void; silent?: boolean } = {},
    ) => {
      startTransition(async () => {
        try {
          const result = await action();
          if (result.ok) {
            if (!options.silent) toast.success(result.message);
            // Pull the server's version back, so a derived value (an
            // auto-number, a status that changed with a toggle) is correct.
            router.refresh();
          } else {
            options.rollback?.();
            toast.error(result.message);
          }
        } catch (error) {
          console.error("[action]", error);
          options.rollback?.();
          toast.error("That did not go through. Check your connection.");
        }
      });
    },
    [router],
  );

  return { run, pending };
}

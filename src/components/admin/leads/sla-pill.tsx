import { Badge } from "@/components/admin/ui/primitives";
import { slaState } from "@/lib/sla";
import type { StatusTone } from "@/lib/status";

/**
 * The reply-window state, mapped onto the shared status scale once so the
 * table, the board and the Overview queue cannot disagree about what amber
 * means.
 */
export const SLA_BADGE_TONE: Record<
  ReturnType<typeof slaState>["tone"],
  StatusTone
> = {
  ok: "good",
  soon: "warning",
  overdue: "critical",
  done: "neutral",
};

/**
 * The reply-window pill. `now` is passed in rather than read here so the
 * server and the client render the same string, and so a test can pin it.
 */
export function SlaPill({
  createdAt,
  slaHours,
  status,
  now,
}: {
  createdAt: string;
  slaHours: number;
  status: string;
  now: number;
}) {
  const state = slaState(new Date(createdAt), slaHours, status, new Date(now));
  return <Badge tone={SLA_BADGE_TONE[state.tone]}>{state.label}</Badge>;
}

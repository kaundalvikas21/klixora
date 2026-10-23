/**
 * The reply window. One function, because the pill in the leads table, the
 * "Replied in time" KPI tile and the "Needs you now" queue all have to agree
 * on what overdue means, and the number driving it is the SLA set on the
 * Contact section.
 */
export type SlaState = {
  /** Whole hours left. Negative once the window has closed. */
  hoursLeft: number;
  tone: "ok" | "soon" | "overdue" | "done";
  label: string;
};

const HOUR = 3600_000;

/** Under this many hours left, the pill turns amber. */
export const SLA_WARNING_HOURS = 6;

export function slaState(
  createdAt: Date,
  slaHours: number,
  status: string,
  now: Date = new Date(),
): SlaState {
  // The window only applies while nobody has picked the lead up.
  if (status !== "NEW") {
    return { hoursLeft: 0, tone: "done", label: "Replied" };
  }

  const elapsed = (now.getTime() - createdAt.getTime()) / HOUR;
  const left = slaHours - elapsed;

  if (left <= 0) {
    const over = Math.max(1, Math.floor(-left));
    return { hoursLeft: Math.floor(left), tone: "overdue", label: `Overdue ${over}h` };
  }
  if (left <= SLA_WARNING_HOURS) {
    return { hoursLeft: Math.floor(left), tone: "soon", label: `${Math.ceil(left)}h left` };
  }
  return { hoursLeft: Math.floor(left), tone: "ok", label: `${Math.floor(left)}h left` };
}

export const isOverdue = (
  createdAt: Date,
  slaHours: number,
  status: string,
  now?: Date,
) => slaState(createdAt, slaHours, status, now).tone === "overdue";

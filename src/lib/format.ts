/**
 * Shared formatting. Dates are rendered from an ISO string in a fixed
 * locale: `toLocaleString()` with the server's locale produces one string on
 * the server and another in the browser, which React reports as a hydration
 * mismatch.
 */
const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const DATE_ONLY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? DATE_TIME.format(new Date(iso)) : "--";

export const formatDate = (iso: string | null | undefined) =>
  iso ? DATE_ONLY.format(new Date(iso)) : "--";

/** "3h ago", "2d ago". Takes `now` so it can be rendered deterministically. */
export function timeAgo(iso: string, now: number) {
  const diff = now - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** "08:00-17:00" as a duration in hours, for the working-hours table. */
export function hoursBetween(opensAt: string, closesAt: string): string {
  if (!opensAt || !closesAt) return "--";
  const [oh, om] = opensAt.split(":").map(Number);
  const [ch, cm] = closesAt.split(":").map(Number);
  if ([oh, om, ch, cm].some((n) => Number.isNaN(n))) return "--";

  const minutes = (ch! * 60 + cm!) - (oh! * 60 + om!);
  if (minutes <= 0) return "--";

  const whole = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${whole}h ${rest}m` : `${whole}h`;
}

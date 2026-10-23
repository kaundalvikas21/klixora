/**
 * Which call to action sent the visitor to the form.
 *
 * Every CTA on the site scrolls to the same contact form, so without this
 * the stored `source` could only ever be one value and the "where leads come
 * from" chart compared a column against itself. The last CTA clicked is
 * remembered for the length of the visit and travels with the submission,
 * which makes the attribution real rather than decorative.
 *
 * sessionStorage, not a cookie: it is a UX breadcrumb, not something to
 * send on every request or to persist past the visit.
 */
const KEY = "klixora:lead-source";

/**
 * Used when somebody reaches the form without clicking a call to action:
 * they scrolled, or followed a link straight to #contact.
 *
 * Named for what happened, not for which form it was. There is only one
 * form, so "Contact - Home form" told the reader nothing and made the
 * sources chart look like it was comparing a column against itself.
 */
export const DIRECT_SOURCE = "Scrolled to the form";

export function rememberLeadSource(label: string) {
  try {
    sessionStorage.setItem(KEY, label.slice(0, 120));
  } catch {
    // Private mode, or storage disabled. Attribution is a nice-to-have and
    // must never be the reason an enquiry fails to send.
  }
}

export function readLeadSource(fallback = DIRECT_SOURCE): string {
  try {
    return sessionStorage.getItem(KEY) || fallback;
  } catch {
    return fallback;
  }
}

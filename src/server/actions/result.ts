/**
 * Shape every admin Server Action returns. Expected failures come back as
 * values so the form can render them inline, which is what the Next docs
 * recommend over throwing.
 */
export type ActionResult<T = undefined> = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  data?: T;
};

export const ok = <T>(message = "Saved.", data?: T): ActionResult<T> => ({
  ok: true,
  message,
  data,
});

export const fail = (
  message: string,
  fieldErrors?: Record<string, string>,
): ActionResult<never> => ({ ok: false, message, fieldErrors });

/** Turns a ZodError's issues into the flat map the forms render. */
export function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

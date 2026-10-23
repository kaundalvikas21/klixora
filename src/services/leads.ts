"use server";

import { enquirySchema } from "@/utils/validation";
import { getSupabaseClient } from "@/services/supabase";

export type SubmitResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/**
 * Trust boundary: the client-side step validation is UX only. Everything is
 * re-validated here before it reaches the database.
 */
export async function submitEnquiry(raw: unknown): Promise<SubmitResult> {
  const parsed = enquirySchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  // Lead storage is not connected yet. Without credentials nothing is sent
  // anywhere — we fail loudly rather than reporting a success that silently
  // drops a real enquiry. Populate .env.local to switch this on.
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn(
      "[submitEnquiry] No lead store configured — enquiry was validated but not saved.",
    );
    return {
      ok: false,
      message:
        "Our enquiry form is not live yet. Please email Info@Klixora.site and we will reply within 24 hours.",
    };
  }

  const { first_name, last_name, email, mobile, service, message } = parsed.data;

  // Maps onto the project's existing `leads` table, which already carries an
  // anon INSERT / admin-only SELECT policy. `status` defaults to 'new'.
  const { error } = await supabase.from("leads").insert({
    name: `${first_name} ${last_name}`,
    email,
    phone: mobile,
    service_interest: service,
    message: message || null,
    source: "website",
  });

  if (error) {
    // Logged server-side; the visitor never sees database internals.
    console.error("[submitEnquiry] insert failed:", error.message);
    return {
      ok: false,
      message: "We could not save your enquiry. Please try again in a moment.",
    };
  }

  return { ok: true };
}

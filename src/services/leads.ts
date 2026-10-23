"use server";

import { enquirySchema, type SubmitResult } from "@/utils/validation";
import { getSupabaseClient } from "@/services/supabase";

/**
 * Trust boundary: client-side step validation is UX only. Everything is
 * re-validated here before it reaches storage.
 *
 * Per the Next docs, expected errors are returned as values rather than
 * thrown, so `useActionState` can render them inline.
 */
export async function submitEnquiry(
  _prevState: SubmitResult,
  formData: FormData,
): Promise<SubmitResult> {
  const parsed = enquirySchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    service: formData.get("service"),
    message: formData.get("message") ?? "",
  });

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
  // anywhere. We fail loudly rather than reporting a success that silently
  // drops a real enquiry. Populate .env.local to switch this on.
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn(
      "[submitEnquiry] No lead store configured. Enquiry was validated but not saved.",
    );
    return {
      ok: false,
      message:
        "Our enquiry form is not live yet. Please email Info@Klixora.site and we will reply within 24 hours.",
    };
  }

  const { first_name, last_name, email, mobile, service, message } = parsed.data;

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

  return { ok: true, message: "" };
}

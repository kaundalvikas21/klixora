import { publicClient, requireAdminClient } from "@/server/supabase";
import { clientIp, rateLimit } from "@/server/rate-limit";
import { notifyNewLead, type LeadRow } from "@/server/notify";
import { fitScore } from "@/lib/fit-score";
import { leadSubmissionSchema, type LeadSubmitResult } from "@/lib/schemas/leads";
import { getHomeContent } from "@/server/content";

/**
 * The one place a public enquiry becomes a lead. Both entry points, the
 * Server Action behind the form and POST /api/leads, call this, so the
 * honeypot, the rate limit, the fit score and the notification cannot drift
 * apart between them.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export async function createLead(
  input: unknown,
  headers: Headers,
): Promise<LeadSubmitResult> {
  const parsed = leadSubmissionSchema.safeParse(input);

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

  const data = parsed.data;

  // Honeypot: a bot fills every field it finds, a person never sees this one.
  // Answer as if it worked, so the bot has nothing to tune against.
  if (data.honeypot) {
    console.warn("[leads] honeypot tripped, submission dropped.");
    return { ok: true, message: "" };
  }

  const limit = rateLimit(`lead:${clientIp(headers)}`, MAX_PER_WINDOW, WINDOW_MS);
  if (!limit.ok) {
    return {
      ok: false,
      message: `That is a lot of enquiries from one connection. Try again in ${Math.ceil(
        limit.retryAfterSeconds / 60,
      )} minutes, or email us directly.`,
    };
  }

  if (!publicClient()) {
    // Fail loudly rather than reporting a success that drops a real enquiry.
    console.error("[leads] Supabase is not configured, enquiry not stored.");
    return {
      ok: false,
      message:
        "Our enquiry form is not live yet. Please email Info@Klixora.site and we will reply within 24 hours.",
    };
  }

  const score = fitScore(data);

  try {
    // Service role for the insert: it writes the lead note and reads the row
    // back, neither of which the anon role may do. The anon INSERT policy
    // still stands as the backstop for anything posting straight at
    // PostgREST.
    const db = requireAdminClient();

    // The reference comes from the database, which is the only place it can
    // be minted without a race: this used to count rows and add one, so two
    // enquiries arriving together built the same reference and the second
    // lost to the unique index. See 0006_lead_ref.sql.
    const { data: ref, error: refError } = await db.rpc("next_lead_ref");

    if (refError || !ref) {
      console.error("[leads] reference failed:", refError?.message);
      return {
        ok: false,
        message: "We could not save your enquiry. Please try again in a moment.",
      };
    }

    const { data: lead, error } = await db
      .from("leads")
      .insert({
        ref,
        first_name: data.firstName,
        last_name: data.lastName,
        company: data.company || null,
        email: data.email,
        phone: data.phone || null,
        goal: data.goal,
        budget_band: data.budgetBand || null,
        message: data.message || null,
        source: data.source,
        utm: data.utm && Object.keys(data.utm).length ? data.utm : null,
        fit_score: score,
      })
      .select("*")
      .single();

    if (error || !lead) {
      console.error("[leads] insert failed:", error?.message);
      return {
        ok: false,
        message: "We could not save your enquiry. Please try again in a moment.",
      };
    }

    await db.from("lead_notes").insert({
      lead_id: lead.id,
      kind: "event",
      body: `Enquiry received from ${data.source}.`,
    });

    const { contact } = await getHomeContent();
    await notifyNewLead(lead as LeadRow, contact.notifyInbox);

    return { ok: true, message: contact.successMessage };
  } catch (error) {
    console.error("[leads] insert failed:", error);
    return {
      ok: false,
      message: "We could not save your enquiry. Please try again in a moment.",
    };
  }
}

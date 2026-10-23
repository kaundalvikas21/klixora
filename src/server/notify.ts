import type { Database } from "@/lib/database.types";

export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

/**
 * Lead notification email, sent through Resend's REST API so there is no SDK
 * to install. With no RESEND_API_KEY the lead is still stored and the
 * notification is logged instead of silently vanishing.
 */
export async function notifyNewLead(lead: LeadRow, inbox: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFY_FROM;
  const to = process.env.LEAD_NOTIFY_TO ?? inbox;

  if (!apiKey || !from || !to) {
    console.warn(
      `[notify] email not configured, lead ${lead.ref} stored without a notification.`,
    );
    return { sent: false };
  }

  const lines = [
    `Ref: ${lead.ref}`,
    `Name: ${lead.first_name} ${lead.last_name}`,
    lead.company ? `Company: ${lead.company}` : null,
    `Email: ${lead.email}`,
    lead.phone ? `Phone: ${lead.phone}` : null,
    `Goal: ${lead.goal}`,
    lead.budget_band ? `Budget: ${lead.budget_band}` : null,
    `Source: ${lead.source}`,
    `Fit score: ${lead.fit_score}/100`,
    lead.message ? `\n${lead.message}` : null,
  ].filter(Boolean);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New enquiry ${lead.ref}: ${lead.first_name} ${lead.last_name}`,
        text: lines.join("\n"),
      }),
    });

    if (!response.ok) {
      console.error("[notify] resend rejected the message:", await response.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    // A failed notification must never lose a stored lead.
    console.error("[notify] send failed:", error);
    return { sent: false };
  }
}

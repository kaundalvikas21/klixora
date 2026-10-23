"use server";

import { headers } from "next/headers";
import { createLead } from "@/server/leads";
import type { LeadSubmitResult } from "@/lib/schemas/leads";

/**
 * The public form's Server Action. A thin wrapper: everything that decides
 * whether a submission is accepted lives in server/leads.ts, which
 * POST /api/leads shares.
 *
 * Expected errors are returned as values rather than thrown, per the Next
 * docs, so `useActionState` can render them inline.
 */
export async function submitEnquiry(
  _prev: LeadSubmitResult,
  formData: FormData,
): Promise<LeadSubmitResult> {
  const utmEntries = Object.fromEntries(
    [...formData.entries()]
      .filter(([key]) => key.startsWith("utm_"))
      .map(([key, value]) => [key, String(value)]),
  );

  return createLead(
    {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      company: formData.get("company") ?? "",
      email: formData.get("email"),
      phone: formData.get("phone") ?? "",
      goal: formData.get("goal"),
      budgetBand: formData.get("budgetBand") ?? "",
      message: formData.get("message") ?? "",
      source: formData.get("source") ?? "Scrolled to the form",
      utm: utmEntries,
      honeypot: formData.get("company_website") ?? "",
    },
    await headers(),
  );
}

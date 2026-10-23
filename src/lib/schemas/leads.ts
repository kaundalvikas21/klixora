import { z } from "zod";
import { optionalText, text } from "@/lib/schemas/primitives";

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "WON",
  "LOST",
] as const;

export type LeadStatusName = (typeof LEAD_STATUSES)[number];

/** Ordered low to high. The fit score reads the index, so order matters. */
export const BUDGET_BANDS = [
  "Under ₹25k / month",
  "₹25k - ₹50k / month",
  "₹50k - ₹1L / month",
  "₹1L - ₹3L / month",
  "₹3L+ / month",
  "Not sure yet",
] as const;

/**
 * Public submission. Field names match the public form inputs, which is also
 * what /api/leads receives.
 */
export const leadSubmissionSchema = z.object({
  firstName: text(80, "First name"),
  lastName: text(80, "Last name"),
  company: optionalText(120),
  email: z.email("That email address does not look right.").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a phone number between 7 and 20 digits.")
    .optional()
    .or(z.literal(""))
    .transform((v) => v ?? ""),
  goal: text(200, "Goal"),
  budgetBand: optionalText(60),
  message: optionalText(2000),
  /** Which block the visitor submitted from, e.g. "Hero - Enquire Now". */
  source: text(120, "Source"),
  utm: z.record(z.string().max(40), z.string().max(200)).optional(),
  /** Hidden field. A filled value means a bot, and the request is dropped. */
  honeypot: z.string().max(0).optional().or(z.literal("")),
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

export const leadStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(LEAD_STATUSES),
});

export const leadNoteSchema = z.object({
  leadId: z.string().min(1),
  body: text(2000, "Note"),
});

export const leadBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one lead."),
  action: z.enum(["contacted", "assign", "lost"]),
  assignedToId: z.string().optional(),
});

/** Shape the public form posts and the API answers with. */
export type LeadSubmitResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

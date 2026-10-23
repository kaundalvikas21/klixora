import { z } from "zod";
import { serviceOptions } from "@/content/site";

/** Both patterns are carried over verbatim from the reference form. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_RE = /^[0-9+\-\s]{7,15}$/;

export const enquirySchema = z.object({
  first_name: z.string().trim().min(1, "Please tell us your first name.").max(80),
  last_name: z.string().trim().min(1, "Please tell us your last name.").max(80),
  email: z
    .string()
    .trim()
    .max(160)
    .regex(EMAIL_RE, "That email address does not look right."),
  mobile: z
    .string()
    .trim()
    .regex(MOBILE_RE, "Enter a phone number between 7 and 15 digits."),
  service: z.enum(serviceOptions, {
    message: "Pick the service you are interested in.",
  }),
  message: z.string().trim().max(2000).optional().default(""),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;

/** Which fields belong to which step, so "Next" can validate just that step. */
export const STEP_FIELDS = [
  ["first_name", "last_name"],
  ["email", "mobile"],
  ["service"],
  ["message"],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof EnquiryInput>>;

/**
 * Shape returned by the enquiry action. Declared here rather than in
 * services/leads.ts because a "use server" module may only export async
 * functions, and exporting this object from there crashes the module at
 * runtime with "can only export async functions, found object".
 */
export type SubmitResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export const initialSubmitState: SubmitResult = { ok: false, message: "" };

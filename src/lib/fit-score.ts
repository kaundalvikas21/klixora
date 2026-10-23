import { BUDGET_BANDS } from "@/lib/schemas/leads";

/**
 * How well a submission fits what Klixora sells, 0-100. Computed server-side
 * on insert so the number is stable and cannot be posted by a client.
 *
 * Kept as one pure function so the weights can be tuned in one place, and
 * verified by src/lib/self-check.ts.
 */
export type FitScoreInput = {
  budgetBand?: string | null;
  goal?: string | null;
  company?: string | null;
  message?: string | null;
};

/** Services with the clearest retainer attached get the higher goal weight. */
const HIGH_INTENT_GOALS = [
  "paid ads",
  "performance",
  "seo",
  "e-commerce",
  "ecommerce",
  "marketplace",
  "retainer",
];

const MEDIUM_INTENT_GOALS = ["social", "email", "whatsapp", "website", "audit", "strategy"];

export function fitScore(input: FitScoreInput): number {
  let score = 0;

  // Budget: 0-45. "Not sure yet" is not a no, so it still scores something.
  const bandIndex = BUDGET_BANDS.indexOf(
    (input.budgetBand ?? "") as (typeof BUDGET_BANDS)[number],
  );
  if (bandIndex === BUDGET_BANDS.length - 1) {
    score += 10; // "Not sure yet"
  } else if (bandIndex >= 0) {
    const steps = BUDGET_BANDS.length - 2; // exclude "Not sure yet"
    score += Math.round(15 + (bandIndex / steps) * 30);
  }

  // Goal: 0-30.
  const goal = (input.goal ?? "").toLowerCase();
  if (HIGH_INTENT_GOALS.some((g) => goal.includes(g))) score += 30;
  else if (MEDIUM_INTENT_GOALS.some((g) => goal.includes(g))) score += 18;
  else if (goal.length > 0) score += 8;

  // A company name: 15. Named businesses convert far better than bare names.
  if ((input.company ?? "").trim().length > 1) score += 15;

  // Effort in the message: 0-10. Someone who wrote three sentences is warmer
  // than someone who wrote nothing.
  const messageLength = (input.message ?? "").trim().length;
  if (messageLength >= 180) score += 10;
  else if (messageLength >= 60) score += 6;
  else if (messageLength > 0) score += 3;

  return Math.max(0, Math.min(100, score));
}

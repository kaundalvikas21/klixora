/**
 * One runnable check for the pure logic the admin leans on: the fit score,
 * the SEO score, the reply window and the heading parser. No framework, no
 * fixtures.
 *
 *   npm run check:logic
 */
import assert from "node:assert/strict";
import { fitScore } from "@/lib/fit-score";
import { effectiveOgImage, seoChecks, seoScore } from "@/lib/seo-score";
import { slaState } from "@/lib/sla";
import { plainText, splitGradient } from "@/lib/rich-text";
import { BUDGET_BANDS, LEAD_STATUSES } from "@/lib/schemas/leads";
import { kpiTone, scoreTone, LEAD_TONE, STATUS } from "@/lib/status";

// --- fit score -------------------------------------------------------------

assert.equal(fitScore({}), 0, "an empty submission scores nothing");

const biggest = fitScore({
  budgetBand: BUDGET_BANDS[4],
  goal: "Paid Ads (Meta & Google)",
  company: "Acme Pvt Ltd",
  message: "x".repeat(200),
});
assert.equal(biggest, 100, "the strongest possible submission scores 100");

const smallest = fitScore({ budgetBand: BUDGET_BANDS[0], goal: "something else" });
assert.ok(smallest > 0 && smallest < 40, `a weak lead lands low, got ${smallest}`);

assert.ok(
  fitScore({ budgetBand: BUDGET_BANDS[3], goal: "SEO" }) >
    fitScore({ budgetBand: BUDGET_BANDS[1], goal: "SEO" }),
  "a bigger budget outscores a smaller one, all else equal",
);

assert.ok(
  fitScore({ goal: "SEO", company: "Acme" }) > fitScore({ goal: "SEO" }),
  "naming a company helps",
);

assert.ok(fitScore({ budgetBand: "Not sure yet" }) > 0, "'not sure yet' is not a no");
assert.ok(fitScore({ budgetBand: "nonsense band" }) === 0, "an unknown band scores nothing");

// --- seo score -------------------------------------------------------------

// Every page falls back to a generated share card, so the OG check is
// always satisfied: an empty page keeps those 20 points and loses the rest.
assert.equal(seoScore({}), 20, "an empty page keeps only the generated card");
assert.equal(
  seoScore({
    metaTitle: "x".repeat(50),
    metaDescription: "x".repeat(150),
    ogImageUrl: "/og.png",
    canonicalUrl: "https://klixora.site/",
    schemaType: "LocalBusiness",
  }),
  100,
  "a fully filled page scores 100",
);
assert.equal(
  seoScore({ metaTitle: "x".repeat(61), metaDescription: "x".repeat(150) }),
  50,
  "an over-long title loses its 30 points and keeps the description and card",
);

// The share card: uploaded art wins, otherwise the generated endpoint.
assert.deepEqual(effectiveOgImage("home", "/custom.png"), {
  url: "/custom.png",
  generated: false,
});
assert.deepEqual(effectiveOgImage("home", ""), {
  url: "/api/og?slug=home",
  generated: true,
});
assert.deepEqual(effectiveOgImage("home", null), {
  url: "/api/og?slug=home",
  generated: true,
});
assert.equal(
  effectiveOgImage("a b", "").url,
  "/api/og?slug=a%20b",
  "the slug is encoded, so it cannot break the query string",
);
assert.equal(
  seoChecks({}).reduce((t, c) => t + c.points, 0),
  100,
  "the check weights add up to 100",
);
assert.ok(
  seoChecks({}).every((c) => c.detail.length > 20),
  "every check explains what it means, passing or not",
);

// --- reply window ----------------------------------------------------------

const now = new Date("2026-10-23T12:00:00Z");
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000);

assert.equal(slaState(hoursAgo(1), 24, "NEW", now).tone, "ok");
assert.equal(slaState(hoursAgo(20), 24, "NEW", now).tone, "soon", "under 6h left is amber");
assert.equal(slaState(hoursAgo(30), 24, "NEW", now).tone, "overdue");
assert.equal(slaState(hoursAgo(30), 24, "NEW", now).label, "Overdue 6h");
assert.equal(
  slaState(hoursAgo(99), 24, "CONTACTED", now).tone,
  "done",
  "the window only applies while a lead is still NEW",
);
assert.equal(
  slaState(hoursAgo(5), 4, "NEW", now).tone,
  "overdue",
  "the window follows the SLA number, not a hardcoded 24h",
);

// The lead reference is minted by public.next_lead_ref() in the database, so
// that its counter and the insert cannot race. There is nothing left to
// assert here: a copy of the format in TypeScript would be the drift this
// moved away from.

// --- heading parser --------------------------------------------------------

assert.deepEqual(splitGradient("GROWTH *DRIVEN*"), [
  { text: "GROWTH ", gradient: false },
  { text: "DRIVEN", gradient: true },
]);
assert.deepEqual(splitGradient("FOR BOLD BRANDS"), [
  { text: "FOR BOLD BRANDS", gradient: false },
]);
assert.equal(plainText("GROWTH *DRIVEN*"), "GROWTH DRIVEN");

// --- status palette ---------------------------------------------------------

assert.equal(kpiTone("seo-health", 80), "good", "80 is the good boundary");
assert.equal(kpiTone("seo-health", 79), "warning");
assert.equal(kpiTone("seo-health", 50), "warning", "50 is the warning boundary");
assert.equal(kpiTone("seo-health", 49), "critical");

assert.equal(kpiTone("replied-in-time", 100), "good");
assert.equal(kpiTone("replied-in-time", 69), "critical");

// A bare count has no good or bad direction; its tone follows the trend.
assert.equal(kpiTone("new-leads", 13, null), "neutral");
assert.equal(kpiTone("new-leads", 13, 0), "neutral");
assert.equal(kpiTone("new-leads", 13, 20), "good");
assert.equal(kpiTone("new-leads", 13, -20), "warning");

assert.equal(
  scoreTone(62),
  kpiTone("seo-health", 62),
  "the score ring and the SEO tile grade on one scale",
);

// Every pipeline state has a tone, so a new status cannot render uncoloured.
for (const status of LEAD_STATUSES) {
  assert.ok(LEAD_TONE[status], `lead status ${status} has no tone`);
}

// Colour never travels alone: every tone carries an icon and a label.
for (const [name, tone] of Object.entries(STATUS)) {
  assert.ok(tone.icon, `status ${name} has no icon`);
  assert.ok(tone.label.length > 2, `status ${name} has no label`);
  assert.match(tone.hex, /^#[0-9a-f]{6}$/i, `status ${name} needs a hex for SVG`);
}

console.log("self-check: all assertions passed");

import { DESCRIPTION_RANGE, TITLE_RANGE } from "@/lib/schemas/seo";

/**
 * The share card a page will actually use.
 *
 * An uploaded image wins; otherwise the generated card at /api/og stands in.
 * Every page therefore always has one, which is the point: a page that
 * shares as a bare grey link measurably loses clicks, and "remember to
 * upload an image" is not a system.
 */
export function effectiveOgImage(
  pageSlug: string,
  ogImageUrl?: string | null,
): { url: string; generated: boolean } {
  const explicit = (ogImageUrl ?? "").trim();
  if (explicit) return { url: explicit, generated: false };
  return { url: `/api/og?slug=${encodeURIComponent(pageSlug)}`, generated: true };
}

/**
 * Per-page SEO score out of 100. One function so the ring in the table, the
 * meter in the editor and the Overview tile can never disagree.
 *
 * title in range 30 · description in range 30 · OG image 20 · canonical 10 ·
 * schema type 10.
 */
export type SeoScoreInput = {
  pageSlug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  schemaType?: string | null;
};

export type SeoCheck = {
  id: string;
  label: string;
  /** What is wrong and why it matters. Not a bare pass/fail. */
  detail: string;
  passed: boolean;
  points: number;
};

const inRange = (value: string, range: { min: number; max: number }) =>
  value.length >= range.min && value.length <= range.max;

export function seoChecks(input: SeoScoreInput): SeoCheck[] {
  const title = (input.metaTitle ?? "").trim();
  const description = (input.metaDescription ?? "").trim();
  const ogImage = (input.ogImageUrl ?? "").trim();
  const canonical = (input.canonicalUrl ?? "").trim();
  const schemaType = (input.schemaType ?? "").trim();

  return [
    {
      id: "title",
      label: `Meta title is ${TITLE_RANGE.min}-${TITLE_RANGE.max} characters`,
      detail:
        title.length === 0
          ? "There is no title, so Google writes one from the page copy and you lose control of the first line a searcher reads."
          : title.length < TITLE_RANGE.min
            ? `${title.length} characters leaves room Google will not use. Add the service and the place you serve.`
            : title.length > TITLE_RANGE.max
              ? `${title.length} characters gets truncated in results, so the end of the line never gets read.`
              : `${title.length} characters, which fits a desktop result without truncation.`,
      passed: inRange(title, TITLE_RANGE),
      points: 30,
    },
    {
      id: "description",
      label: `Meta description is ${DESCRIPTION_RANGE.min}-${DESCRIPTION_RANGE.max} characters`,
      detail:
        description.length === 0
          ? "With no description Google pulls a sentence from the page, which is rarely the sentence that sells the click."
          : description.length < DESCRIPTION_RANGE.min
            ? `${description.length} characters wastes space you are being given for free.`
            : description.length > DESCRIPTION_RANGE.max
              ? `${description.length} characters is cut off mid-sentence on most results pages.`
              : `${description.length} characters, which renders in full on desktop and mobile.`,
      passed: inRange(description, DESCRIPTION_RANGE),
      points: 30,
    },
    {
      id: "og-image",
      label: "Open Graph image is set",
      detail: ogImage
        ? "A custom image is set, so shared links use your own art."
        : "Falling back to the card generated from this page's title and description. Shared links render properly; upload an image here to use your own art instead.",
      // The generated card is a real image, so this is genuinely satisfied.
      // Marking it failed would train the operator to ignore the checklist.
      passed: true,
      points: 20,
    },
    {
      id: "canonical",
      label: "Canonical URL is set",
      detail: canonical
        ? "Duplicate paths consolidate onto one URL."
        : "Without a canonical, query strings and trailing-slash variants compete as separate pages and split their own ranking.",
      passed: canonical.length > 0,
      points: 10,
    },
    {
      id: "schema",
      label: "Structured data type is chosen",
      detail: schemaType
        ? `Emitting ${schemaType} JSON-LD, built from Site Settings and the working hours table.`
        : "No JSON-LD is emitted, so your address, phone and hours never reach a rich result or a map listing.",
      passed: schemaType.length > 0,
      points: 10,
    },
  ];
}

export function seoScore(input: SeoScoreInput): number {
  return seoChecks(input).reduce((total, c) => total + (c.passed ? c.points : 0), 0);
}

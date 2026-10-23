import { z } from "zod";
import { optionalText, text } from "@/lib/schemas/primitives";

export const ROBOTS_OPTIONS = [
  "index, follow",
  "index, nofollow",
  "noindex, follow",
  "noindex, nofollow",
] as const;

export const SCHEMA_TYPES = [
  "Organization",
  "Service",
  "LocalBusiness",
  "WebPage",
  "FAQPage",
] as const;

export const TWITTER_CARDS = ["summary", "summary_large_image"] as const;

export const seoMetaSchema = z.object({
  pageSlug: text(60, "Page slug"),
  path: text(200, "Path"),
  metaTitle: text(120, "Meta title"),
  metaDescription: text(320, "Meta description"),
  canonicalUrl: optionalText(512),
  robots: z.enum(ROBOTS_OPTIONS),
  ogTitle: optionalText(160),
  ogDescription: optionalText(320),
  ogImageUrl: optionalText(512),
  twitterCard: z.enum(TWITTER_CARDS),
  focusKeywords: z.array(z.string().trim().min(1).max(60)).max(12),
  schemaType: z.union([z.enum(SCHEMA_TYPES), z.literal("")]).optional().transform((v) => v ?? ""),
});

export const seoDefaultsSchema = z.object({
  titleTemplate: text(80, "Title template").refine(
    (v) => v.includes("%s"),
    "The template needs a %s placeholder for the page title.",
  ),
  defaultOgImage: optionalText(512),
  twitterHandle: optionalText(40),
  sitemapUrl: optionalText(512),
});

export type SeoMetaInput = z.infer<typeof seoMetaSchema>;
export type SeoDefaultsInput = z.infer<typeof seoDefaultsSchema>;

/**
 * Ideal lengths. These drive the editor meters and the "in range" terms of
 * the score, so a passing meter and a passing score can never disagree.
 */
export const TITLE_RANGE = { min: 45, max: 60 } as const;
export const DESCRIPTION_RANGE = { min: 140, max: 160 } as const;

import type { Metadata } from "next";
import { site } from "@/content/site";
import { getSeoDefaults, getSeoMeta, getSiteSettings } from "@/server/content";
import { effectiveOgImage } from "@/lib/seo-score";

/**
 * Builds a route's Metadata from its SeoMeta row, falling back to
 * SeoDefaults and then to Site Settings. Every public route's
 * `generateMetadata` is one call to this, so no route can drift off the
 * values the admin's SEO screen shows.
 */
export async function metadataFor(pageSlug: string): Promise<Metadata> {
  const [seo, defaults, settings] = await Promise.all([
    getSeoMeta(pageSlug),
    getSeoDefaults(),
    getSiteSettings(),
  ]);

  const title = seo?.metaTitle || settings.brandName;
  const description = seo?.metaDescription || settings.tagline;
  // Uploaded art, then the site-wide default, then the card generated from
  // this page's own row. There is always an image.
  const ogImage = new URL(
    effectiveOgImage(pageSlug, seo?.ogImageUrl || defaults.defaultOgImage).url,
    site.url,
  ).toString();
  const [robotsIndex, robotsFollow] = (seo?.robots ?? "index, follow")
    .split(",")
    .map((part) => part.trim());

  return {
    // Absolute: a SeoMeta row holds the complete title, which is also what
    // the admin's Google preview shows. Running it through SeoDefaults'
    // template as well would append the brand a second time. The template
    // still applies to routes with no SeoMeta row, such as the admin screens.
    title: { absolute: title },
    description,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: {
      index: robotsIndex !== "noindex",
      follow: robotsFollow !== "nofollow",
    },
    openGraph: {
      type: "website",
      siteName: settings.brandName,
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: seo?.canonicalUrl || site.url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: (seo?.twitterCard ?? "summary_large_image") as "summary" | "summary_large_image",
      site: defaults.twitterHandle || undefined,
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: [ogImage],
    },
    keywords: seo?.focusKeywords?.length ? seo.focusKeywords : undefined,
  };
}

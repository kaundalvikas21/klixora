import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getAllSeoMeta } from "@/server/content";

/**
 * Built from the SeoMeta table, so adding a page in the admin puts it in the
 * sitemap. Anchor-only entries (/#services) are left out: they are not
 * separate URLs, and listing them would ask crawlers to index the home page
 * three times.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllSeoMeta();

  return pages
    .filter((page) => !page.path.includes("#") && !page.robots.startsWith("noindex"))
    .map((page) => ({
      url: page.canonicalUrl || `${site.url}${page.path === "/" ? "" : page.path}`,
      // The row's own updatedAt, not the build time: a lastmod that is always
      // "now" tells a crawler nothing.
      lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: page.path === "/" ? 1 : 0.8,
    }));
}

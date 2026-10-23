import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getSeoDefaults } from "@/server/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const defaults = await getSeoDefaults();

  // A staging or preview deploy is a copy of the live site on a different
  // hostname. Indexed, it competes with the real one and gives a client a URL
  // they should never have. netlify.toml sets this on every context except
  // production.
  if (process.env.NEXT_PUBLIC_ROBOTS === "noindex") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    // The admin is behind a login; keeping it out of the index as well means
    // the login page never shows up in a search result.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: defaults.sitemapUrl || `${site.url}/sitemap.xml`,
  };
}

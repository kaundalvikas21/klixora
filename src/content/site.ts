/**
 * Deployment-level constants only.
 *
 * Everything an operator can edit (brand name, logo, address, email, phone,
 * hours, meta copy) lives in the database now and is read through
 * server/content.ts. The seed copy of those values is in content/defaults.ts.
 * Nothing here is allowed to duplicate a CMS field.
 */
export const site = {
  /** Canonical origin, used for metadataBase, robots.txt and the sitemap. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://klixora.site",
} as const;

/**
 * The header and footer navigation.
 *
 * Section links are ABSOLUTE (`/#services`), not bare hashes. A bare hash
 * resolves against whatever route you are on, so from /agri-marketing
 * "Results" pointed at an anchor that does not exist there, and "Services",
 * "Why Us", "Process" and "Contact" silently scrolled to that page's own
 * sections instead of the ones the labels name. An absolute href always
 * lands on the home page's section, which is what the label promises.
 *
 * `section` is the id the link targets on the home page, and it is what the
 * header matches against the scroll spy. A link without one is a route.
 */
export const navLinks = [
  { label: "Services", href: "/#services", section: "services" },
  { label: "Results", href: "/#results", section: "results" },
  { label: "Why Us", href: "/#why-us", section: "why-us" },
  { label: "Process", href: "/#process", section: "process" },
  { label: "Contact", href: "/#contact", section: "contact" },
  { label: "Agri Marketing", href: "/agri-marketing" },
  { label: "Events", href: "/event-management" },
] as const satisfies readonly {
  label: string;
  href: string;
  section?: string;
}[];

export const brands = [
  { name: "GuruDrone", slug: "gurudrone", src: "/brands/gurudrone.png", h: 52 },
  { name: "Relaxing Bliss", slug: "relaxing", src: "/brands/relaxing.png", h: 56 },
  { name: "Elixure", slug: "elixure", src: "/brands/elixure.png", h: 56 },
  { name: "Deccan Clean", slug: "deccanclean", src: "/brands/deccanclean.png", h: 50 },
  { name: "Nath Ayurveda", slug: "nathayurveda", src: "/brands/nathayurveda.png", h: 42 },
  { name: "Invincible Security Group", slug: "isg", src: "/brands/isg.png", h: 56 },
  { name: "Learn Tribe", slug: "learntribe", src: "/brands/learntribe.png", h: 64 },
  // Already light-on-transparent, so it keeps its own colour instead of being inverted.
  { name: "Goose Bumpz Spa", slug: "goosebumpz", src: "/brands/goosebumpz.png", h: 56, soft: true },
  { name: "Prospira Finzeal", slug: "prospira", src: "/brands/prospira.png", h: 50 },
] as const;

/**
 * ponytail: these point at the policies published on the current WordPress
 * site, because /privacy and /terms were 404s here. Move them to local
 * routes once the legal copy is migrated, which is a content decision, not
 * a code one.
 */
export const legalLinks = [
  { label: "Privacy Policy", href: "https://klixora.site/privacy-policy-2/" },
  { label: "Terms of Service", href: "https://klixora.site/terms-of-use/" },
] as const;

/**
 * Section ids the header's scroll spy watches, derived from navLinks so the
 * two can never fall out of step.
 */
export const sectionIds = navLinks
  .filter((link) => "section" in link && link.section)
  .map((link) => (link as { section: string }).section);

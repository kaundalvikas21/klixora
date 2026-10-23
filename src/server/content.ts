import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/server/supabase";
import {
  contactSectionSchema,
  heroSectionSchema,
  servicesSectionSchema,
  type ContactSection,
  type FormFieldDef,
  type HeroSection,
  type ServicesSection,
} from "@/lib/schemas/content";
import { agriContent, eventsContent } from "@/content/pages";
import {
  defaultContactPromises,
  defaultContactSection,
  defaultFormSteps,
  defaultHero,
  defaultHeroCtas,
  defaultSeoDefaults,
  defaultSeoMeta,
  defaultServices,
  defaultServicesSection,
  defaultSiteSettings,
  defaultSocialLinks,
  defaultWorkingHours,
} from "@/content/defaults";

/**
 * Every public read of admin-managed content.
 *
 * All of it runs through the anon key, so Postgres row level security is
 * what decides visibility, not a `where` clause this file could forget. All
 * of it is cached under the `site-content` tag, which is what the admin's
 * publish invalidates, so a publish reaches the live site within one
 * revalidation and without a redeploy.
 *
 * Reads fall back to src/content/defaults.ts when Supabase is unreachable.
 * The marketing site is not allowed to go blank because the admin's database
 * is down.
 */
export const SITE_CONTENT_TAG = "site-content";

export type HeroCtaView = {
  id: string;
  label: string;
  href: string;
  variant: "PRIMARY" | "OUTLINE" | "TEXT";
  openNewTab: boolean;
};

export type ServiceView = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  icon: string;
  href: string | null;
};

export type FormStepView = {
  id: string;
  stepNumber: number;
  question: string;
  fields: FormFieldDef[];
};

export type HomeContent = {
  hero: HeroSection & { ctas: HeroCtaView[] };
  services: ServicesSection & { items: ServiceView[] };
  contact: ContactSection & { promises: string[]; steps: FormStepView[] };
};

export type SiteSettingsView = typeof defaultSiteSettings & { id: string | null };

export type WorkingHourView = {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};

export type SocialLinkView = { id: string; platform: string; url: string };

/**
 * A published payload is unvalidated JSON. Parsing it with the same schema
 * the admin writes through means a hand-edited or half-migrated row degrades
 * to the default copy rather than rendering `undefined` on the live site.
 */
function parseSection<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: unknown } },
  value: unknown,
  fallback: T,
): T {
  if (!value) return fallback;
  const result = schema.safeParse(value);
  return result.success ? (result.data as T) : fallback;
}

const fallbackHome = (): HomeContent => ({
  hero: {
    ...defaultHero,
    ctas: defaultHeroCtas.map((cta, i) => ({
      id: `default-cta-${i}`,
      label: cta.label,
      href: cta.href,
      variant: cta.variant,
      openNewTab: cta.openNewTab,
    })),
  },
  services: {
    ...defaultServicesSection,
    items: defaultServices.map((service, i) => ({
      id: `default-service-${i}`,
      kicker: service.kicker,
      title: service.title,
      description: service.description,
      icon: service.icon,
      href: null,
    })),
  },
  contact: {
    ...defaultContactSection,
    promises: [...defaultContactPromises],
    steps: defaultFormSteps.map((step, i) => ({
      id: `default-step-${i}`,
      stepNumber: step.stepNumber,
      question: step.question,
      fields: step.fields,
    })),
  },
});

export async function getHomeContent(): Promise<HomeContent> {
  "use cache";
  cacheTag(SITE_CONTENT_TAG);

  const db = publicClient();
  if (!db) return fallbackHome();

  try {
    // published_sections is a view over page_sections that exposes only what
    // has been published. The anon role has no policy on the base table, so a
    // draft cannot leak through this key even by accident.
    const [sections, ctas, services, promises, steps] = await Promise.all([
      db.from("published_sections").select("section_key, published").eq("page_slug", "home"),
      db.from("hero_ctas").select("id, label, href, variant, open_new_tab").order("sort_order"),
      db
        .from("services")
        .select("id, kicker, title, description, icon, href")
        .order("sort_order"),
      db.from("contact_promises").select("body").order("sort_order"),
      db.from("form_steps").select("id, step_number, question, fields").order("step_number"),
    ]);

    const fallback = fallbackHome();
    const published = (key: string) =>
      sections.data?.find((row) => row.section_key === key)?.published ?? null;

    return {
      hero: {
        ...parseSection(heroSectionSchema, published("hero"), defaultHero),
        ctas: ctas.data?.length
          ? ctas.data.map((cta) => ({
              id: cta.id,
              label: cta.label,
              href: cta.href,
              variant: cta.variant,
              openNewTab: cta.open_new_tab,
            }))
          : fallback.hero.ctas,
      },
      services: {
        ...parseSection(servicesSectionSchema, published("services"), defaultServicesSection),
        items: (services.data ?? []).map((service) => ({
          id: service.id,
          kicker: service.kicker,
          title: service.title,
          description: service.description,
          icon: service.icon,
          href: service.href,
        })),
      },
      contact: {
        ...parseSection(contactSectionSchema, published("contact"), defaultContactSection),
        promises: promises.data?.length
          ? promises.data.map((row) => row.body)
          : fallback.contact.promises,
        steps: steps.data?.length
          ? steps.data.map((step) => ({
              id: step.id,
              stepNumber: step.step_number,
              question: step.question,
              fields: (step.fields ?? []) as FormFieldDef[],
            }))
          : fallback.contact.steps,
      },
    };
  } catch (error) {
    console.error("[content] home read failed, serving default copy:", error);
    return fallbackHome();
  }
}

export async function getSiteSettings(): Promise<SiteSettingsView> {
  "use cache";
  cacheTag(SITE_CONTENT_TAG);

  const fallback: SiteSettingsView = { ...defaultSiteSettings, id: null };
  const db = publicClient();
  if (!db) return fallback;

  try {
    const { data } = await db.from("site_settings").select("*").limit(1).maybeSingle();
    if (!data) return fallback;

    return {
      id: data.id,
      brandName: data.brand_name,
      tagline: data.tagline,
      domain: data.domain,
      logoUrl: data.logo_url ?? defaultSiteSettings.logoUrl,
      logoAlt: data.logo_alt,
      logoHeight: data.logo_height,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2,
      mapUrl: data.map_url ?? "",
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      hoursLabel: data.hours_label,
      gstin: data.gstin ?? "",
    };
  } catch (error) {
    console.error("[content] settings read failed, serving defaults:", error);
    return fallback;
  }
}

export async function getWorkingHours(): Promise<WorkingHourView[]> {
  "use cache";
  cacheTag(SITE_CONTENT_TAG);

  const db = publicClient();
  if (!db) return defaultWorkingHours;

  try {
    const { data } = await db
      .from("working_hours")
      .select("day_of_week, opens_at, closes_at, is_closed")
      .order("day_of_week");

    return data?.length
      ? data.map((row) => ({
          dayOfWeek: row.day_of_week,
          opensAt: row.opens_at,
          closesAt: row.closes_at,
          isClosed: row.is_closed,
        }))
      : defaultWorkingHours;
  } catch (error) {
    console.error("[content] hours read failed, serving defaults:", error);
    return defaultWorkingHours;
  }
}

export async function getSocialLinks(): Promise<SocialLinkView[]> {
  "use cache";
  cacheTag(SITE_CONTENT_TAG);

  const fallback = defaultSocialLinks.map((s, i) => ({
    id: `default-social-${i}`,
    platform: s.platform,
    url: s.url,
  }));

  const db = publicClient();
  if (!db) return fallback;

  try {
    // The anon policy already filters to the visible ones.
    const { data } = await db
      .from("social_links")
      .select("id, platform, url")
      .order("sort_order");

    return data?.length
      ? data.map((row) => ({ id: row.id, platform: row.platform, url: row.url }))
      : fallback;
  } catch (error) {
    console.error("[content] socials read failed, serving defaults:", error);
    return fallback;
  }
}

/**
 * The current year, for the footer's copyright line.
 *
 * Cache Components rejects a bare `new Date()` during prerender, because the
 * value would be frozen into the static shell. Reading it inside a cached
 * function with a daily life makes the staleness explicit and bounded.
 */
export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export type SeoMetaView = (typeof defaultSeoMeta)[number] & {
  /** ISO string rather than a Date, so it survives the cache boundary. */
  updatedAt?: string;
};
export type SeoDefaultsView = typeof defaultSeoDefaults;

export async function getSeoDefaults(): Promise<SeoDefaultsView> {
  "use cache";
  cacheTag(SITE_CONTENT_TAG);

  const db = publicClient();
  if (!db) return defaultSeoDefaults;

  try {
    const { data } = await db.from("seo_defaults").select("*").limit(1).maybeSingle();
    if (!data) return defaultSeoDefaults;

    return {
      titleTemplate: data.title_template,
      defaultOgImage: data.default_og_image ?? "",
      twitterHandle: data.twitter_handle ?? "",
      sitemapUrl: data.sitemap_url ?? "",
    };
  } catch (error) {
    console.error("[content] seo defaults read failed, serving defaults:", error);
    return defaultSeoDefaults;
  }
}

/** Shared mapper: the SEO row shape is read in three places. */
function toSeoView(row: {
  page_slug: string;
  path: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string | null;
  robots: string;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  twitter_card: string;
  focus_keywords: string[];
  schema_type: string | null;
  updated_at: string;
}): SeoMetaView {
  return {
    pageSlug: row.page_slug,
    path: row.path,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    canonicalUrl: row.canonical_url ?? "",
    robots: row.robots,
    ogTitle: row.og_title ?? "",
    ogDescription: row.og_description ?? "",
    ogImageUrl: row.og_image_url ?? "",
    twitterCard: row.twitter_card,
    focusKeywords: row.focus_keywords,
    schemaType: row.schema_type ?? "",
    updatedAt: row.updated_at,
  };
}

export async function getSeoMeta(pageSlug: string): Promise<SeoMetaView | null> {
  "use cache";
  cacheTag(SITE_CONTENT_TAG);

  const fallback = defaultSeoMeta.find((m) => m.pageSlug === pageSlug) ?? null;
  const db = publicClient();
  if (!db) return fallback;

  try {
    const { data } = await db
      .from("seo_meta")
      .select("*")
      .eq("page_slug", pageSlug)
      .maybeSingle();

    return data ? toSeoView(data) : fallback;
  } catch (error) {
    console.error("[content] seo read failed, serving defaults:", error);
    return fallback;
  }
}

/**
 * The hero image a page leads with, which is what its share card is built
 * on. The home page's comes from the CMS; the two vertical pages carry
 * their own in content/pages.ts. The anchor slugs are sections of the home
 * page, so they share its image.
 *
 * One resolver, so the card can never show a different picture from the
 * page it is advertising.
 */
export async function getPageHeroImage(pageSlug: string): Promise<string | null> {
  "use cache";
  cacheTag(SITE_CONTENT_TAG);

  if (pageSlug === "agri-marketing") return agriContent.heroImg;
  if (pageSlug === "event-management") return eventsContent.heroImg;

  const home = await getHomeContent();
  return home.hero.backgroundImageUrl || null;
}

/** Every slug the SEO screen manages, whether or not it is a real route. */
export async function getAllSeoMeta(): Promise<SeoMetaView[]> {
  "use cache";
  cacheTag(SITE_CONTENT_TAG);

  const db = publicClient();
  if (!db) return defaultSeoMeta;

  try {
    const { data } = await db.from("seo_meta").select("*").order("page_slug");
    return data?.length ? data.map(toSeoView) : defaultSeoMeta;
  } catch (error) {
    console.error("[content] seo list read failed, serving defaults:", error);
    return defaultSeoMeta;
  }
}

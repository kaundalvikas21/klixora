import { userClient, type Db } from "@/server/supabase";
import {
  contactSectionSchema,
  heroSectionSchema,
  servicesSectionSchema,
  type ContactSection,
  type FormFieldDef,
  type HeroSection,
  type ServicesSection,
} from "@/lib/schemas/content";
import {
  defaultContactSection,
  defaultHero,
  defaultSeoDefaults,
  defaultServicesSection,
  defaultSiteSettings,
  defaultWorkingHours,
} from "@/content/defaults";
import { seoScore } from "@/lib/seo-score";
import { isOverdue, slaState } from "@/lib/sla";
import type { LeadStatusName } from "@/lib/schemas/leads";

/**
 * Admin reads.
 *
 * Deliberately uncached: the admin edits drafts and expects to see exactly
 * what is in the table, including rows the public site filters out. The
 * cached, published view lives in server/content.ts.
 *
 * Every query goes through the operator's own session, so the row level
 * security policies are what grant access. If is_admin() is false these all
 * come back empty rather than throwing, which is the correct failure mode for
 * a screen that is already behind requireAdminPage().
 */
export type AdminService = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  icon: string;
  href: string | null;
  status: "DRAFT" | "LIVE";
  isVisible: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type AdminHeroCta = {
  id: string;
  label: string;
  href: string;
  variant: "PRIMARY" | "OUTLINE" | "TEXT";
  openNewTab: boolean;
  isVisible: boolean;
  sortOrder: number;
  clickCount: number;
};

export type AdminPromise = { id: string; body: string; sortOrder: number };

export type AdminFormStep = {
  id: string;
  stepNumber: number;
  question: string;
  fields: FormFieldDef[];
};

export type AdminSectionState = {
  /** True when the draft differs from what the public site is rendering. */
  hasUnpublishedChanges: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
};

export type AdminHomeContent = {
  hero: HeroSection;
  heroState: AdminSectionState;
  heroCtas: AdminHeroCta[];
  services: ServicesSection;
  servicesState: AdminSectionState;
  serviceItems: AdminService[];
  contact: ContactSection;
  contactState: AdminSectionState;
  promises: AdminPromise[];
  formSteps: AdminFormStep[];
};

const emptyState: AdminSectionState = {
  hasUnpublishedChanges: false,
  publishedAt: null,
  updatedAt: null,
};

function parse<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: unknown } },
  value: unknown,
  fallback: T,
): T {
  if (!value) return fallback;
  const result = schema.safeParse(value);
  return result.success ? (result.data as T) : fallback;
}

const emptyHome = (): AdminHomeContent => ({
  hero: defaultHero,
  heroState: emptyState,
  heroCtas: [],
  services: defaultServicesSection,
  servicesState: emptyState,
  serviceItems: [],
  contact: defaultContactSection,
  contactState: emptyState,
  promises: [],
  formSteps: [],
});

export async function getAdminHomeContent(): Promise<AdminHomeContent> {
  const db = await userClient();
  if (!db) return emptyHome();

  const [sections, ctas, services, promises, steps] = await Promise.all([
    db.from("page_sections").select("*").eq("page_slug", "home"),
    db.from("hero_ctas").select("*").order("sort_order"),
    db.from("services").select("*").order("sort_order"),
    db.from("contact_promises").select("*").order("sort_order"),
    db.from("form_steps").select("*").order("step_number"),
  ]);

  const rows = sections.data ?? [];

  const stateFor = (key: string): AdminSectionState => {
    const row = rows.find((section) => section.section_key === key);
    if (!row) return emptyState;
    return {
      hasUnpublishedChanges:
        JSON.stringify(row.draft) !== JSON.stringify(row.published ?? null),
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
    };
  };

  const draftOf = (key: string) =>
    rows.find((section) => section.section_key === key)?.draft ?? null;

  return {
    hero: parse(heroSectionSchema, draftOf("hero"), defaultHero),
    heroState: stateFor("hero"),
    heroCtas: (ctas.data ?? []).map((cta) => ({
      id: cta.id,
      label: cta.label,
      href: cta.href,
      variant: cta.variant,
      openNewTab: cta.open_new_tab,
      isVisible: cta.is_visible,
      sortOrder: cta.sort_order,
      clickCount: cta.click_count,
    })),
    services: parse(servicesSectionSchema, draftOf("services"), defaultServicesSection),
    servicesState: stateFor("services"),
    serviceItems: (services.data ?? []).map((service) => ({
      id: service.id,
      kicker: service.kicker,
      title: service.title,
      description: service.description,
      icon: service.icon,
      href: service.href,
      status: service.status,
      isVisible: service.is_visible,
      sortOrder: service.sort_order,
      updatedAt: service.updated_at,
    })),
    contact: parse(contactSectionSchema, draftOf("contact"), defaultContactSection),
    contactState: stateFor("contact"),
    promises: (promises.data ?? []).map((row) => ({
      id: row.id,
      body: row.body,
      sortOrder: row.sort_order,
    })),
    formSteps: (steps.data ?? []).map((step) => ({
      id: step.id,
      stepNumber: step.step_number,
      question: step.question,
      fields: (step.fields ?? []) as FormFieldDef[],
    })),
  };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export type AdminSettings = {
  settings: typeof defaultSiteSettings;
  hours: { dayOfWeek: number; opensAt: string; closesAt: string; isClosed: boolean }[];
  socials: {
    id: string;
    platform: string;
    url: string;
    isVisible: boolean;
    sortOrder: number;
  }[];
};

export async function getAdminSettings(): Promise<AdminSettings> {
  const emptyHours = defaultWorkingHours.map((hour) => ({
    dayOfWeek: hour.dayOfWeek,
    opensAt: hour.opensAt ?? "",
    closesAt: hour.closesAt ?? "",
    isClosed: hour.isClosed,
  }));

  const db = await userClient();
  if (!db) return { settings: defaultSiteSettings, hours: emptyHours, socials: [] };

  const [row, hours, socials] = await Promise.all([
    db.from("site_settings").select("*").limit(1).maybeSingle(),
    db.from("working_hours").select("*").order("day_of_week"),
    db.from("social_links").select("*").order("sort_order"),
  ]);

  const data = row.data;

  return {
    settings: data
      ? {
          brandName: data.brand_name,
          tagline: data.tagline,
          domain: data.domain,
          logoUrl: data.logo_url ?? "",
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
        }
      : defaultSiteSettings,
    hours: hours.data?.length
      ? hours.data.map((hour) => ({
          dayOfWeek: hour.day_of_week,
          opensAt: hour.opens_at ?? "",
          closesAt: hour.closes_at ?? "",
          isClosed: hour.is_closed,
        }))
      : emptyHours,
    socials: (socials.data ?? []).map((social) => ({
      id: social.id,
      platform: social.platform,
      url: social.url,
      isVisible: social.is_visible,
      sortOrder: social.sort_order,
    })),
  };
}

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export type AdminSeoPage = {
  pageSlug: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterCard: string;
  focusKeywords: string[];
  schemaType: string;
  updatedAt: string | null;
  score: number;
};

export async function getAdminSeo(): Promise<{
  pages: AdminSeoPage[];
  defaults: typeof defaultSeoDefaults;
}> {
  const db = await userClient();
  if (!db) return { pages: [], defaults: defaultSeoDefaults };

  const [rows, defaults] = await Promise.all([
    db.from("seo_meta").select("*").order("page_slug"),
    db.from("seo_defaults").select("*").limit(1).maybeSingle(),
  ]);

  return {
    pages: (rows.data ?? []).map((row) => ({
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
      score: seoScore({
        pageSlug: row.page_slug,
        metaTitle: row.meta_title,
        metaDescription: row.meta_description,
        ogImageUrl: row.og_image_url,
        canonicalUrl: row.canonical_url,
        schemaType: row.schema_type,
      }),
    })),
    defaults: defaults.data
      ? {
          titleTemplate: defaults.data.title_template,
          defaultOgImage: defaults.data.default_og_image ?? "",
          twitterHandle: defaults.data.twitter_handle ?? "",
          sitemapUrl: defaults.data.sitemap_url ?? "",
        }
      : defaultSeoDefaults,
  };
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export type AdminLead = {
  id: string;
  ref: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string;
  phone: string | null;
  goal: string;
  budgetBand: string | null;
  message: string | null;
  source: string;
  utm: Record<string, string> | null;
  status: LeadStatusName;
  fitScore: number;
  assignedToId: string | null;
  assignedToName: string | null;
  firstReplyAt: string | null;
  createdAt: string;
};

export type AdminLeadNote = {
  id: string;
  body: string;
  kind: string;
  createdAt: string;
};

export type LeadFilters = { q?: string; status?: string };

type LeadRowWithAssignee = {
  id: string;
  ref: string;
  first_name: string;
  last_name: string;
  company: string | null;
  email: string;
  phone: string | null;
  goal: string;
  budget_band: string | null;
  message: string | null;
  source: string;
  utm: unknown;
  status: LeadStatusName;
  fit_score: number;
  assigned_to_id: string | null;
  first_reply_at: string | null;
  created_at: string;
  assigned_to?: { name: string } | null;
};

function toLeadView(lead: LeadRowWithAssignee): AdminLead {
  return {
    id: lead.id,
    ref: lead.ref,
    firstName: lead.first_name,
    lastName: lead.last_name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    goal: lead.goal,
    budgetBand: lead.budget_band,
    message: lead.message,
    source: lead.source,
    utm: (lead.utm ?? null) as Record<string, string> | null,
    status: lead.status,
    fitScore: lead.fit_score,
    assignedToId: lead.assigned_to_id,
    assignedToName: lead.assigned_to?.name ?? null,
    firstReplyAt: lead.first_reply_at,
    createdAt: lead.created_at,
  };
}

/** The embedded admin_users row, named so PostgREST resolves the FK. */
const LEAD_SELECT = "*, assigned_to:admin_users!leads_assigned_to_fkey(name)";

/** PostgREST `or` takes a comma-separated filter list, so commas must go. */
const escapeSearch = (value: string) => value.replace(/[,()]/g, " ").trim();

export async function getAdminLeads(filters: LeadFilters = {}): Promise<{
  leads: AdminLead[];
  counts: Record<string, number>;
}> {
  const db = await userClient();
  if (!db) return { leads: [], counts: {} };

  const term = filters.q ? escapeSearch(filters.q) : "";
  const searchFilter = term
    ? [
        `first_name.ilike.%${term}%`,
        `last_name.ilike.%${term}%`,
        `company.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `goal.ilike.%${term}%`,
        `source.ilike.%${term}%`,
        `ref.ilike.%${term}%`,
      ].join(",")
    : "";

  let query = db
    .from("leads")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false })
    .limit(500);

  if (searchFilter) query = query.or(searchFilter);
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status as LeadStatusName);
  }

  // The chips keep showing how many are in each column, so the counts follow
  // the search but not the status filter. One narrow query, tallied here:
  // PostgREST has no group-by, and six count queries would be six round trips.
  let countQuery = db.from("leads").select("status");
  if (searchFilter) countQuery = countQuery.or(searchFilter);

  const [rows, statuses] = await Promise.all([query, countQuery]);

  const counts: Record<string, number> = { all: statuses.data?.length ?? 0 };
  for (const row of statuses.data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  return {
    leads: ((rows.data ?? []) as unknown as LeadRowWithAssignee[]).map(toLeadView),
    counts,
  };
}

export async function getLeadNotes(leadId: string): Promise<AdminLeadNote[]> {
  const db = await userClient();
  if (!db) return [];

  const { data } = await db
    .from("lead_notes")
    .select("id, body, kind, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((note) => ({
    id: note.id,
    body: note.body,
    kind: note.kind,
    createdAt: note.created_at,
  }));
}

export async function getAdminUsers() {
  const db = await userClient();
  if (!db) return [];

  const { data } = await db.from("admin_users").select("id, name, email").order("name");
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export type KpiTile = {
  id: string;
  label: string;
  value: string;
  unit: string;
  change: number | null;
  series: number[];
  /** One label per series point, for the sparkline's tooltip. */
  seriesLabels: string[];
  footnote: string;
  href: string;
};

export type QueueItem = {
  id: string;
  kind: "lead" | "service" | "seo";
  title: string;
  detail: string;
  href: string;
  /** Higher sorts first. Cost of delay, not recency. */
  weight: number;
};

export type Overview = {
  tiles: KpiTile[];
  queue: QueueItem[];
  sources: { source: string; count: number }[];
  recentLeads: AdminLead[];
  blocks: {
    key: "hero" | "services" | "contact";
    label: string;
    state: AdminSectionState;
    rowSummary: string;
  }[];
  slaHours: number;
  /**
   * The moment the figures were read. Returned rather than taken during
   * render, so the reply-window pills are computed from one fixed instant.
   */
  now: number;
};

const DAY = 86400_000;

/** Percentage change, null when there is no baseline to compare against. */
function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

type RangeLead = { created_at: string; first_reply_at: string | null; status: string };

export async function getOverview(days: 7 | 30): Promise<Overview> {
  const db = await userClient();
  const home = await getAdminHomeContent();
  const slaHours = home.contact.slaHours;

  const blocks = [
    {
      key: "hero" as const,
      label: "Hero",
      state: home.heroState,
      rowSummary: `${home.heroCtas.filter((c) => c.isVisible).length} of ${home.heroCtas.length} CTAs visible`,
    },
    {
      key: "services" as const,
      label: "Core Services",
      state: home.servicesState,
      rowSummary: `${home.serviceItems.filter((s) => s.status === "LIVE" && s.isVisible).length} of ${home.serviceItems.length} services live`,
    },
    {
      key: "contact" as const,
      label: "Contact",
      state: home.contactState,
      rowSummary: `${home.promises.length} promises, ${home.formSteps.length} form steps, ${slaHours}h reply window`,
    },
  ];

  if (!db) {
    return {
      tiles: [],
      queue: [],
      sources: [],
      recentLeads: [],
      blocks,
      slaHours,
      now: Date.now(),
    };
  }

  const now = new Date();
  const from = new Date(now.getTime() - days * DAY);
  const previousFrom = new Date(now.getTime() - 2 * days * DAY);

  const [currentRes, previousRes, recentRes, draftRes, seoRes, newRes] =
    await Promise.all([
      db
        .from("leads")
        .select("created_at, first_reply_at, status, source")
        .gte("created_at", from.toISOString()),
      db
        .from("leads")
        .select("created_at, first_reply_at, status")
        .gte("created_at", previousFrom.toISOString())
        .lt("created_at", from.toISOString()),
      db.from("leads").select(LEAD_SELECT).order("created_at", { ascending: false }).limit(5),
      db
        .from("services")
        .select("id, title, updated_at")
        .eq("status", "DRAFT")
        .order("updated_at", { ascending: false }),
      db.from("seo_meta").select("*"),
      db
        .from("leads")
        .select("id, ref, first_name, last_name, created_at, status, source")
        .eq("status", "NEW")
        .order("created_at")
        .limit(20),
    ]);

  const current = (currentRes.data ?? []) as (RangeLead & { source: string })[];
  const previous = (previousRes.data ?? []) as RangeLead[];
  const seoRows = seoRes.data ?? [];

  /** Daily counts across the range, oldest first, for the sparkline. */
  const dayFormat = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });

  const buckets = Array.from({ length: days }, (_, i) => {
    const start = new Date(now.getTime() - (days - i) * DAY);
    const end = new Date(start.getTime() + DAY);
    return {
      label: dayFormat.format(start),
      count: current.filter((lead) => {
        const at = new Date(lead.created_at).getTime();
        return at >= start.getTime() && at < end.getTime();
      }).length,
    };
  });

  const series = buckets.map((bucket) => bucket.count);
  const seriesLabels = buckets.map((bucket) => bucket.label);

  /** In time means: answered inside the window, or still inside it. */
  const inTime = (lead: RangeLead) =>
    lead.first_reply_at
      ? new Date(lead.first_reply_at).getTime() - new Date(lead.created_at).getTime() <=
        slaHours * 3600_000
      : !isOverdue(new Date(lead.created_at), slaHours, lead.status, now);

  const rate = (rows: RangeLead[]) =>
    rows.length ? Math.round((rows.filter(inTime).length / rows.length) * 100) : 0;

  const wonRate = (rows: RangeLead[]) =>
    rows.length
      ? Math.round((rows.filter((l) => l.status === "WON").length / rows.length) * 100)
      : 0;

  const seoScores = seoRows.map((row) =>
    seoScore({
      pageSlug: row.page_slug,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      ogImageUrl: row.og_image_url,
      canonicalUrl: row.canonical_url,
      schemaType: row.schema_type,
    }),
  );
  const seoHealth = seoScores.length
    ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length)
    : 0;

  const sourceCounts = new Map<string, number>();
  for (const lead of current) {
    sourceCounts.set(lead.source, (sourceCounts.get(lead.source) ?? 0) + 1);
  }

  const queue: QueueItem[] = [
    // Leads past the window first: every hour here costs a real reply.
    ...(newRes.data ?? [])
      .filter((lead) => isOverdue(new Date(lead.created_at), slaHours, lead.status, now))
      .map((lead) => {
        const sla = slaState(new Date(lead.created_at), slaHours, lead.status, now);
        return {
          id: lead.id,
          kind: "lead" as const,
          title: `${lead.first_name} ${lead.last_name} (${lead.ref})`,
          detail: `${sla.label} on a ${slaHours}h reply window, from ${lead.source}.`,
          href: `/admin/leads?lead=${lead.id}`,
          weight: 1000 + Math.abs(sla.hoursLeft),
        };
      }),
    // Then work that is written but not reaching anyone.
    ...(draftRes.data ?? []).map((service) => ({
      id: service.id,
      kind: "service" as const,
      title: service.title,
      detail: "Still in draft, so it is not on the live page.",
      href: "/admin/content?tab=services",
      weight: 500,
    })),
  ].sort((a, b) => b.weight - a.weight);

  const tiles: KpiTile[] = [
    {
      id: "new-leads",
      label: "New leads",
      value: String(current.length),
      unit: current.length === 1 ? "lead" : "leads",
      change: change(current.length, previous.length),
      series,
      seriesLabels,
      footnote: `${current.filter((l) => l.status === "NEW").length} still waiting for a first reply.`,
      href: "/admin/leads?status=NEW",
    },
    {
      id: "replied-in-time",
      label: "Replied in time",
      value: String(rate(current)),
      unit: "%",
      change: change(rate(current), rate(previous)),
      series,
      seriesLabels,
      footnote: `Answered inside the ${slaHours}h window, or still inside it.`,
      href: "/admin/leads?status=NEW",
    },
    {
      id: "lead-to-won",
      label: "Lead to won",
      value: String(wonRate(current)),
      unit: "%",
      change: change(wonRate(current), wonRate(previous)),
      series,
      seriesLabels,
      footnote: `${current.filter((l) => l.status === "WON").length} won out of ${current.length} received.`,
      href: "/admin/leads?status=WON",
    },
    {
      id: "seo-health",
      label: "SEO health",
      value: String(seoHealth),
      unit: "/100",
      change: null,
      series: seoScores,
      seriesLabels: seoRows.map((row) => row.page_slug),
      footnote: `Average across ${seoScores.length} page${seoScores.length === 1 ? "" : "s"}. Title, description, OG image, canonical, schema.`,
      href: "/admin/seo",
    },
  ];

  return {
    tiles,
    queue: queue.slice(0, 8),
    sources: [...sourceCounts.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    recentLeads: ((recentRes.data ?? []) as unknown as LeadRowWithAssignee[]).map(toLeadView),
    blocks,
    slaHours,
    now: now.getTime(),
  };
}

// ---------------------------------------------------------------------------
// Publish pre-flight
// ---------------------------------------------------------------------------

export type Preflight = {
  changes: { label: string; detail: string }[];
  warnings: { label: string; detail: string }[];
};

export async function getPreflight(): Promise<Preflight> {
  const home = await getAdminHomeContent();
  const changes: Preflight["changes"] = [];
  const warnings: Preflight["warnings"] = [];

  const sections = [
    { label: "Hero", state: home.heroState },
    { label: "Core Services", state: home.servicesState },
    { label: "Contact", state: home.contactState },
  ];

  for (const section of sections) {
    if (section.state.hasUnpublishedChanges) {
      changes.push({
        label: `${section.label} copy`,
        detail: section.state.publishedAt
          ? "The draft differs from the version the live page is rendering."
          : "Has never been published, so the live page is still showing the seeded copy.",
      });
    }
  }

  const drafts = home.serviceItems.filter((service) => service.status === "DRAFT");
  if (drafts.length) {
    warnings.push({
      label: `${drafts.length} service${drafts.length === 1 ? "" : "s"} still in draft`,
      detail: `${drafts.map((s) => s.title).join(", ")} will not appear on the live page.`,
    });
  }

  const db = await userClient();
  if (db) await addDataWarnings(db, warnings);

  if (!home.heroCtas.some((cta) => cta.isVisible)) {
    warnings.push({
      label: "No visible hero CTA",
      detail: "The hero has nothing for a visitor to click.",
    });
  }

  return { changes, warnings };
}

async function addDataWarnings(db: Db, warnings: Preflight["warnings"]) {
  const { data: settings } = await db
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!settings) {
    warnings.push({
      label: "Site Settings has no row",
      detail: "The site is rendering seeded contact details. Run `npm run db:reset`.",
    });
  }
}

// ---------------------------------------------------------------------------
// Lead notifications
// ---------------------------------------------------------------------------

export type LeadNotification = {
  id: string;
  ref: string;
  name: string;
  goal: string;
  fitScore: number;
  createdAt: string;
  unread: boolean;
};

export type LeadNotifications = {
  unread: number;
  items: LeadNotification[];
  /** The moment the figures were read, so the panel ages them from one instant. */
  now: number;
};

/** How many recent leads the bell shows, read or not. */
const NOTIFICATION_LIMIT = 8;

/**
 * Recent leads, and how many of them arrived since this operator last looked.
 *
 * Unread is a comparison against one timestamp on their own row rather than a
 * read-marker per lead: a notification here is not a thing in its own right,
 * it is a lead that landed after they last opened the bell.
 *
 * The panel always lists the most recent few, read or not, because a bell
 * that empties itself the moment you open it is useless for "what came in
 * while I was out".
 */
export async function getLeadNotifications(
  /** Taken from the caller, which has already proved who is asking. Looking
   *  the operator up again here would be a second round trip to the Auth
   *  server on every poll. */
  adminId: string,
): Promise<LeadNotifications> {
  const db = await userClient();
  const now = Date.now();
  if (!db) return { unread: 0, items: [], now };

  const { data: me } = await db
    .from("admin_users")
    .select("notifications_seen_at")
    .eq("id", adminId)
    .maybeSingle();

  const seenAt = me?.notifications_seen_at ?? new Date(0).toISOString();

  const { data: rows, error } = await db
    .from("leads")
    .select("id, ref, first_name, last_name, goal, fit_score, created_at")
    .order("created_at", { ascending: false })
    .limit(NOTIFICATION_LIMIT);

  if (error || !rows) {
    // A bell that throws takes the whole admin shell down with it. An empty
    // one is wrong in a way the operator can see and recover from.
    if (error) console.error("[notifications]", error.code, error.message);
    return { unread: 0, items: [], now };
  }

  const items = rows.map((row) => ({
    id: row.id,
    ref: row.ref,
    name: `${row.first_name} ${row.last_name}`.trim(),
    goal: row.goal,
    fitScore: row.fit_score,
    createdAt: row.created_at,
    unread: row.created_at > seenAt,
  }));

  // Counted on the server, not from `items`: more than NOTIFICATION_LIMIT can
  // be unread, and a badge that silently caps at 8 understates the backlog.
  const { count } = await db
    .from("leads")
    .select("id", { count: "exact", head: true })
    .gt("created_at", seenAt);

  return { unread: count ?? 0, items, now };
}

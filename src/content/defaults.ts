/**
 * The home page's live copy, in the exact shape the database stores it.
 *
 * This module has two jobs:
 *  1. `prisma db seed` loads it into the tables, so the site renders
 *     identically before and after the migration.
 *  2. The public site falls back to it when DATABASE_URL is unset, so the
 *     marketing site still builds and renders on a machine with no database.
 *
 * It is the only place the pre-CMS copy lives. Components read props.
 */
import type {
  ContactSection,
  FormStepInput,
  HeroSection,
  ServicesSection,
} from "@/lib/schemas/content";

export const defaultHero: HeroSection = {
  eyebrow: "// Klixora · Digital Growth Partner",
  // Asterisks mark the cyan-to-violet words. See lib/rich-text.tsx.
  headlineLines: ["GROWTH *DRIVEN*", "*DIGITAL* STRATEGY", "FOR BOLD BRANDS"],
  subheadline:
    "More than a digital agency. We are architects of growth strategies, engineers of digital presence, and the partner you call when you're serious about scaling.",
  backgroundImageUrl: "/hero-bg.webp",
  chips: ["Data-Driven Approach"],
  scrollCue: "Scroll to explore",
  dashboardTitle: "Live Campaign Tracking",
  dashboardStatus: "Tracking",
  dashboardMetrics: ["Reach", "Leads", "Conversions"],
};

export const defaultHeroCtas = [
  {
    label: "Enquire Now",
    href: "/#contact",
    variant: "PRIMARY" as const,
    openNewTab: false,
    isVisible: true,
    sortOrder: 0,
  },
  {
    label: "Get on a Call Today",
    href: "/#contact",
    variant: "OUTLINE" as const,
    openNewTab: false,
    isVisible: true,
    sortOrder: 1,
  },
];

export const defaultServicesSection: ServicesSection = {
  eyebrow: "// Core Services",
  heading: "Digital solutions *that work.*",
  intro:
    "Instead of juggling multiple agencies, you get everything under one roof: ads, organic presence, and everything your business needs to grow online.",
  ctaLabel: "Get a free audit",
  ctaHref: "/#contact",
  columns: 3,
};

/** `icon` is a lucide-react export name, resolved by components/ui/icon.tsx. */
export const defaultServices = [
  {
    kicker: "Diagnostic & Blueprint",
    title: "Website Audit & Strategy",
    description:
      "We analyze your website to identify gaps, improve performance, and create a growth-focused strategy that attracts more visitors and converts them into customers.",
    icon: "ClipboardCheck",
    sortOrder: 0,
  },
  {
    kicker: "Organic & Kinetic",
    title: "Social Media Marketing",
    description:
      "Engaging content and campaigns that increase brand awareness, build audience trust, and drive meaningful customer engagement.",
    icon: "Users",
    sortOrder: 1,
  },
  {
    kicker: "Intent & Scale",
    title: "SEO Optimization",
    description:
      "Improve your Google rankings and attract organic traffic through keyword optimization, technical SEO, and content strategies that deliver long-term results.",
    icon: "Search",
    sortOrder: 2,
  },
  {
    kicker: "Performance Media",
    title: "Paid Ads (Meta & Google)",
    description:
      "Reach the right audience with targeted Meta and Google Ads campaigns designed to generate quality leads, increase sales, and maximize ROI.",
    icon: "Zap",
    sortOrder: 3,
  },
  {
    kicker: "Retention & LTV",
    title: "Email & WhatsApp Marketing",
    description:
      "Stay connected with your customers through personalized email and WhatsApp campaigns that nurture leads and boost repeat business.",
    icon: "Mail",
    sortOrder: 4,
  },
  {
    kicker: "Storefront Acceleration",
    title: "E-Commerce & Marketplace Listing",
    description:
      "Optimize your product listings on Amazon, Flipkart, and other marketplaces to increase visibility, attract buyers, and drive more sales.",
    icon: "ShoppingBag",
    sortOrder: 5,
  },
];

export const defaultContactSection: ContactSection = {
  eyebrow: "// Contact",
  heading: "Let's make something *great together!*",
  cardKicker: "Start here",
  formTitle: "Tell us what you are trying to grow.",
  formIntro:
    "Four short questions. It takes under a minute, and it tells us more than a contact form ever does.",
  successTitle: "Thanks, that's everything we need.",
  successMessage:
    "A real person will reply within 24 hours. No autoresponder, no pitch deck.",
  notifyInbox: "Info@Klixora.site",
  slaHours: 24,
  showContactBlock: true,
};

export const defaultContactPromises = [
  "A reply within 24 hours, from a person, not an autoresponder",
  "A straight answer on whether we are the right fit",
  "No pitch deck and no discovery theatre",
];

/**
 * The service list the form's goal select offers. Seeded into the form step
 * so it is editable, rather than being a second copy of the services table.
 */
const GOAL_OPTIONS = [
  "Website Audit & Strategy",
  "Social Media Marketing",
  "SEO Optimization",
  "Paid Ads (Meta & Google)",
  "Email & WhatsApp Marketing",
  "E-Commerce & Marketplace Listing",
  "Event Management",
];

/** Field names map onto Lead columns, which is how a submission is stored. */
export const defaultFormSteps: (FormStepInput & { stepNumber: number })[] = [
  {
    stepNumber: 1,
    question: "First, who are we talking to?",
    fields: [
      { name: "firstName", label: "First name", type: "text", required: true },
      { name: "lastName", label: "Last name", type: "text", required: true },
    ],
  },
  {
    stepNumber: 2,
    question: "How can we reach you?",
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Mobile", type: "tel", required: true },
    ],
  },
  {
    stepNumber: 3,
    question: "What are you interested in?",
    fields: [
      {
        name: "goal",
        label: "Service",
        type: "select",
        required: true,
        options: GOAL_OPTIONS,
      },
    ],
  },
  {
    stepNumber: 4,
    question: "Anything we should know?",
    fields: [
      {
        name: "message",
        label: "Message (optional)",
        type: "textarea",
        required: false,
      },
    ],
  },
];

export const defaultSiteSettings = {
  brandName: "Klixora",
  tagline: "Growth Driven Digital Strategy",
  domain: "klixora.site",
  logoUrl: "/klixora-logo-white.webp",
  logoAlt: "Klixora",
  logoHeight: 34,
  addressLine1: "Vardhman City",
  addressLine2: "Kurukshetra, Haryana",
  mapUrl: "https://maps.google.com/?cid=18288639185173001004",
  email: "Info@Klixora.site",
  phone: "8668322325",
  whatsapp: "918668322325",
  hoursLabel: "Mon-Fri from 8am to 5pm",
  gstin: "",
};

/** dayOfWeek 0 = Monday. */
export const defaultWorkingHours = [
  { dayOfWeek: 0, opensAt: "08:00", closesAt: "17:00", isClosed: false },
  { dayOfWeek: 1, opensAt: "08:00", closesAt: "17:00", isClosed: false },
  { dayOfWeek: 2, opensAt: "08:00", closesAt: "17:00", isClosed: false },
  { dayOfWeek: 3, opensAt: "08:00", closesAt: "17:00", isClosed: false },
  { dayOfWeek: 4, opensAt: "08:00", closesAt: "17:00", isClosed: false },
  { dayOfWeek: 5, opensAt: null, closesAt: null, isClosed: true },
  { dayOfWeek: 6, opensAt: null, closesAt: null, isClosed: true },
];

/** The real profiles, taken from the live klixora.site footer. */
export const defaultSocialLinks = [
  {
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/klixora",
    isVisible: true,
    sortOrder: 0,
  },
  {
    platform: "Instagram",
    url: "https://www.instagram.com/klixora.site/",
    isVisible: true,
    sortOrder: 1,
  },
  {
    platform: "Facebook",
    url: "https://www.facebook.com/people/Klixora/61578608045043/",
    isVisible: true,
    sortOrder: 2,
  },
  {
    platform: "YouTube",
    url: "https://www.youtube.com/@Klixora.Official",
    isVisible: true,
    sortOrder: 3,
  },
];

export const defaultSeoDefaults = {
  titleTemplate: "%s | Klixora",
  defaultOgImage: "",
  twitterHandle: "",
  sitemapUrl: "https://klixora.site/sitemap.xml",
};

export const defaultSeoMeta = [
  {
    pageSlug: "home",
    path: "/",
    metaTitle: "Klixora: Growth Driven Digital Strategy for Bold Brands",
    metaDescription:
      "Growth driven digital strategy for bold brands. Klixora runs paid ads, SEO, social media, e-commerce and marketplace growth for you, under one roof.",
    canonicalUrl: "https://klixora.site",
    robots: "index, follow",
    ogTitle: "Klixora: Growth Driven Digital Strategy for Bold Brands",
    ogDescription:
      "Paid ads, SEO, social media, e-commerce and marketplace growth under one roof.",
    ogImageUrl: "",
    twitterCard: "summary_large_image",
    focusKeywords: ["digital marketing agency", "performance marketing", "SEO Kurukshetra"],
    schemaType: "LocalBusiness",
  },
  {
    pageSlug: "services",
    path: "/#services",
    metaTitle: "Core Services: Ads, SEO, Social and Marketplace Growth",
    metaDescription:
      "Everything under one roof: website audit and strategy, social media, SEO, paid ads, email and WhatsApp marketing, e-commerce and marketplace listing.",
    canonicalUrl: "https://klixora.site/#services",
    robots: "index, follow",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    twitterCard: "summary_large_image",
    focusKeywords: ["digital marketing services", "paid ads agency"],
    schemaType: "Service",
  },
  {
    pageSlug: "contact",
    path: "/#contact",
    metaTitle: "Contact Klixora: Talk to a Growth Partner Today",
    metaDescription:
      "Four short questions and a real reply within 24 hours. Tell us what you are trying to grow and we will tell you straight whether we are the right fit.",
    canonicalUrl: "https://klixora.site/#contact",
    robots: "index, follow",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    twitterCard: "summary_large_image",
    focusKeywords: ["contact digital marketing agency"],
    schemaType: "Organization",
  },
  {
    pageSlug: "agri-marketing",
    path: "/agri-marketing",
    metaTitle: "Agri Marketing Built for Rural India | Klixora",
    metaDescription:
      "Klixora helps agri brands connect with rural audiences through digital, offline-first, and insight-led communication that works where it matters most.",
    canonicalUrl: "https://klixora.site/agri-marketing",
    robots: "index, follow",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    twitterCard: "summary_large_image",
    focusKeywords: ["agri marketing", "rural marketing India"],
    schemaType: "Service",
  },
  {
    pageSlug: "event-management",
    path: "/event-management",
    metaTitle: "Event Management and Brand Activations | Klixora",
    metaDescription:
      "Stage and stall design, LED and AV, artist booking, branding, logistics and on-ground teams. Klixora runs your whole event, end to end, under one roof.",
    canonicalUrl: "https://klixora.site/event-management",
    robots: "index, follow",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    twitterCard: "summary_large_image",
    focusKeywords: ["event management agency", "brand activation"],
    schemaType: "Service",
  },
];

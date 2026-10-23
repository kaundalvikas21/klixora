export const site = {
  name: "Klixora",
  tagline: "Growth Driven Digital Strategy",
  title: "Klixora — Growth Driven Digital Strategy for Bold Brands",
  description:
    "Klixora — Growth Driven Digital Strategy for Bold Brands. Paid ads, SEO, social media, e-commerce and marketplace growth under one roof.",
  url: "https://klixora.site",
  logo: "/klixora-logo-white.webp",
  address: "Vardhman City, Kurukshetra, Haryana",
  email: "Info@Klixora.site",
  phone: "8668322325",
  hours: "Mon-Fri from 8am to 5pm",
  founded: "2026",
} as const;

export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Results", href: "#results" },
  { label: "Why Us", href: "#why-us" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
  { label: "Agri Marketing", href: "/agri-marketing" },
  { label: "Events", href: "/event-management" },
] as const;

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

export const serviceOptions = [
  "Website Audit & Strategy",
  "Social Media Marketing",
  "SEO Optimization",
  "Paid Ads (Meta & Google)",
  "Email & WhatsApp Marketing",
  "E-Commerce & Marketplace Listing",
  "Event Management",
] as const;

/** Footer service column — labels only; they all route to the services section. */
export const footerServices = [
  "Website Audit & Strategy",
  "Social Media Marketing",
  "SEO Optimization",
  "Paid Ads (Meta & Google)",
  "E-Commerce & Marketplace",
  "Event Management",
] as const;

/** Replace the hrefs with the real profiles when they exist. */
export const socials = [
  { label: "LinkedIn", key: "linkedin", href: "#" },
  { label: "Instagram", key: "instagram", href: "#" },
  { label: "Facebook", key: "facebook", href: "#" },
  { label: "YouTube", key: "youtube", href: "#" },
] as const;

export const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

/** Section ids the header watches to highlight the current link. */
export const sectionIds = [
  "services",
  "results",
  "why-us",
  "process",
  "contact",
] as const;

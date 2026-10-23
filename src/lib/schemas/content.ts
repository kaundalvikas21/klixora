import { z } from "zod";
import { bool, href, optionalText, text } from "@/lib/schemas/primitives";

/**
 * One schema per entity, imported by both the admin form and the Server
 * Action. The action is the source of truth; the form uses the same schema so
 * field errors can be shown before a round trip.
 */

// ---------------------------------------------------------------------------
// Section copy (PageSection.draft / .published)
// ---------------------------------------------------------------------------

/**
 * Headline and heading fields mark gradient words by wrapping them in
 * asterisks: "GROWTH *DRIVEN*". That keeps a heading one editable string
 * instead of a nested array of styled segments.
 */
export const heroSectionSchema = z.object({
  eyebrow: text(120, "Eyebrow"),
  headlineLines: z
    .array(text(80, "Headline line"))
    .min(1, "Add at least one headline line.")
    .max(6, "Six lines is the most the hero can hold."),
  subheadline: text(400, "Sub-headline"),
  backgroundImageUrl: optionalText(512),
  chips: z.array(text(60, "Chip")).max(4),
  scrollCue: optionalText(60),
  /**
   * The live-tracking card beside the headline. Defaulted rather than
   * required, so a row written before these existed still parses instead of
   * silently falling back to the whole seeded hero.
   */
  dashboardTitle: optionalText(60).default("Live Campaign Tracking"),
  dashboardStatus: optionalText(30).default("Tracking"),
  dashboardMetrics: z
    .array(text(24, "Metric"))
    .max(4)
    .default(["Reach", "Leads", "Conversions"]),
});

export const servicesSectionSchema = z.object({
  eyebrow: text(120, "Eyebrow"),
  heading: text(160, "Heading"),
  intro: text(600, "Intro"),
  ctaLabel: optionalText(60),
  ctaHref: optionalText(512),
  columns: z.coerce.number().int().min(2).max(4),
});

export const contactSectionSchema = z.object({
  eyebrow: text(120, "Eyebrow"),
  heading: text(160, "Heading"),
  cardKicker: text(60, "Card kicker"),
  formTitle: text(160, "Form title"),
  formIntro: text(400, "Form intro"),
  successTitle: text(160, "Success title"),
  successMessage: text(400, "Success message"),
  notifyInbox: z.email("Enter a valid inbox address.").max(160),
  /** Drives the overdue flag on every lead. */
  slaHours: z.coerce.number().int().min(1).max(336),
  showContactBlock: bool(true),
});

export const sectionSchemas = {
  hero: heroSectionSchema,
  services: servicesSectionSchema,
  contact: contactSectionSchema,
} as const;

export type SectionKey = keyof typeof sectionSchemas;
export const SECTION_KEYS = ["hero", "services", "contact"] as const;

export type HeroSection = z.infer<typeof heroSectionSchema>;
export type ServicesSection = z.infer<typeof servicesSectionSchema>;
export type ContactSection = z.infer<typeof contactSectionSchema>;

export type SectionPayload = {
  hero: HeroSection;
  services: ServicesSection;
  contact: ContactSection;
};

// ---------------------------------------------------------------------------
// Structured rows
// ---------------------------------------------------------------------------

export const heroCtaSchema = z.object({
  id: z.string().optional(),
  label: text(60, "Label"),
  href,
  variant: z.enum(["PRIMARY", "OUTLINE", "TEXT"]),
  openNewTab: bool(false),
  isVisible: bool(true),
});

export const serviceSchema = z.object({
  id: z.string().optional(),
  kicker: text(60, "Kicker"),
  title: text(120, "Title"),
  description: text(600, "Description"),
  icon: text(40, "Icon"),
  href: optionalText(512),
  status: z.enum(["DRAFT", "LIVE"]),
  isVisible: bool(true),
});

export const contactPromiseSchema = z.object({
  id: z.string().optional(),
  body: text(200, "Promise"),
});

export const formFieldSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, digits and underscores.")
    .max(40),
  label: text(80, "Field label"),
  type: z.enum(["text", "email", "tel", "select", "textarea"]),
  required: bool(false),
  options: z.array(z.string().trim().min(1).max(120)).optional(),
});

export const formStepSchema = z.object({
  id: z.string().optional(),
  question: text(160, "Question"),
  fields: z.array(formFieldSchema).min(1, "A step needs at least one field."),
});

export type FormFieldDef = z.infer<typeof formFieldSchema>;
export type FormStepInput = z.infer<typeof formStepSchema>;

export { reorderSchema } from "@/lib/schemas/primitives";

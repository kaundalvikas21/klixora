import { z } from "zod";
import { bool, href, optionalText, optionalUrl, text } from "@/lib/schemas/primitives";

/** "08:00". Stored as a string so no timezone can creep in. */
const timeOfDay = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:MM, for example 08:00");

export const siteSettingsSchema = z.object({
  brandName: text(80, "Brand name"),
  tagline: text(160, "Tagline"),
  domain: text(160, "Domain"),
  logoUrl: optionalText(512),
  logoAlt: text(120, "Logo alt text"),
  logoHeight: z.coerce.number().int().min(16).max(96),
  addressLine1: text(160, "Address line 1"),
  addressLine2: text(160, "Address line 2"),
  mapUrl: optionalUrl,
  email: z.email("Enter a valid email address.").max(160),
  phone: text(24, "Phone"),
  whatsapp: text(24, "WhatsApp number"),
  hoursLabel: text(160, "Hours sentence"),
  gstin: optionalText(32),
});

export const workingHourSchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    opensAt: z.union([timeOfDay, z.literal("")]).optional().transform((v) => v ?? ""),
    closesAt: z.union([timeOfDay, z.literal("")]).optional().transform((v) => v ?? ""),
    isClosed: bool(false),
  })
  .refine((v) => v.isClosed || (v.opensAt !== "" && v.closesAt !== ""), {
    message: "An open day needs both an opening and a closing time.",
    path: ["opensAt"],
  })
  .refine((v) => v.isClosed || v.opensAt < v.closesAt, {
    message: "Closing time has to be after opening time.",
    path: ["closesAt"],
  });

export const workingHoursSchema = z.object({
  hours: z.array(workingHourSchema).length(7),
});

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  platform: text(40, "Platform"),
  // `href` rather than a strict URL: the seeded profiles are still "#" until
  // the real ones exist, and rejecting that would make the row unsaveable.
  url: href,
  isVisible: bool(true),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type WorkingHourInput = z.infer<typeof workingHourSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

/** 0 = Monday, matching WorkingHour.dayOfWeek. */
export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** schema.org day names, in the same order as DAY_NAMES. */
export const SCHEMA_DAY_NAMES = DAY_NAMES;

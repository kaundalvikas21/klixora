import { z } from "zod";

/**
 * Trimmed, non-empty, length-bounded string.
 *
 * The `error` option covers a missing field as well as a wrong type: without
 * it, an absent key fails the type check before `.min(1)` ever runs and the
 * visitor is shown "expected string, received undefined".
 */
export const text = (max: number, label: string) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} is too long (maximum ${max} characters).`);

/** Optional string that normalises an absent value to "". */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v ?? "");

/**
 * z.coerce.boolean() runs Boolean(), so the string "false" coerces to true.
 * Checkboxes and switches post strings, so booleans go through this instead.
 */
export const bool = (fallback: boolean) =>
  z
    .union([z.boolean(), z.enum(["true", "false", "on", "off", "1", "0", ""])])
    .default(fallback)
    .transform((v) =>
      typeof v === "boolean" ? v : v === "true" || v === "on" || v === "1",
    );

export const href = z
  .string()
  .trim()
  .min(1, "A destination is required.")
  .max(512)
  .refine(
    (v) =>
      v.startsWith("/") ||
      v.startsWith("#") ||
      /^https?:\/\//.test(v) ||
      /^(mailto|tel):/.test(v),
    "Use a path (/contact), an anchor (#contact), or a full URL.",
  );

/** Optional absolute URL, normalised to "". */
export const optionalUrl = z
  .union([z.literal(""), z.string().trim().url("Enter a full URL including https://")])
  .optional()
  .transform((v) => v ?? "");

/** Drag reorder: the new id order for one collection. */
export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

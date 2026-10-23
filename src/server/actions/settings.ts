"use server";

import { updateTag } from "next/cache";
import { adminContext, describeDbError } from "@/server/actions/_client";
import { writeAudit } from "@/server/audit";
import { SITE_CONTENT_TAG } from "@/server/content";
import { reorderSchema } from "@/lib/schemas/primitives";
import {
  siteSettingsSchema,
  socialLinkSchema,
  workingHoursSchema,
} from "@/lib/schemas/settings";
import { fail, fieldErrorsFrom, ok, type ActionResult } from "@/server/actions/result";

/**
 * Site Settings is the single source for every contact detail on the site.
 * One edit here moves the header, the contact block, the footer, the
 * WhatsApp button and the structured data, because all of them read the same
 * cached row.
 */
export async function saveSiteSettings(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = siteSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Some fields need attention.", fieldErrorsFrom(parsed.error.issues));
  }

  const input = parsed.data;
  const row = {
    brand_name: input.brandName,
    tagline: input.tagline,
    domain: input.domain,
    logo_url: input.logoUrl || null,
    logo_alt: input.logoAlt,
    logo_height: input.logoHeight,
    address_line1: input.addressLine1,
    address_line2: input.addressLine2,
    map_url: input.mapUrl || null,
    email: input.email,
    phone: input.phone,
    whatsapp: input.whatsapp,
    hours_label: input.hoursLabel,
    gstin: input.gstin || null,
  };

  const { data: before } = await db
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const { data: after, error } = before
    ? await db.from("site_settings").update(row).eq("id", before.id).select("*").maybeSingle()
    : await db.from("site_settings").insert(row).select("*").maybeSingle();

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "site_settings",
    entityId: after?.id ?? null,
    action: before ? "updated" : "created",
    before,
    after,
  });

  updateTag(SITE_CONTENT_TAG);
  return ok("Settings saved and live.");
}

/**
 * All seven rows are written together. A day-by-day save would let the table
 * sit in a half-valid state, and this table is what search engines read.
 */
export async function saveWorkingHours(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = workingHoursSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Check the opening times.", fieldErrorsFrom(parsed.error.issues));
  }

  const { data: before } = await db.from("working_hours").select("*").order("day_of_week");

  const rows = parsed.data.hours.map((hour) => ({
    day_of_week: hour.dayOfWeek,
    opens_at: hour.isClosed ? null : hour.opensAt || null,
    closes_at: hour.isClosed ? null : hour.closesAt || null,
    is_closed: hour.isClosed,
  }));

  const { error } = await db
    .from("working_hours")
    .upsert(rows, { onConflict: "day_of_week" });

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "working_hours",
    action: "updated",
    before: { hours: before },
    after: { hours: rows },
  });

  updateTag(SITE_CONTENT_TAG);
  return ok("Working hours saved. Structured data follows this table.");
}

export async function saveSocialLink(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = socialLinkSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Check the platform and URL.", fieldErrorsFrom(parsed.error.issues));
  }

  const { id, platform, url, isVisible } = parsed.data;
  const row = { platform, url, is_visible: isVisible };

  if (id) {
    const { data: before } = await db
      .from("social_links")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    const { data: after, error } = await db
      .from("social_links")
      .update(row)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "social_links",
      entityId: id,
      action: "updated",
      before,
      after,
    });
  } else {
    const { data: last } = await db
      .from("social_links")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: created, error } = await db
      .from("social_links")
      .insert({ ...row, sort_order: (last?.sort_order ?? -1) + 1 })
      .select("*")
      .single();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "social_links",
      entityId: created.id,
      action: "created",
      after: created,
    });
  }

  updateTag(SITE_CONTENT_TAG);
  return ok("Social link saved.");
}

export async function deleteSocialLink(id: string): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: before } = await db
    .from("social_links")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!before) return fail("That link is already gone.");

  const { error } = await db.from("social_links").delete().eq("id", id);
  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "social_links",
    entityId: id,
    action: "deleted",
    before,
  });

  updateTag(SITE_CONTENT_TAG);
  return ok("Social link deleted.");
}

export async function reorderSocialLinks(ids: string[]): Promise<ActionResult> {
  const { db } = await adminContext();
  const parsed = reorderSchema.safeParse({ ids });
  if (!parsed.success) return fail("Could not read the new order.");

  for (const [index, id] of parsed.data.ids.entries()) {
    const { error } = await db
      .from("social_links")
      .update({ sort_order: index })
      .eq("id", id);
    if (error) return fail(describeDbError(error));
  }

  updateTag(SITE_CONTENT_TAG);
  return ok("Order saved.");
}

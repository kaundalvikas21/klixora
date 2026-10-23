"use server";

import { updateTag } from "next/cache";
import { adminContext, describeDbError } from "@/server/actions/_client";
import { writeAudit } from "@/server/audit";
import { SITE_CONTENT_TAG } from "@/server/content";
import { seoDefaultsSchema, seoMetaSchema } from "@/lib/schemas/seo";
import { fail, fieldErrorsFrom, ok, type ActionResult } from "@/server/actions/result";

export async function saveSeoMeta(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = seoMetaSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Some fields need attention.", fieldErrorsFrom(parsed.error.issues));
  }

  const input = parsed.data;
  const row = {
    page_slug: input.pageSlug,
    path: input.path,
    meta_title: input.metaTitle,
    meta_description: input.metaDescription,
    canonical_url: input.canonicalUrl || null,
    robots: input.robots,
    og_title: input.ogTitle || null,
    og_description: input.ogDescription || null,
    og_image_url: input.ogImageUrl || null,
    twitter_card: input.twitterCard,
    focus_keywords: input.focusKeywords,
    schema_type: input.schemaType || null,
  };

  const { data: before } = await db
    .from("seo_meta")
    .select("*")
    .eq("page_slug", input.pageSlug)
    .maybeSingle();

  const { data: after, error } = await db
    .from("seo_meta")
    .upsert(row, { onConflict: "page_slug" })
    .select("*")
    .maybeSingle();

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: `seo_meta:${input.pageSlug}`,
    entityId: after?.id ?? null,
    action: before ? "updated" : "created",
    before,
    after,
  });

  // SEO has no draft stage: a meta description is published the moment it is
  // saved, so the tag is invalidated right away.
  updateTag(SITE_CONTENT_TAG);
  return ok("Saved. generateMetadata on that route reads this row.");
}

export async function saveSeoDefaults(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = seoDefaultsSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Check the defaults.", fieldErrorsFrom(parsed.error.issues));
  }

  const row = {
    title_template: parsed.data.titleTemplate,
    default_og_image: parsed.data.defaultOgImage || null,
    twitter_handle: parsed.data.twitterHandle || null,
    sitemap_url: parsed.data.sitemapUrl || null,
  };

  const { data: before } = await db.from("seo_defaults").select("*").limit(1).maybeSingle();

  const { data: after, error } = before
    ? await db.from("seo_defaults").update(row).eq("id", before.id).select("*").maybeSingle()
    : await db.from("seo_defaults").insert(row).select("*").maybeSingle();

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "seo_defaults",
    entityId: after?.id ?? null,
    action: before ? "updated" : "created",
    before,
    after,
  });

  updateTag(SITE_CONTENT_TAG);
  return ok("Site-wide defaults saved.");
}

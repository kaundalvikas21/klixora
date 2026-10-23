"use server";

import { updateTag } from "next/cache";
import { adminContext, describeDbError } from "@/server/actions/_client";
import { writeAudit } from "@/server/audit";
import { SITE_CONTENT_TAG } from "@/server/content";
import { SECTION_KEYS } from "@/lib/schemas/content";
import { fail, ok, type ActionResult } from "@/server/actions/result";

/**
 * The top bar's Publish button. Copies every home section's draft over its
 * published payload, so the live page never shows a half-published set.
 */
export async function publishAll(): Promise<ActionResult<number>> {
  const { admin, db } = await adminContext();

  const { data: sections, error: readError } = await db
    .from("page_sections")
    .select("*")
    .eq("page_slug", "home");

  if (readError) return fail(describeDbError(readError));

  const keys: readonly string[] = SECTION_KEYS;
  const pending = (sections ?? []).filter(
    (section) =>
      keys.includes(section.section_key) &&
      JSON.stringify(section.draft) !== JSON.stringify(section.published ?? null),
  );

  if (!pending.length) {
    updateTag(SITE_CONTENT_TAG);
    return ok("Nothing to publish. The live page already matches every draft.", 0);
  }

  const now = new Date().toISOString();

  for (const section of pending) {
    const { error } = await db
      .from("page_sections")
      .update({
        published: section.draft,
        published_at: now,
        updated_by_id: admin.id,
      })
      .eq("id", section.id);

    if (error) return fail(describeDbError(error));

    await writeAudit({
      actorId: admin.id,
      entity: `page_sections:${section.section_key}`,
      entityId: section.id,
      action: "published",
      before: (section.published ?? null) as Record<string, unknown> | null,
      after: section.draft as Record<string, unknown>,
    });
  }

  updateTag(SITE_CONTENT_TAG);
  return ok(
    `Published ${pending.length} section${pending.length === 1 ? "" : "s"}.`,
    pending.length,
  );
}

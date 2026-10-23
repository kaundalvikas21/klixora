"use server";

import { updateTag } from "next/cache";
import { adminContext, describeDbError } from "@/server/actions/_client";
import { writeAudit } from "@/server/audit";
import { SITE_CONTENT_TAG } from "@/server/content";
import {
  contactPromiseSchema,
  formStepSchema,
  heroCtaSchema,
  reorderSchema,
  sectionSchemas,
  serviceSchema,
  type SectionKey,
} from "@/lib/schemas/content";
import { fail, fieldErrorsFrom, ok, type ActionResult } from "@/server/actions/result";
import type { Json } from "@/lib/database.types";

/**
 * Writes for the Home Page CMS.
 *
 * Two different publish models, deliberately not collapsed into one:
 *
 *  - Section copy lives in page_sections as a draft/published pair. "Save
 *    draft" writes `draft`; "Save & publish" copies draft into published.
 *  - Structured rows (services, CTAs, promises, form steps) publish on save,
 *    because their visibility is governed by `status` + `is_visible` rather
 *    than by a draft payload.
 *
 * Every write that changes what the public site renders calls updateTag, so
 * the next read of the live page is fresh rather than stale-while-revalidate.
 */
const PAGE = "home";

function revalidateSite() {
  // updateTag rather than revalidateTag: the operator is about to look at the
  // live site, so they need read-your-own-writes, not eventual freshness.
  updateTag(SITE_CONTENT_TAG);
}

// ---------------------------------------------------------------------------
// Section copy
// ---------------------------------------------------------------------------

export async function saveSection(
  sectionKey: SectionKey,
  payload: unknown,
  publish: boolean,
): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const schema = sectionSchemas[sectionKey];
  if (!schema) return fail(`Unknown section "${sectionKey}".`);

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return fail(
      "Some fields need attention before this can be saved.",
      fieldErrorsFrom(parsed.error.issues),
    );
  }

  const draft = parsed.data as unknown as NonNullable<Json>;

  const { data: before } = await db
    .from("page_sections")
    .select("*")
    .eq("page_slug", PAGE)
    .eq("section_key", sectionKey)
    .maybeSingle();

  const { error } = await db.from("page_sections").upsert(
    {
      page_slug: PAGE,
      section_key: sectionKey,
      draft,
      ...(publish ? { published: draft, published_at: new Date().toISOString() } : {}),
      updated_by_id: admin.id,
    },
    { onConflict: "page_slug,section_key" },
  );

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: `page_sections:${sectionKey}`,
    entityId: before?.id ?? null,
    action: publish ? "published" : "updated",
    before: (before?.draft ?? null) as Record<string, unknown> | null,
    after: parsed.data as Record<string, unknown>,
  });

  if (publish) revalidateSite();

  return ok(publish ? "Published. The live page is updated." : "Draft saved.");
}

/** Publishes an already-saved draft without re-sending the payload. */
export async function publishSection(sectionKey: SectionKey): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: section } = await db
    .from("page_sections")
    .select("*")
    .eq("page_slug", PAGE)
    .eq("section_key", sectionKey)
    .maybeSingle();

  if (!section) return fail("There is nothing saved for this section yet.");

  const { error } = await db
    .from("page_sections")
    .update({
      published: section.draft,
      published_at: new Date().toISOString(),
      updated_by_id: admin.id,
    })
    .eq("id", section.id);

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: `page_sections:${sectionKey}`,
    entityId: section.id,
    action: "published",
    before: (section.published ?? null) as Record<string, unknown> | null,
    after: section.draft as Record<string, unknown>,
  });

  revalidateSite();
  return ok("Published.");
}

export async function discardSectionDraft(
  sectionKey: SectionKey,
): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: section } = await db
    .from("page_sections")
    .select("*")
    .eq("page_slug", PAGE)
    .eq("section_key", sectionKey)
    .maybeSingle();

  if (!section?.published) return fail("There is no published version to go back to.");

  const { error } = await db
    .from("page_sections")
    .update({ draft: section.published, updated_by_id: admin.id })
    .eq("id", section.id);

  if (error) return fail(describeDbError(error));
  return ok("Draft reset to the published version.");
}

// ---------------------------------------------------------------------------
// Shared helpers for the structured-row tables
// ---------------------------------------------------------------------------

type OrderedTable = "hero_ctas" | "services" | "contact_promises" | "social_links";

async function nextSortOrder(
  db: Awaited<ReturnType<typeof adminContext>>["db"],
  table: OrderedTable,
): Promise<number> {
  const { data } = await db
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.sort_order ?? -1) + 1;
}

// ---------------------------------------------------------------------------
// Hero CTAs
// ---------------------------------------------------------------------------

export async function saveHeroCta(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = heroCtaSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Check the CTA fields.", fieldErrorsFrom(parsed.error.issues));
  }

  const { id, label, href, variant, openNewTab, isVisible } = parsed.data;
  const row = {
    label,
    href,
    variant,
    open_new_tab: openNewTab,
    is_visible: isVisible,
  };

  if (id) {
    const { data: before } = await db.from("hero_ctas").select("*").eq("id", id).maybeSingle();
    const { data: after, error } = await db
      .from("hero_ctas")
      .update(row)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "hero_ctas",
      entityId: id,
      action: "updated",
      before,
      after,
    });
  } else {
    const { data: created, error } = await db
      .from("hero_ctas")
      .insert({ ...row, sort_order: await nextSortOrder(db, "hero_ctas") })
      .select("*")
      .single();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "hero_ctas",
      entityId: created.id,
      action: "created",
      after: created,
    });
  }

  revalidateSite();
  return ok("CTA saved.");
}

export async function deleteHeroCta(id: string): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: before } = await db.from("hero_ctas").select("*").eq("id", id).maybeSingle();
  if (!before) return fail("That CTA is already gone.");

  const { error } = await db.from("hero_ctas").delete().eq("id", id);
  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "hero_ctas",
    entityId: id,
    action: "deleted",
    before,
  });

  revalidateSite();
  return ok("CTA deleted.");
}

/**
 * Reorder writes one row per position. PostgREST has no multi-row update
 * with different values, and an upsert would need every column, so this is
 * the honest shape. The lists are short enough that it does not matter.
 */
async function applyOrder(
  db: Awaited<ReturnType<typeof adminContext>>["db"],
  table: OrderedTable,
  ids: string[],
): Promise<string | null> {
  const results = await Promise.all(
    ids.map((id, index) => db.from(table).update({ sort_order: index }).eq("id", id)),
  );
  const failed = results.find((result) => result.error);
  return failed?.error ? describeDbError(failed.error) : null;
}

export async function reorderHeroCtas(ids: string[]): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = reorderSchema.safeParse({ ids });
  if (!parsed.success) return fail("Could not read the new order.");

  const error = await applyOrder(db, "hero_ctas", parsed.data.ids);
  if (error) return fail(error);

  await writeAudit({
    actorId: admin.id,
    entity: "hero_ctas",
    action: "updated",
    after: { order: parsed.data.ids },
  });

  revalidateSite();
  return ok("Order saved.");
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function saveService(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = serviceSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Check the service fields.", fieldErrorsFrom(parsed.error.issues));
  }

  const { id, kicker, title, description, icon, href, status, isVisible } = parsed.data;
  const row = {
    kicker,
    title,
    description,
    icon,
    href: href || null,
    status,
    is_visible: isVisible,
  };

  if (id) {
    const { data: before } = await db.from("services").select("*").eq("id", id).maybeSingle();
    const { data: after, error } = await db
      .from("services")
      .update(row)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "services",
      entityId: id,
      action: "updated",
      before,
      after,
    });
  } else {
    const { data: created, error } = await db
      .from("services")
      .insert({ ...row, sort_order: await nextSortOrder(db, "services") })
      .select("*")
      .single();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "services",
      entityId: created.id,
      action: "created",
      after: created,
    });
  }

  revalidateSite();
  return ok("Service saved.");
}

/**
 * Hiding a service also takes it out of LIVE. The brief is explicit about
 * this: an invisible card should not sit in the table claiming to be live.
 */
export async function setServiceVisible(
  id: string,
  isVisible: boolean,
): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: before } = await db.from("services").select("*").eq("id", id).maybeSingle();
  if (!before) return fail("That service no longer exists.");

  const { data: after, error } = await db
    .from("services")
    .update({ is_visible: isVisible, ...(isVisible ? {} : { status: "DRAFT" as const }) })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "services",
    entityId: id,
    action: "updated",
    before,
    after,
  });

  revalidateSite();
  return ok(isVisible ? "Service shown." : "Service hidden and moved to draft.");
}

export async function setServiceStatus(
  id: string,
  status: "DRAFT" | "LIVE",
): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: before } = await db.from("services").select("*").eq("id", id).maybeSingle();
  if (!before) return fail("That service no longer exists.");

  const { data: after, error } = await db
    .from("services")
    // Going live implies being visible, otherwise the status would lie.
    .update({ status, ...(status === "LIVE" ? { is_visible: true } : {}) })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "services",
    entityId: id,
    action: status === "LIVE" ? "published" : "updated",
    before,
    after,
  });

  revalidateSite();
  return ok(status === "LIVE" ? "Service is live." : "Service moved to draft.");
}

export async function deleteService(id: string): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: before } = await db.from("services").select("*").eq("id", id).maybeSingle();
  if (!before) return fail("That service is already gone.");

  const { error } = await db.from("services").delete().eq("id", id);
  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "services",
    entityId: id,
    action: "deleted",
    before,
  });

  revalidateSite();
  return ok("Service deleted.");
}

export async function reorderServices(ids: string[]): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = reorderSchema.safeParse({ ids });
  if (!parsed.success) return fail("Could not read the new order.");

  const error = await applyOrder(db, "services", parsed.data.ids);
  if (error) return fail(error);

  await writeAudit({
    actorId: admin.id,
    entity: "services",
    action: "updated",
    after: { order: parsed.data.ids },
  });

  revalidateSite();
  return ok("Order saved.");
}

// ---------------------------------------------------------------------------
// Contact promises
// ---------------------------------------------------------------------------

export async function saveContactPromise(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = contactPromiseSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Check the promise text.", fieldErrorsFrom(parsed.error.issues));
  }

  const { id, body } = parsed.data;

  if (id) {
    const { data: before } = await db
      .from("contact_promises")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    const { data: after, error } = await db
      .from("contact_promises")
      .update({ body })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "contact_promises",
      entityId: id,
      action: "updated",
      before,
      after,
    });
  } else {
    const { data: created, error } = await db
      .from("contact_promises")
      .insert({ body, sort_order: await nextSortOrder(db, "contact_promises") })
      .select("*")
      .single();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "contact_promises",
      entityId: created.id,
      action: "created",
      after: created,
    });
  }

  revalidateSite();
  return ok("Promise saved.");
}

export async function deleteContactPromise(id: string): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: before } = await db
    .from("contact_promises")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!before) return fail("That promise is already gone.");

  const { error } = await db.from("contact_promises").delete().eq("id", id);
  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "contact_promises",
    entityId: id,
    action: "deleted",
    before,
  });

  revalidateSite();
  return ok("Promise deleted.");
}

export async function reorderContactPromises(ids: string[]): Promise<ActionResult> {
  const { db } = await adminContext();
  const parsed = reorderSchema.safeParse({ ids });
  if (!parsed.success) return fail("Could not read the new order.");

  const error = await applyOrder(db, "contact_promises", parsed.data.ids);
  if (error) return fail(error);

  revalidateSite();
  return ok("Order saved.");
}

// ---------------------------------------------------------------------------
// Form steps
// ---------------------------------------------------------------------------

export async function saveFormStep(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = formStepSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(
      "Check the step's question and fields.",
      fieldErrorsFrom(parsed.error.issues),
    );
  }

  const { id, question, fields } = parsed.data;

  if (id) {
    const { data: before } = await db.from("form_steps").select("*").eq("id", id).maybeSingle();
    const { data: after, error } = await db
      .from("form_steps")
      .update({ question, fields: fields as unknown as NonNullable<Json> })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "form_steps",
      entityId: id,
      action: "updated",
      before,
      after,
    });
  } else {
    const { data: last } = await db
      .from("form_steps")
      .select("step_number")
      .order("step_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: created, error } = await db
      .from("form_steps")
      .insert({
        step_number: (last?.step_number ?? 0) + 1,
        question,
        fields: fields as unknown as NonNullable<Json>,
      })
      .select("*")
      .single();

    if (error) return fail(describeDbError(error));
    await writeAudit({
      actorId: admin.id,
      entity: "form_steps",
      entityId: created.id,
      action: "created",
      after: created,
    });
  }

  revalidateSite();
  return ok("Step saved.");
}

export async function deleteFormStep(id: string): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: before } = await db.from("form_steps").select("*").eq("id", id).maybeSingle();
  if (!before) return fail("That step is already gone.");

  const { count } = await db.from("form_steps").select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) {
    return fail("The form needs at least one step. Edit this one instead of deleting it.");
  }

  const { error } = await db.from("form_steps").delete().eq("id", id);
  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "form_steps",
    entityId: id,
    action: "deleted",
    before,
  });

  revalidateSite();
  return ok("Step deleted.");
}

/**
 * step_number is unique, so the rows cannot simply be renumbered in place:
 * the first update would collide with an existing row. They are parked on
 * negative numbers first, then written to their final positions.
 */
export async function reorderFormSteps(ids: string[]): Promise<ActionResult> {
  const { db } = await adminContext();
  const parsed = reorderSchema.safeParse({ ids });
  if (!parsed.success) return fail("Could not read the new order.");

  for (const [index, id] of parsed.data.ids.entries()) {
    const { error } = await db
      .from("form_steps")
      .update({ step_number: -(index + 1) })
      .eq("id", id);
    if (error) return fail(describeDbError(error));
  }

  for (const [index, id] of parsed.data.ids.entries()) {
    const { error } = await db
      .from("form_steps")
      .update({ step_number: index + 1 })
      .eq("id", id);
    if (error) return fail(describeDbError(error));
  }

  revalidateSite();
  return ok("Order saved.");
}

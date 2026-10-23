"use server";

import { revalidatePath } from "next/cache";
import { adminContext, describeDbError } from "@/server/actions/_client";
import { writeAudit } from "@/server/audit";
import {
  leadBulkSchema,
  leadNoteSchema,
  leadStatusSchema,
} from "@/lib/schemas/leads";
import { fail, fieldErrorsFrom, ok, type ActionResult } from "@/server/actions/result";

/**
 * Lead writes. These never touch the `site-content` tag: nothing a lead does
 * changes the public page. They revalidate /admin/leads instead, so a status
 * change shows in the counts without a reload.
 */
const LEADS_PATH = "/admin/leads";

/**
 * Moving a lead out of NEW stamps first_reply_at once, which is what the
 * "Replied in time" tile measures against the SLA.
 */
export async function setLeadStatus(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = leadStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Unknown status.", fieldErrorsFrom(parsed.error.issues));
  }

  const { id, status } = parsed.data;

  const { data: before } = await db.from("leads").select("*").eq("id", id).maybeSingle();
  if (!before) return fail("That lead no longer exists.");
  if (before.status === status) return ok("Already there.");

  const { data: after, error } = await db
    .from("leads")
    .update({
      status,
      first_reply_at:
        before.first_reply_at ?? (status === "NEW" ? null : new Date().toISOString()),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return fail(describeDbError(error));

  await db.from("lead_notes").insert({
    lead_id: id,
    author_id: admin.id,
    kind: "event",
    body: `Status moved from ${before.status} to ${status}.`,
  });

  await writeAudit({
    actorId: admin.id,
    entity: "leads",
    entityId: id,
    action: "updated",
    before,
    after,
  });

  revalidatePath(LEADS_PATH);
  return ok(`Moved to ${status.toLowerCase()}.`);
}

export async function addLeadNote(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = leadNoteSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("The note cannot be empty.", fieldErrorsFrom(parsed.error.issues));
  }

  const { data: created, error } = await db
    .from("lead_notes")
    .insert({
      lead_id: parsed.data.leadId,
      author_id: admin.id,
      body: parsed.data.body,
      kind: "note",
    })
    .select("*")
    .single();

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "lead_notes",
    entityId: created.id,
    action: "created",
    after: created,
  });

  revalidatePath(LEADS_PATH);
  return ok("Note added.");
}

export async function assignLead(
  id: string,
  assignedToId: string | null,
): Promise<ActionResult> {
  const { admin, db } = await adminContext();

  const { data: before } = await db.from("leads").select("*").eq("id", id).maybeSingle();
  if (!before) return fail("That lead no longer exists.");

  const { data: after, error } = await db
    .from("leads")
    .update({ assigned_to_id: assignedToId || null })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return fail(describeDbError(error));

  await writeAudit({
    actorId: admin.id,
    entity: "leads",
    entityId: id,
    action: "updated",
    before,
    after,
  });

  revalidatePath(LEADS_PATH);
  return ok(assignedToId ? "Lead assigned." : "Assignment cleared.");
}

export async function bulkUpdateLeads(payload: unknown): Promise<ActionResult> {
  const { admin, db } = await adminContext();
  const parsed = leadBulkSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("Nothing selected.", fieldErrorsFrom(parsed.error.issues));
  }

  const { ids, action, assignedToId } = parsed.data;

  if (action === "assign") {
    const { error } = await db
      .from("leads")
      .update({ assigned_to_id: assignedToId || null })
      .in("id", ids);
    if (error) return fail(describeDbError(error));
  } else {
    const status = action === "contacted" ? "CONTACTED" : "LOST";

    // Only stamp a first reply on leads that have never had one.
    const { error: stampError } = await db
      .from("leads")
      .update({ first_reply_at: new Date().toISOString() })
      .in("id", ids)
      .is("first_reply_at", null);
    if (stampError) return fail(describeDbError(stampError));

    const { error } = await db.from("leads").update({ status }).in("id", ids);
    if (error) return fail(describeDbError(error));

    await db.from("lead_notes").insert(
      ids.map((leadId) => ({
        lead_id: leadId,
        author_id: admin.id,
        kind: "event",
        body: `Bulk action: moved to ${status}.`,
      })),
    );
  }

  await writeAudit({
    actorId: admin.id,
    entity: "leads",
    action: "updated",
    after: { bulk: action, ids, assignedToId },
  });

  revalidatePath(LEADS_PATH);
  return ok(`${ids.length} lead${ids.length === 1 ? "" : "s"} updated.`);
}

/** CSV for the current filter. Returned as a string the client downloads. */
export async function exportLeadsCsv(ids?: string[]): Promise<ActionResult<string>> {
  const { db } = await adminContext();

  let query = db.from("leads").select("*").order("created_at", { ascending: false }).limit(5000);
  if (ids?.length) query = query.in("id", ids);

  const { data, error } = await query;
  if (error) return fail(describeDbError(error));

  const columns = [
    "ref",
    "status",
    "fit_score",
    "first_name",
    "last_name",
    "company",
    "email",
    "phone",
    "goal",
    "budget_band",
    "source",
    "message",
    "created_at",
  ] as const;

  /**
   * RFC 4180 quoting, and a leading apostrophe on anything a spreadsheet
   * would evaluate as a formula. A lead's message field is attacker-supplied
   * text, and `=HYPERLINK(...)` in a CSV is a real exfiltration path.
   */
  const cell = (value: unknown) => {
    const raw = String(value ?? "");
    const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const rows = data ?? [];
  const csv = [
    columns.join(","),
    ...rows.map((lead) => columns.map((column) => cell(lead[column])).join(",")),
  ].join("\r\n");

  return ok(`${rows.length} leads exported.`, csv);
}

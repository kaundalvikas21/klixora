import { adminClient } from "@/server/supabase";
import type { Json } from "@/lib/database.types";

/**
 * Every create, update, delete and publish leaves an audit_log row with a
 * field-level diff.
 *
 * Written with the service role on purpose: the RLS policy lets an admin
 * read the log and nothing else, so the trail cannot be edited by the person
 * it is recording. Writing it must never be able to fail the operation it
 * describes, so the insert is wrapped and only logged on failure.
 */
export type AuditAction = "created" | "updated" | "deleted" | "published";

type Record_ = Record<string, unknown>;

/** Shallow field-level diff: { field: { from, to } } for changed keys only. */
export function diffOf(before: Record_ | null, after: Record_ | null) {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);

  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of keys) {
    if (key === "updated_at" || key === "updatedAt" || key === "id") continue;
    const from = (before ?? {})[key];
    const to = (after ?? {})[key];
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      diff[key] = { from, to };
    }
  }
  return diff;
}

export async function writeAudit(entry: {
  actorId?: string | null;
  entity: string;
  entityId?: string | null;
  action: AuditAction;
  before?: Record_ | null;
  after?: Record_ | null;
}) {
  const db = adminClient();
  if (!db) return;

  const diff =
    entry.before || entry.after ? diffOf(entry.before ?? null, entry.after ?? null) : null;

  try {
    await db.from("audit_log").insert({
      actor_id: entry.actorId ?? null,
      entity: entry.entity,
      entity_id: entry.entityId ?? null,
      action: entry.action,
      diff: diff && Object.keys(diff).length ? (diff as Json) : null,
    });
  } catch (error) {
    console.error("[audit] could not record", entry.entity, entry.action, error);
  }
}

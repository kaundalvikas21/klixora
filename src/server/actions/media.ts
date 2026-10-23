"use server";

import { adminContext } from "@/server/actions/_client";
import { requireAdminClient } from "@/server/supabase";
import { writeAudit } from "@/server/audit";
import { fail, ok, type ActionResult } from "@/server/actions/result";

/**
 * Image uploads go to Supabase Storage.
 *
 * Type and size are checked here as well as on the bucket, because an error
 * from a Server Action can explain itself and a rejected upload cannot.
 * The service-role client does the write: a storage policy already restricts
 * the bucket to admins, and this call has already proved the caller is one.
 */
const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

export type UploadedMedia = { url: string; alt: string };

export async function uploadMedia(
  formData: FormData,
): Promise<ActionResult<UploadedMedia>> {
  const { admin, db } = await adminContext();

  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").slice(0, 200);

  if (!(file instanceof File) || file.size === 0) {
    return fail("Choose a file to upload.");
  }
  if (!ALLOWED.has(file.type)) {
    return fail("Upload a PNG, JPEG, WebP, AVIF or SVG image.");
  }
  if (file.size > MAX_BYTES) {
    return fail(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 4MB.`,
    );
  }

  let storage;
  try {
    storage = requireAdminClient();
  } catch {
    return fail(
      "Image storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY, then try again.",
    );
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "media";
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  // Content-addressed enough to avoid collisions without leaking the
  // original filename into a public URL.
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${extension}`;

  const { error } = await storage.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    console.error("[media] upload failed:", error.message);
    return fail("The upload did not complete. Try again in a moment.");
  }

  const {
    data: { publicUrl },
  } = storage.storage.from(bucket).getPublicUrl(path);

  const { data: created } = await db
    .from("media")
    .insert({
      url: publicUrl,
      alt: alt || null,
      bytes: file.size,
      uploaded_by_id: admin.id,
    })
    .select("*")
    .maybeSingle();

  await writeAudit({
    actorId: admin.id,
    entity: "media",
    entityId: created?.id ?? null,
    action: "created",
    after: created,
  });

  return ok("Uploaded.", { url: publicUrl, alt });
}

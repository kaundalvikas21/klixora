import { requireAdmin, type Admin } from "@/server/auth";
import { userClient, type Db } from "@/server/supabase";

/**
 * Every admin write starts here: prove who is asking, then hand back a
 * client carrying their session so the row level security policies decide
 * what the write is allowed to touch.
 */
export async function adminContext(): Promise<{ admin: Admin; db: Db }> {
  const admin = await requireAdmin();
  const db = await userClient();
  if (!db) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return { admin, db };
}

/**
 * Turns a PostgREST error into something an operator can act on.
 *
 * A policy violation arrives as 42501 or an empty result, which reads like a
 * bug unless it is named for what it is.
 */
export function describeDbError(error: { code?: string; message: string }): string {
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return "Your account is not on the admin list, so the database refused that write.";
  }
  if (error.code === "23505") {
    return "Something with that name or position already exists.";
  }
  if (error.code === "23514") {
    return "The database rejected those values. Check the opening and closing times.";
  }
  console.error("[db]", error.code, error.message);
  return "The database refused that write. Try again, and check the server log.";
}

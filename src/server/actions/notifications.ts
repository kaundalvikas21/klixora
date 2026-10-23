"use server";

import { adminContext, describeDbError } from "@/server/actions/_client";
import { fail, ok, type ActionResult } from "@/server/actions/result";

/**
 * Mark every lead notification as seen, for the operator doing the asking.
 *
 * Goes through the mark_notifications_seen() definer function rather than an
 * update: admin_users has no update policy on purpose, because `role` and
 * membership are not things an admin may edit. The function writes one column
 * on one row, chosen by auth.uid(), so there is no id to tamper with and no
 * way to clear somebody else's bell.
 *
 * No revalidate. The bell polls and refetches on its own; reloading every
 * cached admin payload because somebody dismissed a badge would be the most
 * expensive thing on this screen.
 */
export async function markNotificationsSeen(): Promise<ActionResult<string>> {
  const { db } = await adminContext();

  const { data, error } = await db.rpc("mark_notifications_seen");

  if (error) return fail(describeDbError(error));
  // No row came back: the session is valid but the account is no longer on
  // the admin list, which is a sign-out, not a failed button.
  if (!data) return fail("Your account is no longer on the admin list.");

  return ok("All caught up.", data);
}

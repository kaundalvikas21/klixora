"use server";

import { userClient } from "@/server/supabase";
import { ADMIN_HOME } from "@/lib/routes";
import { fail, ok, type ActionResult } from "@/server/actions/result";

/**
 * Sign in and out, as Server Actions.
 *
 * Doing it on the server rather than from the browser is what lets
 * @supabase/ssr write the session cookie with httpOnly set, so the access
 * token is never readable from JavaScript.
 *
 * Both return a result rather than redirecting. A redirect inside the action
 * would fire whether or not the sign-out succeeded, which is the worst
 * outcome available: the operator is shown the login screen while their
 * session is still live on the server. The caller navigates only once the
 * action says it actually worked.
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<ActionResult<{ redirectTo: string }>> {
  const supabase = await userClient();
  if (!supabase) {
    return fail(
      "Supabase is not configured. Run `npm run db:start` and copy the keys into .env.local.",
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  // Deliberately the same message whether the email is unknown or the
  // password is wrong: telling them apart is a free account-enumeration
  // oracle.
  if (error || !data.user) {
    return fail("That email and password did not match.");
  }

  // Signing in is not the same as being an admin. Someone with an Auth
  // account but no admin_users row gets signed straight back out, rather
  // than landing on a shell where every query silently returns nothing.
  const { data: row } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!row) {
    await supabase.auth.signOut();
    return fail("That account is not an admin on this site.");
  }

  return ok("Signed in.", { redirectTo: ADMIN_HOME });
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = await userClient();

  // No client means no session to end. Report it as done rather than
  // stranding the operator on a button that never resolves.
  if (!supabase) return ok("Signed out.");

  // scope "local", not Supabase's default of "global". Global revokes every
  // refresh token the operator holds, so signing out on a phone would also
  // end the session on their desktop mid-edit. Sign out means this browser.
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    console.error("[auth] sign out failed:", error.message);
    return fail("Could not sign you out. Check your connection and try again.");
  }

  return ok("Signed out.");
}

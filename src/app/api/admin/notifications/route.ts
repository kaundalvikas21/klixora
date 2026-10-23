import { currentAdmin } from "@/server/auth";
import { getLeadNotifications } from "@/server/admin";

/**
 * What the header bell polls.
 *
 * A route handler rather than a Server Action: this is a read, it runs on a
 * timer, and a GET can be cancelled by the browser when the tab goes away.
 * Server Actions are POSTs and are queued one at a time, so a slow poll would
 * sit in front of the operator's next save.
 *
 * Authorisation is the same boundary as everywhere else: currentAdmin()
 * verifies the session against the Auth server, and the query underneath runs
 * under the operator's own row level security.
 */
export async function GET() {
  const admin = await currentAdmin();

  if (!admin) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const data = await getLeadNotifications(admin.id);
    return Response.json(data, {
      // Never let a CDN or the browser hold on to one operator's unread
      // count. This is per-session data on a shared hostname.
      headers: { "cache-control": "private, no-store" },
    });
  } catch (error) {
    console.error("[notifications] route", error);
    return Response.json({ error: "Could not read notifications." }, { status: 500 });
  }
}

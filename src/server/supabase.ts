import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Three clients, three different privilege levels. Picking the right one is
 * the whole security story of this app, so they are not interchangeable:
 *
 *   publicClient  anon key, no session. Row level security applies with the
 *                 `anon` role, so it sees published, visible content and
 *                 nothing else. Safe inside a `'use cache'` scope because it
 *                 reads no cookies.
 *
 *   userClient    anon key plus the operator's session cookie. Policies run
 *                 as `authenticated`, and is_admin() decides what they can
 *                 touch. Every admin read and write goes through this, which
 *                 is what makes the policies load-bearing rather than
 *                 decorative.
 *
 *   adminClient   service role, bypasses RLS entirely. Deliberately rare:
 *                 minting a lead reference needs to count rows the anon role
 *                 cannot see, the audit log is append-only to everyone else,
 *                 and storage uploads need the service key.
 */
export type Db = SupabaseClient<Database>;

function env(name: string): string | null {
  return process.env[name] ?? null;
}

/**
 * The browser-safe key, under either of the two names the Supabase CLI has
 * printed for it. It renamed ANON_KEY to PUBLISHABLE_KEY, and the value
 * changed shape with it (a JWT became sb_publishable_...), but it is the same
 * key doing the same job: the one row level security treats as `anon`.
 *
 * Reading both means a project that was set up before the rename and one set
 * up after it both work, and `supabase status` can be copied in verbatim
 * either way. The references are written out rather than looked up by name,
 * because that is what lets Next inline a NEXT_PUBLIC_ value at build time.
 */
export function anonKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    null
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env("NEXT_PUBLIC_SUPABASE_URL") && anonKey());
}

/** Null when Supabase is not configured. Callers must handle that. */
export function publicClient(): Db | null {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = anonKey();
  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** The signed-in operator's client. Reads and writes under their own RLS. */
export async function userClient(): Promise<Db | null> {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = anonKey();
  if (!url || !key) return null;

  // Supabase's auth client reads Date.now() while loading the session, which
  // Cache Components rejects during the static-shell prerender pass. Nothing
  // here can be prerendered anyway, since it all depends on the operator's
  // cookie, so say so explicitly rather than letting every /admin request log
  // a bail-out.
  await connection();

  const store = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            store.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. The proxy refreshes the
          // session on every admin request, so losing the write here only
          // means this render did not get to rotate the token.
        }
      },
    },
  });
}

/** Service role. Never reachable from the browser. */
export function adminClient(): Db | null {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** For writes, where there is nothing sensible to fall back to. */
export function requireAdminClient(): Db {
  const client = adminClient();
  if (!client) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Copy it from `npx supabase status`.",
    );
  }
  return client;
}

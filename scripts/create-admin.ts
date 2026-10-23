/**
 * Creates (or resets) the admin operator.
 *
 *   npm run db:admin
 *
 * Goes through the Auth Admin API rather than inserting into auth.users, so
 * the same command works against the local stack and a hosted project. The
 * Auth user is the identity; the row in public.admin_users is the allowlist
 * that is_admin() checks, and therefore what every RLS policy depends on.
 *
 * Pass --only to revoke every other admin, so ADMIN_EMAIL becomes the single
 * operator:
 *
 *   npm run db:admin -- --only
 *
 * Without it the command only ever adds or resets, which means a rotated
 * password can quietly leave the previous account working.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME ?? "Klixora Admin";

function fail(message: string): never {
  console.error(`[db:admin] ${message}`);
  process.exit(1);
}

if (!url || !serviceKey) {
  fail("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
}
if (!email || !password) {
  fail("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local.");
}
if (password.length < 8) {
  fail("ADMIN_PASSWORD needs at least 8 characters.");
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  // listUsers rather than a lookup by email: the Admin API has no
  // get-by-email, and the operator count here is single digits.
  const { data: existing, error: listError } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listError) fail(`could not list users: ${listError.message}`);

  const found = existing.users.find((user) => user.email?.toLowerCase() === email);

  let userId: string;

  if (found) {
    const { error } = await admin.auth.admin.updateUserById(found.id, { password });
    if (error) fail(`could not reset the password: ${error.message}`);
    userId = found.id;
    console.log(`[db:admin] password reset for ${email}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      // No inbox to confirm from on a local stack, and the operator is
      // created by hand rather than signing themselves up.
      email_confirm: true,
    });
    if (error || !data.user) fail(`could not create the user: ${error?.message}`);
    userId = data.user.id;
    console.log(`[db:admin] created ${email}`);
  }

  const { error: rowError } = await admin
    .from("admin_users")
    .upsert({ id: userId, email, name, role: "ADMIN" }, { onConflict: "id" });

  if (rowError) fail(`could not add the admin_users row: ${rowError.message}`);

  const others = existing.users.filter((user) => user.id !== userId);

  if (process.argv.includes("--only")) {
    for (const user of others) {
      await admin.from("admin_users").delete().eq("id", user.id);
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) fail(`could not revoke ${user.email}: ${error.message}`);
      console.log(`[db:admin] revoked ${user.email}`);
    }
  } else if (others.length) {
    console.warn(
      `[db:admin] ${others.length} other account(s) can still sign in: ${others
        .map((user) => user.email)
        .join(", ")}. Re-run with --only to revoke them.`,
    );
  }

  console.log(`[db:admin] ${email} can now sign in at /admin/login`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

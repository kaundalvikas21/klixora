import { redirect } from "next/navigation";
import { userClient } from "@/server/supabase";
import { LOGIN_PATH } from "@/lib/routes";

/**
 * Admin identity, on Supabase Auth.
 *
 * Being signed in is not the same as being an admin: the session only proves
 * the Auth user owns the email. `admin_users` is the allowlist, and the same
 * row is what the database's is_admin() checks inside every RLS policy. The
 * two agree because they read the same table.
 */
export { LOGIN_PATH };

export type Admin = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function currentAdmin(): Promise<Admin | null> {
  const supabase = await userClient();
  if (!supabase) return null;

  // getUser, not getSession: getSession reads the cookie without verifying
  // it, so a forged cookie would pass. getUser asks the Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("admin_users")
    .select("id, email, name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}

/**
 * Trust boundary for every admin Server Action. The proxy only does the fast
 * cookie redirect; this is the check that decides, and the database's RLS
 * policies are the backstop behind it.
 */
export async function requireAdmin(): Promise<Admin> {
  const admin = await currentAdmin();
  if (!admin) throw new Error("Not signed in.");
  return admin;
}

/** For layouts and pages: send them to the login screen instead of throwing. */
export async function requireAdminPage(): Promise<Admin> {
  const admin = await currentAdmin();
  if (!admin) redirect(LOGIN_PATH);
  return admin;
}

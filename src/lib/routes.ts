/**
 * Admin route constants.
 *
 * Kept in their own module because client components need them: importing
 * them from server/auth.ts would drag `next/headers` and the Supabase server
 * client into the browser bundle.
 */
export const LOGIN_PATH = "/admin/login";
export const ADMIN_HOME = "/admin";

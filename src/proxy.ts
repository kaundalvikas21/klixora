import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

/**
 * Next 16 renamed `middleware` to `proxy`.
 *
 * This does two things for /admin/* only:
 *
 *  1. Refreshes the Supabase session. Access tokens are short lived and
 *     refresh tokens rotate, and the proxy is the only place in the request
 *     path that can both read and write cookies. A Server Component cannot
 *     set them, so without this the admin would be signed out roughly every
 *     hour.
 *  2. Redirects an unauthenticated request to the login page.
 *
 * It is not the security boundary. The checks that decide are
 * `requireAdmin()` in every Server Action, `requireAdminPage()` in the admin
 * layout, and the row level security policies underneath both.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // With no Supabase configured there is no session to refresh and nobody
  // can sign in anyway. Let the request through so the login page can say so.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value } of toSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser, not getSession: getSession trusts the cookie without checking
  // its signature. This call is also what triggers the token refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === "/admin/login") {
    // Already signed in and sitting on the login page: send them onward.
    if (user) return NextResponse.redirect(new URL("/admin", request.url));
    return response;
  }

  if (!user) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  // Only admin pages. Static assets must never be redirected, and the public
  // site must never pay for a session lookup.
  matcher: ["/admin", "/admin/:path*"],
};

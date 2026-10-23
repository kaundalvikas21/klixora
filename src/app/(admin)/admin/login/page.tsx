import type { Metadata } from "next";
import { AdminBrand } from "@/components/admin/brand";
import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/server/supabase";
import { getSiteSettings } from "@/server/content";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

/** Reads searchParams for the post-login redirect, so nothing to prerender. */
export const instant = false;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const [{ from, error }, settings] = await Promise.all([
    searchParams,
    getSiteSettings(),
  ]);

  return (
    // Centred in the viewport, both axes, at every size.
    <main className="flex min-h-dvh items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-card/70 p-6 shadow-2xl shadow-black/50 sm:p-8">
        <AdminBrand settings={settings} />

        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">
          Sign in
        </h1>

        <LoginForm
          // Only a relative admin path is honoured, so a crafted ?from=
          // cannot bounce someone to another origin after signing in.
          next={from?.startsWith("/admin") ? from : "/admin"}
          initialError={error ? "That email and password did not match." : undefined}
          configured={isSupabaseConfigured()}
        />
      </div>
    </main>
  );
}

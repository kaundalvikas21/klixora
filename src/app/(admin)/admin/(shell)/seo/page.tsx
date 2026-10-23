import type { Metadata } from "next";
import { Database } from "lucide-react";
import { EmptyState } from "@/components/admin/ui/primitives";
import { SeoScreen } from "@/components/admin/seo/seo-screen";
import { getAdminSeo } from "@/server/admin";
import { getSiteSettings } from "@/server/content";
import { isSupabaseConfigured } from "@/server/supabase";

export const metadata: Metadata = {
  title: "SEO & Social",
  robots: { index: false, follow: false },
};

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        icon={<Database size={22} />}
        title="No database connected"
        detail="generateMetadata on every public route reads the seo_meta table. Run `npm run db:start`, then `npm run db:reset`."
      />
    );
  }

  const [{ pages, defaults }, settings] = await Promise.all([
    getAdminSeo(),
    getSiteSettings(),
  ]);

  if (!pages.length) {
    return (
      <EmptyState
        title="No pages in the SEO table"
        detail="Run `npm run db:reset` to load the home page, the two anchor sections and both vertical pages."
      />
    );
  }

  return (
    <SeoScreen
      pages={pages}
      defaults={defaults}
      selectedSlug={page ?? pages[0]!.pageSlug}
      domain={settings.domain}
    />
  );
}

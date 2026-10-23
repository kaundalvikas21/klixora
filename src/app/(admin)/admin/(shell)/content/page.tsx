import type { Metadata } from "next";
import { Database } from "lucide-react";
import { AdminTabs } from "@/components/admin/ui/tabs";
import { Badge, EmptyState } from "@/components/admin/ui/primitives";
import { HeroEditor } from "@/components/admin/content/hero-editor";
import { ServicesEditor } from "@/components/admin/content/services-editor";
import { ContactEditor } from "@/components/admin/content/contact-editor";
import { getAdminHomeContent } from "@/server/admin";
import { getSiteSettings } from "@/server/content";
import { isSupabaseConfigured } from "@/server/supabase";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Home Page CMS",
  robots: { index: false, follow: false },
};

const TABS = [
  { id: "hero", label: "Hero" },
  { id: "services", label: "Core Services" },
  { id: "contact", label: "Contact" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: raw } = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === raw) ? (raw as Tab) : "hero";

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        icon={<Database size={22} />}
        title="No database connected"
        detail="The CMS writes to Supabase. Run `npm run db:start`, copy the printed keys into .env.local, then `npm run db:reset` to load the page's current copy into the tables."
      />
    );
  }

  const [content, settings] = await Promise.all([
    getAdminHomeContent(),
    getSiteSettings(),
  ]);

  const state =
    tab === "hero"
      ? content.heroState
      : tab === "services"
        ? content.servicesState
        : content.contactState;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminTabs tabs={[...TABS]} active={tab} label="Home page sections" />
        <div className="flex items-center gap-2">
          {state.hasUnpublishedChanges ? (
            <Badge tone="draft">Draft ahead of live</Badge>
          ) : (
            <Badge tone="live">Matches live</Badge>
          )}
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            {state.publishedAt
              ? `Published ${formatDateTime(state.publishedAt)}`
              : "Never published"}
          </span>
        </div>
      </div>

      {tab === "hero" ? (
        <HeroEditor initial={content.hero} ctas={content.heroCtas} />
      ) : null}

      {tab === "services" ? (
        <ServicesEditor initial={content.services} items={content.serviceItems} />
      ) : null}

      {tab === "contact" ? (
        <ContactEditor
          initial={content.contact}
          promises={content.promises}
          steps={content.formSteps}
          settings={settings}
        />
      ) : null}
    </div>
  );
}

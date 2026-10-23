import type { Metadata } from "next";
import { Database } from "lucide-react";
import { AdminTabs } from "@/components/admin/ui/tabs";
import { EmptyState } from "@/components/admin/ui/primitives";
import { SettingsForm } from "@/components/admin/settings/identity-tab";
import { HoursTab } from "@/components/admin/settings/hours-tab";
import { SocialTab } from "@/components/admin/settings/social-tab";
import { getAdminSettings } from "@/server/admin";
import { isSupabaseConfigured } from "@/server/supabase";

export const metadata: Metadata = {
  title: "Site Settings",
  robots: { index: false, follow: false },
};

const TABS = [
  { id: "identity", label: "Identity" },
  { id: "contact", label: "Contact details" },
  { id: "hours", label: "Working hours" },
  { id: "social", label: "Social links" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: raw } = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === raw) ? (raw as Tab) : "identity";

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        icon={<Database size={22} />}
        title="No database connected"
        detail="Site Settings is one row in the database and the only copy of every contact detail on the site. Run `npm run db:start`, then `npm run db:reset`."
      />
    );
  }

  const { settings, hours, socials } = await getAdminSettings();

  return (
    <div className="flex flex-col gap-4">
      <AdminTabs tabs={[...TABS]} active={tab} label="Settings sections" />

      {tab === "identity" || tab === "contact" ? (
        <SettingsForm initial={settings} tab={tab} />
      ) : null}

      {tab === "hours" ? <HoursTab initial={hours} /> : null}

      {tab === "social" ? <SocialTab initial={socials} /> : null}
    </div>
  );
}

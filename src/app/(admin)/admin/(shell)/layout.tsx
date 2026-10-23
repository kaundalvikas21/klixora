import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { NavRail } from "@/components/admin/shell/nav-rail";
import { TopBar } from "@/components/admin/shell/top-bar";
import { MobileTabs } from "@/components/admin/shell/mobile-nav";
import { DirtyProvider } from "@/components/admin/shell/dirty";
import { requireAdminPage } from "@/server/auth";
import { isSupabaseConfigured } from "@/server/supabase";
import { getLeadNotifications, getPreflight } from "@/server/admin";
import { getSiteSettings } from "@/server/content";

/**
 * Every admin screen is behind a session cookie and reads the database
 * uncached, so there is no static shell to prerender and nothing worth
 * validating for instant navigation. Set as low as it can go: the public
 * site keeps its prerendering and its validation.
 */
export const instant = false;

/**
 * The admin shell. Lives on its own route group, so none of the public
 * site's header, footer or marketing layout reaches it.
 *
 * This is the real authentication boundary: the proxy refreshes the session
 * and does the fast redirect, while the signature is verified here through
 * getUser() and again in every Server Action through requireAdmin(). Behind
 * both, the row level security policies decide what any query can touch.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage();
  const dbConfigured = isSupabaseConfigured();

  // The logo and brand name come from Site Settings, so uploading a new logo
  // in the admin changes the admin's own chrome, not just the public site.
  const [settings, preflight, notifications] = await Promise.all([
    getSiteSettings(),
    dbConfigured ? getPreflight() : Promise.resolve({ changes: [], warnings: [] }),
    getLeadNotifications(admin.id),
  ]);

  return (
    <DirtyProvider>
      <div className="min-h-dvh bg-ink text-slate-200">
        <NavRail
          adminName={admin.name || admin.email}
          adminEmail={admin.email}
          settings={settings}
        />

        {/* Offset matches the rail: 4.5rem collapsed, 16rem expanded. */}
        <div className="rail:pl-[4.5rem] wide:pl-64">
          <TopBar
            preflight={preflight}
            dbConfigured={dbConfigured}
            settings={settings}
            adminName={admin.name || admin.email}
            adminEmail={admin.email}
            notifications={notifications}
          />

          <main
            id="admin-main"
            // Bottom padding clears the mobile tab bar and the save bar.
            className="px-3 pb-28 pt-4 sm:px-5 sm:pb-24 rail:pb-20"
          >
            {children}
          </main>
        </div>

        <MobileTabs />
      </div>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
        }}
      />
    </DirtyProvider>
  );
}

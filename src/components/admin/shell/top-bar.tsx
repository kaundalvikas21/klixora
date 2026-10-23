"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight, ExternalLink, Upload } from "lucide-react";
import { Badge, Button, buttonVariants } from "@/components/admin/ui/primitives";
import { MobileDrawer } from "@/components/admin/shell/mobile-nav";
import { Notifications } from "@/components/admin/shell/notifications";
import { PublishDialog } from "@/components/admin/shell/publish-dialog";
import { activeNavItem } from "@/components/admin/shell/nav";
import type { LeadNotifications, Preflight } from "@/server/admin";
import type { SiteSettingsView } from "@/server/content";
import { cn } from "@/utils/cn";

/**
 * Top bar on every screen: breadcrumb, page title, the live/build status
 * pill, a link to the public site and the Publish button.
 */
export function TopBar({
  preflight,
  dbConfigured,
  settings,
  adminName,
  adminEmail,
  notifications,
}: {
  preflight: Preflight;
  dbConfigured: boolean;
  settings: SiteSettingsView;
  adminName: string;
  adminEmail: string;
  notifications: LeadNotifications;
}) {
  const pathname = usePathname();
  const active = activeNavItem(pathname);
  const [publishing, setPublishing] = useState(false);

  const pendingCount = preflight.changes.length;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/8 bg-ink/85 backdrop-blur">
        <div className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 sm:px-5">
          <MobileDrawer
            settings={settings}
            adminName={adminName}
            adminEmail={adminEmail}
          />

          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                <li>
                  <Link
                    href="/admin"
                    className="rounded transition-colors hover:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    Klixora Admin
                  </Link>
                </li>
                {active ? (
                  <>
                    <li aria-hidden="true">
                      <ChevronRight size={11} />
                    </li>
                    <li aria-current="page" className="truncate text-slate-300">
                      {active.label}
                    </li>
                  </>
                ) : null}
              </ol>
            </nav>
            <h1 className="mt-0.5 truncate font-display text-base font-bold tracking-tight text-white sm:text-lg">
              {active?.label ?? "Overview"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {dbConfigured ? <Notifications initial={notifications} /> : null}

            {!dbConfigured ? (
              <Badge tone="danger">No database</Badge>
            ) : pendingCount ? (
              <Badge tone="draft">
                {pendingCount} unpublished
              </Badge>
            ) : (
              <Badge tone="live">Live</Badge>
            )}

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              <ExternalLink size={13} /> View site
            </Link>

            {/* Disabled with a reason rather than hidden: a Publish button
                that vanishes makes an operator wonder where it went, and one
                that is always enabled makes "nothing to publish" a surprise
                inside the dialog instead of on the button. */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPublishing(true)}
              disabled={!dbConfigured || pendingCount === 0}
              title={
                !dbConfigured
                  ? "Connect Supabase to publish"
                  : pendingCount === 0
                    ? "Every draft already matches the live page"
                    : `Publish ${pendingCount} pending change${pendingCount === 1 ? "" : "s"}`
              }
            >
              <Upload size={13} /> Publish
              {pendingCount > 0 ? (
                <span className="font-mono text-[10px] tabular-nums">
                  {pendingCount}
                </span>
              ) : null}
            </Button>
          </div>
        </div>
      </header>

      <PublishDialog
        open={publishing}
        onClose={() => setPublishing(false)}
        preflight={preflight}
      />
    </>
  );
}

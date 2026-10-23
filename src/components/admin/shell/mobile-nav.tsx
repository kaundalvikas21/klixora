"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV, NAV_ITEMS, activeNavItem } from "@/components/admin/shell/nav";
import { AdminBrand } from "@/components/admin/brand";
import { SignOutButton } from "@/components/admin/shell/sign-out-button";
import { AdminProfile } from "@/components/admin/shell/admin-profile";
import { useNavGuard } from "@/components/admin/shell/nav-rail";
import { Button } from "@/components/admin/ui/primitives";
import type { SiteSettingsView } from "@/server/content";
import { cn } from "@/utils/cn";

/** Bottom tab bar, below 900px. Primary screens only. */
export function MobileTabs() {
  const pathname = usePathname();
  const active = activeNavItem(pathname);
  const guard = useNavGuard();
  const tabs = NAV_ITEMS.filter((item) => item.primary);

  return (
    <nav
      // Distinct from the rail's landmark: both are in the DOM at once, and
      // two navigations with the same name are indistinguishable when a
      // screen reader lists the page's landmarks.
      aria-label="Primary admin sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-surface/95 backdrop-blur rail:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch">
        {tabs.map((item) => {
          const isActive = active?.href === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                onClick={guard}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-center transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-300",
                  isActive ? "text-cyan-300" : "text-slate-400",
                )}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="font-mono text-[9px] uppercase tracking-[0.12em]">
                  {item.short}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Hamburger plus slide-in drawer, below 900px. Carries every screen. */
export function MobileDrawer({
  settings,
  adminName,
  adminEmail,
}: {
  settings: SiteSettingsView;
  adminName: string;
  adminEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = activeNavItem(pathname);
  const guard = useNavGuard();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="rail:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </Button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-ink/80 backdrop-blur-sm"
          />
          <div
            id="admin-mobile-nav"
            className="fixed inset-y-0 left-0 z-50 flex w-[17rem] max-w-[85vw] flex-col border-r border-white/10 bg-surface"
          >
            <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/8 px-4">
              {/* The same link the rail's brand is. A logo that is clickable
                  on a desktop and inert in the drawer is the kind of
                  difference nobody reads as deliberate. It takes the width
                  the close button leaves, so the whole strip is the target
                  rather than the wordmark's own 150-odd pixels. */}
              <Link
                href="/admin"
                onClick={(event) => {
                  guard(event);
                  if (!event.defaultPrevented) setOpen(false);
                }}
                aria-label={`${settings.brandName} admin home`}
                className="flex min-w-0 flex-1 items-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                <AdminBrand settings={settings} />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              {NAV.map((group) => (
                <div key={group.label} className="mt-5 first:mt-0">
                  <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {group.label}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const isActive = active?.href === item.href;
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            // Closing here rather than in an effect on the
                            // pathname: under Cache Components the panel
                            // stays mounted across navigations, so it has to
                            // be told to close by the thing that navigates.
                            onClick={(event) => {
                              guard(event);
                              if (!event.defaultPrevented) setOpen(false);
                            }}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                              isActive
                                ? "bg-white/[0.07] text-white"
                                : "text-slate-300 hover:bg-white/[0.04]",
                            )}
                          >
                            <Icon size={17} aria-hidden="true" />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="shrink-0 border-t border-white/8 p-3">
              <AdminProfile name={adminName} email={adminEmail} />
              <SignOutButton className="mt-1" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, activeNavItem } from "@/components/admin/shell/nav";
import { AdminBrand } from "@/components/admin/brand";
import { SignOutButton } from "@/components/admin/shell/sign-out-button";
import { AdminProfile } from "@/components/admin/shell/admin-profile";
import { useDirty } from "@/components/admin/shell/dirty";
import type { SiteSettingsView } from "@/server/content";
import { cn } from "@/utils/cn";

/**
 * Left rail. Full width with labels from 1180px, a collapsed icon rail from
 * 900px, and hidden below that where the bottom tab bar takes over.
 */
export function NavRail({
  adminName,
  adminEmail,
  settings,
}: {
  adminName: string;
  adminEmail: string;
  settings: SiteSettingsView;
}) {
  const pathname = usePathname();
  const active = activeNavItem(pathname);
  const guard = useNavGuard();

  return (
    <nav
      aria-label="Admin sections"
      className="fixed inset-y-0 left-0 z-30 hidden w-[4.5rem] flex-col border-r border-white/8 bg-card/60 rail:flex wide:w-64"
    >
      <Link
        href="/admin"
        onClick={guard}
        aria-label={`${settings.brandName} admin home`}
        className="flex h-16 shrink-0 items-center px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-300 wide:px-5"
      >
        {/* Collapsed shows the mark, expanded shows the uploaded logo.
            Both come from Site Settings. */}
        <AdminBrand settings={settings} compact className="wide:hidden" />
        <AdminBrand settings={settings} className="hidden wide:flex" />
      </Link>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 wide:px-3">
        {NAV.map((group) => (
          <div key={group.label} className="mt-4 first:mt-0">
            <p className="hidden px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 wide:block">
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
                      onClick={guard}
                      aria-current={isActive ? "page" : undefined}
                      // The label is the accessible name at every width; the
                      // collapsed rail just hides it visually.
                      className={cn(
                        "flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
                        isActive
                          ? "bg-white/[0.07] text-white"
                          : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
                      )}
                      title={item.label}
                    >
                      <Icon size={17} aria-hidden="true" className="shrink-0" />
                      <span className="hidden truncate wide:inline">
                        {item.label}
                      </span>
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-cyan-300 wide:block"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-white/8 p-2 wide:p-3">
        {/* Collapsed shows initials only; expanded shows the whole profile. */}
        <AdminProfile
          name={adminName}
          email={adminEmail}
          className="hidden wide:flex"
        />
        <SignOutButton className="wide:hidden" labelHidden />
        <SignOutButton className="mt-1 hidden wide:flex" />
      </div>
    </nav>
  );
}

/**
 * Next has no navigation blocker, so an unsaved edit is defended with a
 * confirm on the link itself. beforeunload covers reloads and closed tabs.
 */
export function useNavGuard() {
  const { count } = useDirty();

  return (event: { preventDefault: () => void }) => {
    if (count === 0) return;
    const leave = window.confirm(
      `You have ${count} unsaved change${count === 1 ? "" : "s"}. Leave this screen and lose ${count === 1 ? "it" : "them"}?`,
    );
    if (!leave) event.preventDefault();
  };
}

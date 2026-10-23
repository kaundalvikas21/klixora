import Image from "next/image";
import type { SiteSettingsView } from "@/server/content";
import { cn } from "@/utils/cn";

/**
 * The admin's brand lockup, driven by Site Settings so the logo an operator
 * uploads shows up here too, not only on the public site.
 *
 * One component for the rail, the mobile drawer and the login card, so the
 * three cannot drift apart.
 *
 * `compact` is for the collapsed icon rail, where roughly 40px of width is
 * available. A 3.8:1 wordmark scaled into that is unreadable, so it falls
 * back to the brand's initial on the gradient tile. There is deliberately
 * only one logo asset in the schema, and inventing a square variant of it is
 * not something code can do honestly.
 */
export function AdminBrand({
  settings,
  compact = false,
  className,
}: {
  settings: SiteSettingsView;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 font-display text-sm font-bold text-ink",
          className,
        )}
        // The expanded rail and every other surface carry the full name, so
        // this is decoration rather than the only label.
        aria-hidden="true"
      >
        {settings.brandName.trim().charAt(0).toUpperCase() || "K"}
      </span>
    );
  }

  return (
    <span className={cn("flex min-w-0 items-end gap-2.5", className)}>
      <Image
        src={settings.logoUrl || "/klixora-logo-white.webp"}
        alt={settings.logoAlt || settings.brandName}
        width={428}
        height={113}
        priority
        className="w-auto shrink-0"
        // Height comes from Site Settings, capped so an operator cannot
        // push the logo out of a 64px rail header.
        style={{ height: Math.min(settings.logoHeight, 32) }}
      />
      <span className="truncate pb-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
        Admin
      </span>
    </span>
  );
}

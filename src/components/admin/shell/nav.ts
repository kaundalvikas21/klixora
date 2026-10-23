import {
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  PenTool,
  Search,
  Settings,
} from "lucide-react";

/**
 * The left rail, grouped. One definition drives the full rail, the collapsed
 * icon rail, the mobile drawer and the bottom tab bar, so they cannot
 * disagree about where a screen lives.
 */
export type NavItem = {
  href: string;
  label: string;
  /** Short label for the bottom tab bar, where space is tight. */
  short: string;
  icon: LucideIcon;
  /** Shown in the bottom tab bar on a phone. */
  primary?: boolean;
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/admin",
        label: "Overview",
        short: "Overview",
        icon: LayoutDashboard,
        primary: true,
      },
      {
        href: "/admin/leads",
        label: "Contact Leads",
        short: "Leads",
        icon: Inbox,
        primary: true,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/admin/content",
        label: "Home Page CMS",
        short: "Content",
        icon: PenTool,
        primary: true,
      },
      {
        href: "/admin/seo",
        label: "SEO & Social",
        short: "SEO",
        icon: Search,
        primary: true,
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        href: "/admin/settings",
        label: "Site Settings",
        short: "Settings",
        icon: Settings,
        primary: true,
      },
    ],
  },
];

export const NAV_ITEMS = NAV.flatMap((group) => group.items);

/** Longest matching href wins, so /admin never beats /admin/leads. */
export function activeNavItem(pathname: string): NavItem | undefined {
  return [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

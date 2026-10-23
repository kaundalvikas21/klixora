import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import {
  getCurrentYear,
  getHomeContent,
  getSiteSettings,
  getSocialLinks,
} from "@/server/content";

/**
 * Shared chrome for every public marketing page. Lives on the route group so
 * the pages themselves only describe their own content, and so the admin
 * route group does not inherit any of it.
 *
 * Every value here comes from the database through cached reads tagged
 * `site-content`, which is what the admin's publish invalidates.
 */
export default async function FrontendLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, socials, home, year] = await Promise.all([
    getSiteSettings(),
    getSocialLinks(),
    getHomeContent(),
    getCurrentYear(),
  ]);

  return (
    <>
      <SiteHeader settings={settings} />
      <main id="main">{children}</main>
      <SiteFooter
        settings={settings}
        socials={socials}
        services={home.services.items}
        year={year}
      />
      <WhatsAppFab whatsapp={settings.whatsapp} brandName={settings.brandName} />
    </>
  );
}

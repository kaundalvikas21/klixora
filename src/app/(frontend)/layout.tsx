import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";

/**
 * Shared chrome for every public marketing page. Lives on the route group so
 * the pages themselves only describe their own content.
 */
export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <WhatsAppFab />
    </>
  );
}

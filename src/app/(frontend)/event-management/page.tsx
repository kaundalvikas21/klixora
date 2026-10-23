import type { Metadata } from "next";
import { SubPage } from "@/components/sections/sub/page-template";
import { JsonLd } from "@/components/ui/json-ld";
import { eventsContent } from "@/content/pages";
import { metadataFor } from "@/server/metadata";
import {
  getSeoMeta,
  getSiteSettings,
  getSocialLinks,
  getWorkingHours,
} from "@/server/content";

export function generateMetadata(): Promise<Metadata> {
  return metadataFor("event-management");
}

export default async function EventManagementPage() {
  const [seo, settings, hours, socials] = await Promise.all([
    getSeoMeta("event-management"),
    getSiteSettings(),
    getWorkingHours(),
    getSocialLinks(),
  ]);

  return (
    <>
      <JsonLd seo={seo} settings={settings} hours={hours} socials={socials} />
      <SubPage content={eventsContent} />
    </>
  );
}

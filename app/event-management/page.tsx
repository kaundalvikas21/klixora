import type { Metadata } from "next";
import { SubPage } from "@/components/sections/sub/page-template";
import { eventsContent } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Event Management",
  description:
    "From concept to execution, Klixora delivers end-to-end event management solutions for brands.",
  alternates: { canonical: `${site.url}/event-management` },
};

export default function EventManagementPage() {
  return <SubPage content={eventsContent} />;
}

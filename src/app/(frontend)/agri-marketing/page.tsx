import type { Metadata } from "next";
import { SubPage } from "@/components/sections/sub/page-template";
import { agriContent } from "@/content/pages";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Agri Marketing",
  description:
    "Klixora helps agri brands connect with rural audiences through digital, offline-first, and insight-led communication.",
  alternates: { canonical: `${site.url}/agri-marketing` },
};

export default function AgriMarketingPage() {
  return <SubPage content={agriContent} />;
}

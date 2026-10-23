import { Suspense } from "react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/json-ld";
import { Hero } from "@/components/sections/hero";
import { BrandMarquee } from "@/components/sections/brand-marquee";
import { Services } from "@/components/sections/services";
import { Results } from "@/components/sections/results";
import { WhyUs } from "@/components/sections/why-us";
import { Process } from "@/components/sections/process";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";
import {
  ContactSkeleton,
  HeroSkeleton,
  ServicesSkeleton,
} from "@/components/sections/skeletons";
import { metadataFor } from "@/server/metadata";
import {
  getHomeContent,
  getSeoMeta,
  getSiteSettings,
  getSocialLinks,
  getWorkingHours,
} from "@/server/content";

export function generateMetadata(): Promise<Metadata> {
  return metadataFor("home");
}

/**
 * The three database-driven sections each sit behind their own boundary, so
 * the page's own structure (the marquee, results, why-us, process and
 * testimonials, all of which are static copy) paints without waiting on a
 * content read. On a warm cache nobody sees a skeleton, because the reads
 * resolve into the prerendered shell; on a cold one each section fills in by
 * itself instead of the whole page waiting for the slowest query.
 *
 * getHomeContent and getSiteSettings are cached and deduped, so the three
 * sections calling them separately is one read apiece, not three.
 */
export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <Structured />
      </Suspense>

      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <BrandMarquee />

      <Suspense fallback={<ServicesSkeleton />}>
        <ServicesSection />
      </Suspense>

      <Results />
      <WhyUs />
      <Process />
      <Testimonials />

      <Suspense fallback={<ContactSkeleton />}>
        <ContactSection />
      </Suspense>
    </>
  );
}

async function Structured() {
  const [settings, hours, socials, seo] = await Promise.all([
    getSiteSettings(),
    getWorkingHours(),
    getSocialLinks(),
    getSeoMeta("home"),
  ]);

  return <JsonLd seo={seo} settings={settings} hours={hours} socials={socials} />;
}

async function HeroSection() {
  const home = await getHomeContent();
  return <Hero hero={home.hero} />;
}

async function ServicesSection() {
  const home = await getHomeContent();
  return <Services services={home.services} />;
}

async function ContactSection() {
  const [home, settings] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
  ]);
  return <Contact contact={home.contact} settings={settings} />;
}

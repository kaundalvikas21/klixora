import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { Hero } from "@/components/sections/hero";
import { BrandMarquee } from "@/components/sections/brand-marquee";
import { Services } from "@/components/sections/services";
import { Results } from "@/components/sections/results";
import { WhyUs } from "@/components/sections/why-us";
import { Process } from "@/components/sections/process";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";
import { JsonLd } from "@/components/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <SiteHeader />
      <main id="main">
        <Hero />
        <BrandMarquee />
        <Services />
        <Results />
        <WhyUs />
        <Process />
        <Testimonials />
        <Contact />
      </main>
      <SiteFooter />
      <WhatsAppFab />
    </>
  );
}

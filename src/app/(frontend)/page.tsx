import { JsonLd } from "@/components/ui/json-ld";
import { Hero } from "@/components/sections/hero";
import { BrandMarquee } from "@/components/sections/brand-marquee";
import { Services } from "@/components/sections/services";
import { Results } from "@/components/sections/results";
import { WhyUs } from "@/components/sections/why-us";
import { Process } from "@/components/sections/process";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <BrandMarquee />
      <Services />
      <Results />
      <WhyUs />
      <Process />
      <Testimonials />
      <Contact />
    </>
  );
}

import { site } from "@/content/site";

/**
 * Organization + LocalBusiness markup. Rendered once, on the home page.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    image: `${site.url}${site.logo}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Vardhman City",
      addressLocality: "Kurukshetra",
      addressRegion: "Haryana",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
    areaServed: "IN",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

import { SCHEMA_DAY_NAMES } from "@/lib/schemas/settings";
import type {
  SeoMetaView,
  SiteSettingsView,
  SocialLinkView,
  WorkingHourView,
} from "@/server/content";
import { site } from "@/content/site";

type Props = {
  seo: SeoMetaView | null;
  settings: SiteSettingsView;
  hours: WorkingHourView[];
  socials?: SocialLinkView[];
};

/**
 * Structured data, built from the database rather than written by hand.
 *
 * The `openingHoursSpecification` comes from the WorkingHour table, never
 * from SiteSettings.hoursLabel: the sentence is for visitors, the table is
 * what a search engine can actually parse.
 */
export function JsonLd({ seo, settings, hours, socials = [] }: Props) {
  const schemaType = seo?.schemaType;
  if (!schemaType) return null;

  const [locality = "", region = ""] = settings.addressLine2
    .split(",")
    .map((part) => part.trim());

  const openingHours = hours
    .filter((hour) => !hour.isClosed && hour.opensAt && hour.closesAt)
    .map((hour) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAY_NAMES[hour.dayOfWeek],
      opens: hour.opensAt,
      closes: hour.closesAt,
    }));

  const base = {
    "@context": "https://schema.org",
    "@type": schemaType === "LocalBusiness" ? "ProfessionalService" : schemaType,
    name: settings.brandName,
    description: seo?.metaDescription ?? settings.tagline,
    url: seo?.canonicalUrl || site.url,
  };

  const organisation = {
    email: settings.email,
    telephone: settings.phone,
    image: settings.logoUrl ? `${site.url}${settings.logoUrl}` : undefined,
    logo: settings.logoUrl ? `${site.url}${settings.logoUrl}` : undefined,
    sameAs: socials.filter((s) => s.url !== "#").map((s) => s.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.addressLine1,
      addressLocality: locality,
      addressRegion: region,
      addressCountry: "IN",
    },
  };

  const data =
    schemaType === "LocalBusiness" || schemaType === "Organization"
      ? {
          ...base,
          ...organisation,
          ...(openingHours.length ? { openingHoursSpecification: openingHours } : {}),
          areaServed: "IN",
        }
      : schemaType === "Service"
        ? {
            ...base,
            provider: {
              "@type": "Organization",
              name: settings.brandName,
              url: site.url,
            },
            areaServed: "IN",
          }
        : base;

  return (
    <script
      type="application/ld+json"
      // Values come from our own database, and JSON.stringify escapes them.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

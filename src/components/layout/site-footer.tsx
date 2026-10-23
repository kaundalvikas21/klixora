import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SocialIcon } from "@/components/ui/social-icon";
import { Container } from "@/components/ui/section";
import {
  footerServices,
  legalLinks,
  navLinks,
  site,
  socials,
} from "@/content/site";

const contactRows = [
  { icon: MapPin, value: site.address },
  { icon: Mail, value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, value: site.phone, href: `tel:${site.phone}` },
  { icon: Clock, value: site.hours },
];

function ColumnHeading({ children }: { children: string }) {
  return (
    <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400">
      {children}
    </h3>
  );
}

export function SiteFooter() {
  return (
    <footer
      data-testid="site-footer"
      className="relative overflow-hidden border-t border-white/5 bg-white/[0.02]"
    >
      <div
        aria-hidden="true"
        className="absolute -left-40 bottom-0 h-[320px] w-[520px] rounded-full bg-violet-600/8 blur-[150px]"
      />

      <Container className="relative py-14 md:py-16 lg:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* brand */}
          <div className="lg:col-span-4">
            <Link href="/#top" aria-label={`${site.name} home`}>
              <Image
                src={site.logo}
                alt={site.name}
                width={428}
                height={113}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              {site.tagline} — paid ads, SEO, social and marketplace growth,
              managed end to end by one team.
            </p>

            <ul className="mt-6 flex items-center gap-3">
              {socials.map((social) => (
                <li key={social.key}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    data-testid={`social-${social.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-colors duration-300 hover:border-cyan-300/50 hover:text-cyan-300"
                  >
                    <SocialIcon name={social.key} size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* services */}
          <div className="lg:col-span-3">
            <ColumnHeading>Services</ColumnHeading>
            <ul className="mt-5 flex flex-col gap-3">
              {footerServices.map((service) => (
                <li key={service}>
                  <Link
                    href="#services"
                    className="text-sm text-slate-400 transition-colors duration-300 hover:text-cyan-300"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* quick links */}
          <div className="lg:col-span-2">
            <ColumnHeading>Company</ColumnHeading>
            <ul className="mt-5 flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors duration-300 hover:text-cyan-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div className="lg:col-span-3">
            <ColumnHeading>Get in touch</ColumnHeading>
            <ul className="mt-5 flex flex-col gap-4">
              {contactRows.map((row) => {
                const Icon = row.icon;
                return (
                  <li key={row.value} className="flex items-start gap-3">
                    <Icon
                      size={15}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-cyan-300"
                    />
                    {row.href ? (
                      <a
                        href={row.href}
                        className="text-sm text-slate-400 transition-colors duration-300 hover:text-cyan-300"
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">
                        {row.value}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
            © {site.founded} {site.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors duration-300 hover:text-cyan-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

import { Check, Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/sections/contact-form";
import { ContactFormBoundary } from "@/components/sections/contact-form-boundary";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Section } from "@/components/ui/section";
import { GradientText } from "@/lib/rich-text";
import type { HomeContent, SiteSettingsView } from "@/server/content";

type Props = {
  contact: HomeContent["contact"];
  settings: SiteSettingsView;
};

export function Contact({ contact, settings }: Props) {
  // The contact block is read-only here: every value comes from Site
  // Settings, so a phone number is only ever typed in one place.
  const infoTiles = [
    {
      icon: MapPin,
      label: "Visit Our Office",
      value: `${settings.addressLine1}, ${settings.addressLine2}`,
      href: settings.mapUrl || undefined,
      testid: "contact-info-address",
    },
    {
      icon: Mail,
      label: "Email Us",
      value: settings.email,
      href: `mailto:${settings.email}`,
      testid: "contact-info-email",
    },
    {
      icon: Phone,
      label: "Call Us",
      value: settings.phone,
      href: `tel:${settings.phone}`,
      testid: "contact-info-phone",
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: settings.hoursLabel,
      testid: "contact-info-hours",
    },
  ];

  return (
    <Section
      id="contact"
      testId="contact-section"
      glow={
        <div
          aria-hidden="true"
          className="absolute -left-40 top-10 -z-10 h-[420px] w-[620px] rounded-full bg-cyan-500/10 blur-[150px]"
        />
      }
    >
      <SectionHeading
        eyebrow={contact.eyebrow}
        title={<GradientText value={contact.heading} />}
      />

      <div className="mt-12 grid gap-12 lg:mt-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <span className="eyebrow">{contact.cardKicker}</span>
            <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
              {contact.formTitle}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
              {contact.formIntro}
            </p>
          </Reveal>

          <ul className="mt-7 flex flex-col gap-3.5">
            {contact.promises.map((promise, i) => (
              <Reveal as="li" key={promise} y={20} delay={0.1 + i * 0.08}>
                <span className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                    <Check size={11} aria-hidden="true" />
                  </span>
                  {promise}
                </span>
              </Reveal>
            ))}
          </ul>

          {contact.showContactBlock ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {infoTiles.map((tile, i) => {
                const Icon = tile.icon;
                const body = (
                  <span className="glass group flex items-center gap-3.5 rounded-2xl p-4 transition-colors duration-300 hover:border-cyan-300/30">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        {tile.label}
                      </span>
                      <span className="block truncate text-sm text-slate-200">
                        {tile.value}
                      </span>
                    </span>
                  </span>
                );

                return (
                  <Reveal key={tile.testid} y={24} delay={0.15 + i * 0.07}>
                    {tile.href ? (
                      <a href={tile.href} data-testid={tile.testid} className="block">
                        {body}
                      </a>
                    ) : (
                      <div data-testid={tile.testid}>{body}</div>
                    )}
                  </Reveal>
                );
              })}
            </div>
          ) : null}
        </div>

        <Reveal y={32}>
          <ContactFormBoundary email={settings.email}>
            <ContactForm contact={contact} />
          </ContactFormBoundary>
        </Reveal>
      </div>
    </Section>
  );
}

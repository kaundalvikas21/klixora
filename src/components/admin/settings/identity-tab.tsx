"use client";

import { useMemo, useState } from "react";
import {
  Field,
  Input,
  Panel,
  PanelHeading,
} from "@/components/admin/ui/primitives";
import { ImageField } from "@/components/admin/content/image-field";
import { SaveBar } from "@/components/admin/shell/save-bar";
import { diffFields, useReportDirty } from "@/components/admin/shell/dirty";
import { saveSiteSettings } from "@/server/actions/settings";
import type { SiteSettingsInput } from "@/lib/schemas/settings";

const LABELS: Partial<Record<keyof SiteSettingsInput, string>> = {
  brandName: "Brand name",
  tagline: "Tagline",
  domain: "Domain",
  gstin: "GSTIN",
  logoUrl: "Logo",
  logoAlt: "Logo alt text",
  logoHeight: "Header logo height",
  addressLine1: "Address line 1",
  addressLine2: "Address line 2",
  mapUrl: "Maps link",
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  hoursLabel: "Hours sentence",
};

/**
 * Identity and contact details share one row and one Server Action, so they
 * share this component with the tab deciding which fields to show. Splitting
 * them would mean two half-row writes racing each other.
 */
export function SettingsForm({
  initial,
  tab,
}: {
  initial: SiteSettingsInput;
  tab: "identity" | "contact";
}) {
  const [draft, setDraft] = useState<SiteSettingsInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const changes = useMemo(() => diffFields(initial, draft, LABELS), [initial, draft]);
  useReportDirty(`settings:${tab}`, changes);

  function set<K extends keyof SiteSettingsInput>(key: K, value: SiteSettingsInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function persist() {
    const result = await saveSiteSettings(draft);
    setErrors(result.fieldErrors ?? {});
    return result;
  }

  return (
    <>
      {tab === "identity" ? (
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeading title="Brand" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Brand name" error={errors.brandName}>
                {(id) => (
                  <Input
                    id={id}
                    value={draft.brandName}
                    onChange={(event) => set("brandName", event.target.value)}
                    aria-invalid={Boolean(errors.brandName)}
                  />
                )}
              </Field>
              <Field label="Domain" error={errors.domain}>
                {(id) => (
                  <Input
                    id={id}
                    value={draft.domain}
                    onChange={(event) => set("domain", event.target.value)}
                  />
                )}
              </Field>
            </div>

            <Field
              label="Tagline"
              hint="Used in the footer and as the fallback meta description."
              error={errors.tagline}
            >
              {(id) => (
                <Input
                  id={id}
                  value={draft.tagline}
                  onChange={(event) => set("tagline", event.target.value)}
                />
              )}
            </Field>

            <Field label="GSTIN (optional)" error={errors.gstin}>
              {(id) => (
                <Input
                  id={id}
                  value={draft.gstin}
                  onChange={(event) => set("gstin", event.target.value)}
                />
              )}
            </Field>
          </Panel>

          <Panel>
            <PanelHeading
              title="Logo"
              hint="One logo, used in the header, the footer and the structured data. No favicon, no app icon, no light and dark variants."
            />

            <ImageField
              label="Logo"
              value={draft.logoUrl}
              onChange={(url) => set("logoUrl", url)}
              recommendation="Light-on-transparent PNG or WebP"
              error={errors.logoUrl}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Alt text"
                hint="Read aloud in place of the logo."
                error={errors.logoAlt}
              >
                {(id) => (
                  <Input
                    id={id}
                    value={draft.logoAlt}
                    onChange={(event) => set("logoAlt", event.target.value)}
                  />
                )}
              </Field>
              <Field
                label="Header height (px)"
                hint="Between 16 and 96."
                error={errors.logoHeight}
              >
                {(id) => (
                  <Input
                    id={id}
                    type="number"
                    min={16}
                    max={96}
                    inputMode="numeric"
                    value={draft.logoHeight}
                    onChange={(event) => set("logoHeight", Number(event.target.value))}
                  />
                )}
              </Field>
            </div>
          </Panel>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeading
              title="Contact details"
              hint="These are the only copies on the site. Editing here moves the header, the contact block, the footer, the WhatsApp button and the structured data."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Address line 1" error={errors.addressLine1}>
                {(id) => (
                  <Input
                    id={id}
                    value={draft.addressLine1}
                    onChange={(event) => set("addressLine1", event.target.value)}
                    aria-invalid={Boolean(errors.addressLine1)}
                  />
                )}
              </Field>
              <Field
                label="Address line 2"
                hint="City then region, comma separated: the structured data splits on that comma."
                error={errors.addressLine2}
              >
                {(id) => (
                  <Input
                    id={id}
                    value={draft.addressLine2}
                    onChange={(event) => set("addressLine2", event.target.value)}
                  />
                )}
              </Field>
            </div>

            <Field label="Google Maps link (optional)" error={errors.mapUrl}>
              {(id) => (
                <Input
                  id={id}
                  value={draft.mapUrl}
                  placeholder="https://maps.google.com/..."
                  onChange={(event) => set("mapUrl", event.target.value)}
                />
              )}
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" error={errors.email}>
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    value={draft.email}
                    onChange={(event) => set("email", event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                  />
                )}
              </Field>
              <Field label="Phone" error={errors.phone}>
                {(id) => (
                  <Input
                    id={id}
                    type="tel"
                    value={draft.phone}
                    onChange={(event) => set("phone", event.target.value)}
                  />
                )}
              </Field>
              <Field
                label="WhatsApp number"
                hint="With the country code, e.g. 918668322325. This is what the floating button dials."
                error={errors.whatsapp}
              >
                {(id) => (
                  <Input
                    id={id}
                    type="tel"
                    value={draft.whatsapp}
                    onChange={(event) => set("whatsapp", event.target.value)}
                  />
                )}
              </Field>
              <Field
                label="Hours sentence"
                hint="What visitors read. Search engines read the Working hours tab instead."
                error={errors.hoursLabel}
              >
                {(id) => (
                  <Input
                    id={id}
                    value={draft.hoursLabel}
                    onChange={(event) => set("hoursLabel", event.target.value)}
                  />
                )}
              </Field>
            </div>
          </Panel>
        </div>
      )}

      {/* Settings have no draft stage: a phone number is live when saved. */}
      <SaveBar
        onSaveDraft={persist}
        onPublish={persist}
        onDiscard={() => {
          setDraft(initial);
          setErrors({});
        }}
      />
    </>
  );
}

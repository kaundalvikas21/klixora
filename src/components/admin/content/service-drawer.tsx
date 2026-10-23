"use client";

import { useState } from "react";
import {
  Button,
  Counter,
  Field,
  Input,
  Meter,
  Select,
  Switch,
  Textarea,
} from "@/components/admin/ui/primitives";
import { Drawer } from "@/components/admin/ui/drawer";
import { IconPicker } from "@/components/admin/content/icon-picker";
import { PreviewFrame } from "@/components/admin/content/preview-frame";
import { Services } from "@/components/sections/services";
import type { ServicesSection } from "@/lib/schemas/content";
import type { IconName } from "@/components/ui/icon";

/**
 * Description range: 140-200 characters keeps every card the same height in
 * a three-up grid. Shorter and the row looks ragged, longer and one card
 * pushes the whole row down.
 */
export const DESCRIPTION_RANGE = { min: 140, max: 200 };

export type ServiceDraft = {
  id?: string;
  kicker: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  status: "DRAFT" | "LIVE";
  isVisible: boolean;
};

export const EMPTY_SERVICE: ServiceDraft = {
  kicker: "",
  title: "",
  description: "",
  icon: "Sparkles",
  href: "",
  status: "DRAFT",
  isVisible: true,
};

export function ServiceDrawer({
  draft,
  section,
  errors,
  onChange,
  onClose,
  onSave,
}: {
  draft: ServiceDraft | null;
  /** The section header, so the preview card sits in its real context. */
  section: ServicesSection;
  errors: Record<string, string>;
  onChange: (next: ServiceDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <Drawer
      open={draft !== null}
      onClose={onClose}
      width="lg"
      title={draft?.id ? "Edit service" : "New service"}
      description="Services publish on save. A hidden service is also moved to draft, so the table never claims something is live when it is not on the page."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save service
          </Button>
        </>
      }
    >
      {draft ? (
        <div className="flex flex-col gap-1">
          <Field
            label="Kicker"
            hint="The small mono line above the title, e.g. Diagnostic & Blueprint."
            error={errors.kicker}
          >
            {(id) => (
              <Input
                id={id}
                value={draft.kicker}
                onChange={(event) => onChange({ ...draft, kicker: event.target.value })}
                aria-invalid={Boolean(errors.kicker)}
              />
            )}
          </Field>

          <Field label="Title" error={errors.title}>
            {(id) => (
              <Input
                id={id}
                value={draft.title}
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                aria-invalid={Boolean(errors.title)}
              />
            )}
          </Field>

          <Field
            label="Description"
            hint="140 to 200 characters keeps every card level in a three-up grid."
            error={errors.description}
            aside={
              <Counter
                value={draft.description.length}
                min={DESCRIPTION_RANGE.min}
                max={DESCRIPTION_RANGE.max}
              />
            }
          >
            {(id) => (
              <>
                <Textarea
                  id={id}
                  rows={5}
                  value={draft.description}
                  onChange={(event) =>
                    onChange({ ...draft, description: event.target.value })
                  }
                  aria-invalid={Boolean(errors.description)}
                />
                <Meter
                  value={draft.description.length}
                  min={DESCRIPTION_RANGE.min}
                  max={DESCRIPTION_RANGE.max}
                  label="Description length"
                />
              </>
            )}
          </Field>

          <IconPicker
            value={draft.icon}
            onChange={(name: IconName) => onChange({ ...draft, icon: name })}
            error={errors.icon}
          />

          <Field
            label="Link (optional)"
            hint="Give the card a destination, e.g. /agri-marketing. Leave empty and it is not a link."
            error={errors.href}
          >
            {(id) => (
              <Input
                id={id}
                value={draft.href}
                placeholder="/agri-marketing"
                onChange={(event) => onChange({ ...draft, href: event.target.value })}
              />
            )}
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Status" error={errors.status}>
              {(id) => (
                <Select
                  id={id}
                  value={draft.status}
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      status: event.target.value as ServiceDraft["status"],
                    })
                  }
                >
                  <option value="DRAFT">Draft (not on the live page)</option>
                  <option value="LIVE">Live</option>
                </Select>
              )}
            </Field>

            <div className="pt-1">
              <label className="flex h-[42px] items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-3">
                <span className="text-sm text-slate-200">Visible</span>
                <Switch
                  checked={draft.isVisible}
                  label="Visible on the site"
                  onChange={(next) => onChange({ ...draft, isVisible: next })}
                />
              </label>
            </div>
          </div>

          <div className="mt-4 border-t border-white/8 pt-4">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300 hover:underline"
            >
              {showPreview ? "Hide card preview" : "Show card preview"}
            </button>

            {showPreview ? (
              <div className="mt-3">
                <PreviewFrame>
                  <Services
                    services={{
                      ...section,
                      ctaLabel: "",
                      ctaHref: "",
                      items: [
                        {
                          id: draft.id ?? "preview",
                          kicker: draft.kicker,
                          title: draft.title,
                          description: draft.description,
                          icon: draft.icon,
                          href: draft.href || null,
                        },
                      ],
                    }}
                  />
                </PreviewFrame>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

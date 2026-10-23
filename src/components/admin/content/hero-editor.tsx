"use client";

import { useMemo, useState } from "react";
import {
  Counter,
  Field,
  Input,
  Panel,
  PanelHeading,
  Textarea,
} from "@/components/admin/ui/primitives";
import { Meter } from "@/components/admin/ui/primitives";
import { StringRepeater } from "@/components/admin/content/string-repeater";
import { ImageField } from "@/components/admin/content/image-field";
import { CtaTable } from "@/components/admin/content/cta-table";
import { PreviewFrame } from "@/components/admin/content/preview-frame";
import { SaveBar } from "@/components/admin/shell/save-bar";
import { diffFields, useReportDirty } from "@/components/admin/shell/dirty";
import { Hero } from "@/components/sections/hero";
import { saveSection } from "@/server/actions/content";
import type { HeroSection } from "@/lib/schemas/content";
import type { AdminHeroCta } from "@/server/admin";

const SUB_RANGE = { min: 120, max: 180 };

const LABELS: Partial<Record<keyof HeroSection, string>> = {
  eyebrow: "Eyebrow",
  headlineLines: "Headline",
  subheadline: "Sub-headline",
  backgroundImageUrl: "Background image",
  chips: "Chips",
  scrollCue: "Scroll cue",
  dashboardTitle: "Dashboard title",
  dashboardStatus: "Dashboard status",
  dashboardMetrics: "Dashboard metrics",
};

export function HeroEditor({
  initial,
  ctas,
}: {
  initial: HeroSection;
  ctas: AdminHeroCta[];
}) {
  const [draft, setDraft] = useState<HeroSection>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const changes = useMemo(() => diffFields(initial, draft, LABELS), [initial, draft]);
  useReportDirty("content:hero", changes);

  function set<K extends keyof HeroSection>(key: K, value: HeroSection[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function persist(publish: boolean) {
    const result = await saveSection("hero", draft, publish);
    setErrors(result.fieldErrors ?? {});
    return result;
  }

  // The preview is driven by the same object that will be saved, so what is
  // on the right is literally what publishing would put on the site.
  const previewCtas = ctas
    .filter((cta) => cta.isVisible)
    .map((cta) => ({
      id: cta.id,
      label: cta.label,
      href: cta.href,
      variant: cta.variant,
      openNewTab: cta.openNewTab,
    }));

  return (
    <>
      <div className="grid gap-5 wide:grid-cols-2 wide:items-start">
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeading title="Headline block" />

            <Field
              label="Eyebrow"
              hint='Keep the "//" prefix: it is the section marker used across the whole site.'
              error={errors.eyebrow}
            >
              {(id) => (
                <Input
                  id={id}
                  value={draft.eyebrow}
                  onChange={(event) => set("eyebrow", event.target.value)}
                  aria-invalid={Boolean(errors.eyebrow)}
                />
              )}
            </Field>

            <div className="mt-2">
              <StringRepeater
                label="Headline, one line per row"
                hint="Wrap a word in *asterisks* to paint it cyan to violet."
                values={draft.headlineLines}
                onChange={(next) => set("headlineLines", next)}
                placeholder="GROWTH *DRIVEN*"
                addLabel="Add line"
                max={6}
                uppercase
                error={errors.headlineLines}
              />
            </div>

            <Field
              label="Sub-headline"
              error={errors.subheadline}
              aside={
                <Counter
                  value={draft.subheadline.length}
                  min={SUB_RANGE.min}
                  max={SUB_RANGE.max}
                />
              }
            >
              {(id) => (
                <>
                  <Textarea
                    id={id}
                    rows={4}
                    value={draft.subheadline}
                    onChange={(event) => set("subheadline", event.target.value)}
                    aria-invalid={Boolean(errors.subheadline)}
                  />
                  <Meter
                    value={draft.subheadline.length}
                    min={SUB_RANGE.min}
                    max={SUB_RANGE.max}
                    label="Sub-headline length"
                  />
                </>
              )}
            </Field>
          </Panel>

          <CtaTable ctas={ctas} />

          <Panel>
            <PanelHeading title="Backdrop and trimmings" />

            <ImageField
              label="Background image"
              hint="Rendered behind the hero at 30% opacity with a radial mask."
              recommendation="1920x1080 or wider"
              value={draft.backgroundImageUrl}
              onChange={(url) => set("backgroundImageUrl", url)}
              error={errors.backgroundImageUrl}
            />

            <div className="mt-2">
              <StringRepeater
                label="Chips"
                hint="Small pills under the dashboard card."
                values={draft.chips}
                onChange={(next) => set("chips", next)}
                placeholder="Data-Driven Approach"
                addLabel="Add chip"
                max={4}
                error={errors.chips}
              />
            </div>

            <Field
              label="Scroll cue"
              hint="Leave empty to hide the scroll hint entirely."
              error={errors.scrollCue}
            >
              {(id) => (
                <Input
                  id={id}
                  value={draft.scrollCue}
                  onChange={(event) => set("scrollCue", event.target.value)}
                />
              )}
            </Field>
          </Panel>

          <Panel>
            <PanelHeading
              title="Tracking card"
              hint="The glass card beside the headline. The bars are decorative; these are the words on it."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Card title" error={errors.dashboardTitle}>
                {(id) => (
                  <Input
                    id={id}
                    value={draft.dashboardTitle}
                    onChange={(event) => set("dashboardTitle", event.target.value)}
                  />
                )}
              </Field>
              <Field label="Status label" error={errors.dashboardStatus}>
                {(id) => (
                  <Input
                    id={id}
                    value={draft.dashboardStatus}
                    onChange={(event) => set("dashboardStatus", event.target.value)}
                  />
                )}
              </Field>
            </div>

            <StringRepeater
              label="Metric labels"
              hint="The row along the bottom of the card."
              values={draft.dashboardMetrics}
              onChange={(next) => set("dashboardMetrics", next)}
              placeholder="Reach"
              addLabel="Add metric"
              max={4}
              error={errors.dashboardMetrics}
            />
          </Panel>
        </div>

        <div className="wide:sticky wide:top-24">
          <PreviewFrame>
            <Hero hero={{ ...draft, ctas: previewCtas }} />
          </PreviewFrame>
        </div>
      </div>

      <SaveBar
        onSaveDraft={() => persist(false)}
        onPublish={() => persist(true)}
        onDiscard={() => {
          setDraft(initial);
          setErrors({});
        }}
      />
    </>
  );
}

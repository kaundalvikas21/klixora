"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Field,
  Input,
  MicroLabel,
  Panel,
  PanelHeading,
  Select,
  Switch,
} from "@/components/admin/ui/primitives";
import { Drawer } from "@/components/admin/ui/drawer";
import { SortableList, SortableRow } from "@/components/admin/ui/sortable";
import { useRowAction } from "@/components/admin/ui/use-action";
import {
  deleteHeroCta,
  reorderHeroCtas,
  saveHeroCta,
} from "@/server/actions/content";
import type { AdminHeroCta } from "@/server/admin";

const VARIANTS = [
  { value: "PRIMARY", label: "Primary (gradient pill)" },
  { value: "OUTLINE", label: "Outline (bordered pill)" },
  { value: "TEXT", label: "Text (no pill)" },
] as const;

type Draft = {
  id?: string;
  label: string;
  href: string;
  variant: "PRIMARY" | "OUTLINE" | "TEXT";
  openNewTab: boolean;
  isVisible: boolean;
};

const EMPTY: Draft = {
  label: "",
  href: "#contact",
  variant: "OUTLINE",
  openNewTab: false,
  isVisible: true,
};

/**
 * Hero CTAs. These are structured rows, so they publish on save rather than
 * going through the section's draft payload: their visibility is governed by
 * the visible toggle, not by a draft.
 */
export function CtaTable({ ctas }: { ctas: AdminHeroCta[] }) {
  const { run } = useRowAction();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [order, setOrder] = useState(ctas);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  // Local order and toggles win while a request is in flight, so the switch
  // moves on the first click rather than after the round trip.
  const rows = (order.length ? order : ctas).map((cta) => ({
    ...cta,
    isVisible: hidden[cta.id] ?? cta.isVisible,
  }));

  function save() {
    if (!draft) return;
    run(
      async () => {
        const result = await saveHeroCta(draft);
        if (result.ok) {
          setDraft(null);
          setErrors({});
        } else {
          setErrors(result.fieldErrors ?? {});
        }
        return result;
      },
      { silent: false },
    );
  }

  return (
    <>
      <Panel>
        <PanelHeading
          title="Call to action buttons"
          hint="The icon is chosen from the label and destination: a call gets a handset, an email an envelope, an off-site link an arrow out."
          actions={
            <Button variant="secondary" size="sm" onClick={() => setDraft(EMPTY)}>
              <Plus size={13} /> Add CTA
            </Button>
          }
        />

        {rows.length ? (
          <SortableList
            items={rows}
            getId={(cta) => cta.id}
            onReorder={(ids) => {
              const next = ids
                .map((id) => rows.find((cta) => cta.id === id))
                .filter((cta): cta is (typeof rows)[number] => Boolean(cta));
              const previous = rows;
              setOrder(next);
              run(() => reorderHeroCtas(ids), {
                rollback: () => setOrder(previous),
                silent: true,
              });
            }}
            className="flex flex-col gap-2"
          >
            {(cta) => (
              <SortableRow key={cta.id} id={cta.id} label={`Reorder ${cta.label}`}>
                <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-100">
                        {cta.label || "Untitled"}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 truncate font-mono text-[10px] text-slate-500">
                        {cta.href}
                        {cta.openNewTab ? (
                          <ExternalLink size={9} aria-hidden="true" />
                        ) : null}
                      </span>
                    </span>

                    <Badge tone={cta.variant === "PRIMARY" ? "accent" : "neutral"}>
                      {cta.variant}
                    </Badge>

                    {/* Lifetime, not a rolling 30 days: HeroCta.clickCount is
                        a single counter. A real window needs a per-click event
                        table.
                        ponytail: one counter, add a CtaClick table if the
                        trend over time ever matters. */}
                    <span className="flex items-center gap-1.5">
                      <MicroLabel>Clicks</MicroLabel>
                      <span className="font-mono text-xs tabular-nums text-slate-200">
                        {cta.clickCount}
                      </span>
                    </span>

                    <Switch
                      checked={cta.isVisible}
                      label={`Show "${cta.label}" on the site`}
                      onChange={(next) => {
                        setHidden((map) => ({ ...map, [cta.id]: next }));
                        run(
                          () =>
                            saveHeroCta({
                              id: cta.id,
                              label: cta.label,
                              href: cta.href,
                              variant: cta.variant,
                              openNewTab: cta.openNewTab,
                              isVisible: next,
                            }),
                          {
                            rollback: () =>
                              setHidden((map) => ({ ...map, [cta.id]: !next })),
                            silent: true,
                          },
                        );
                      }}
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${cta.label}`}
                      onClick={() =>
                        setDraft({
                          id: cta.id,
                          label: cta.label,
                          href: cta.href,
                          variant: cta.variant,
                          openNewTab: cta.openNewTab,
                          isVisible: cta.isVisible,
                        })
                      }
                    >
                      <Pencil size={14} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${cta.label}`}
                      onClick={() => {
                        if (!window.confirm(`Delete the "${cta.label}" button?`)) return;
                        run(() => deleteHeroCta(cta.id));
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </SortableRow>
            )}
          </SortableList>
        ) : (
          <p className="text-xs text-slate-400">
            The hero has no buttons, so a visitor has nothing to click. Add one.
          </p>
        )}
      </Panel>

      <Drawer
        open={draft !== null}
        onClose={() => {
          setDraft(null);
          setErrors({});
        }}
        title={draft?.id ? "Edit CTA" : "New CTA"}
        description="Saved straight to the live hero. CTAs do not go through the draft."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save}>
              Save CTA
            </Button>
          </>
        }
      >
        {draft ? (
          <div className="flex flex-col gap-1">
            <Field label="Label" error={errors.label}>
              {(id) => (
                <Input
                  id={id}
                  value={draft.label}
                  onChange={(event) =>
                    setDraft({ ...draft, label: event.target.value })
                  }
                />
              )}
            </Field>

            <Field
              label="Destination"
              hint="An anchor (#contact), a path (/agri-marketing), or a full URL."
              error={errors.href}
            >
              {(id) => (
                <Input
                  id={id}
                  value={draft.href}
                  onChange={(event) => setDraft({ ...draft, href: event.target.value })}
                />
              )}
            </Field>

            <Field label="Variant" error={errors.variant}>
              {(id) => (
                <Select
                  id={id}
                  value={draft.variant}
                  onChange={(event) =>
                    setDraft({ ...draft, variant: event.target.value as Draft["variant"] })
                  }
                >
                  {VARIANTS.map((variant) => (
                    <option key={variant.value} value={variant.value}>
                      {variant.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <div className="mt-2 flex flex-col gap-3">
              <label className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-200">Open in a new tab</span>
                <Switch
                  checked={draft.openNewTab}
                  label="Open in a new tab"
                  onChange={(next) => setDraft({ ...draft, openNewTab: next })}
                />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-200">Visible on the site</span>
                <Switch
                  checked={draft.isVisible}
                  label="Visible on the site"
                  onChange={(next) => setDraft({ ...draft, isVisible: next })}
                />
              </label>
            </div>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

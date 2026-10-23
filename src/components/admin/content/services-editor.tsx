"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Counter,
  Field,
  Input,
  Meter,
  MicroLabel,
  Panel,
  PanelHeading,
  Select,
  Switch,
  Textarea,
} from "@/components/admin/ui/primitives";
import { SortableList, SortableRow } from "@/components/admin/ui/sortable";
import { Icon } from "@/components/ui/icon";
import { PreviewFrame } from "@/components/admin/content/preview-frame";
import {
  EMPTY_SERVICE,
  ServiceDrawer,
  type ServiceDraft,
} from "@/components/admin/content/service-drawer";
import { SaveBar } from "@/components/admin/shell/save-bar";
import { diffFields, useReportDirty } from "@/components/admin/shell/dirty";
import { useRowAction } from "@/components/admin/ui/use-action";
import { Services } from "@/components/sections/services";
import {
  deleteService,
  reorderServices,
  saveSection,
  saveService,
  setServiceStatus,
  setServiceVisible,
} from "@/server/actions/content";
import type { ServicesSection } from "@/lib/schemas/content";
import type { AdminService } from "@/server/admin";
import { formatDateTime } from "@/lib/format";

const INTRO_RANGE = { min: 120, max: 220 };

const LABELS: Partial<Record<keyof ServicesSection, string>> = {
  eyebrow: "Eyebrow",
  heading: "Heading",
  intro: "Intro",
  ctaLabel: "Section CTA label",
  ctaHref: "Section CTA destination",
  columns: "Desktop columns",
};

export function ServicesEditor({
  initial,
  items,
}: {
  initial: ServicesSection;
  items: AdminService[];
}) {
  const { run } = useRowAction();
  const [draft, setDraft] = useState<ServicesSection>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [rowDraft, setRowDraft] = useState<ServiceDraft | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [order, setOrder] = useState(items);
  const [overrides, setOverrides] = useState<
    Record<string, { isVisible?: boolean; status?: "DRAFT" | "LIVE" }>
  >({});

  const changes = useMemo(() => diffFields(initial, draft, LABELS), [initial, draft]);
  useReportDirty("content:services", changes);

  const rows = (order.length ? order : items).map((service) => ({
    ...service,
    ...overrides[service.id],
  }));

  function set<K extends keyof ServicesSection>(key: K, value: ServicesSection[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function persist(publish: boolean) {
    const result = await saveSection("services", draft, publish);
    setErrors(result.fieldErrors ?? {});
    return result;
  }

  function saveRow() {
    if (!rowDraft) return;
    run(async () => {
      const result = await saveService(rowDraft);
      if (result.ok) {
        setRowDraft(null);
        setRowErrors({});
      } else {
        setRowErrors(result.fieldErrors ?? {});
      }
      return result;
    });
  }

  const liveItems = rows
    .filter((service) => service.status === "LIVE" && service.isVisible)
    .map((service) => ({
      id: service.id,
      kicker: service.kicker,
      title: service.title,
      description: service.description,
      icon: service.icon,
      href: service.href,
    }));

  return (
    <>
      <div className="grid gap-5 wide:grid-cols-2 wide:items-start">
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeading
              title="Section header"
              hint="Wrap a word in *asterisks* in the heading to paint it cyan to violet."
            />

            <Field label="Eyebrow" error={errors.eyebrow}>
              {(id) => (
                <Input
                  id={id}
                  value={draft.eyebrow}
                  onChange={(event) => set("eyebrow", event.target.value)}
                  aria-invalid={Boolean(errors.eyebrow)}
                />
              )}
            </Field>

            <Field label="Heading" error={errors.heading}>
              {(id) => (
                <Input
                  id={id}
                  value={draft.heading}
                  onChange={(event) => set("heading", event.target.value)}
                  aria-invalid={Boolean(errors.heading)}
                />
              )}
            </Field>

            <Field
              label="Intro"
              error={errors.intro}
              aside={
                <Counter
                  value={draft.intro.length}
                  min={INTRO_RANGE.min}
                  max={INTRO_RANGE.max}
                />
              }
            >
              {(id) => (
                <>
                  <Textarea
                    id={id}
                    rows={4}
                    value={draft.intro}
                    onChange={(event) => set("intro", event.target.value)}
                    aria-invalid={Boolean(errors.intro)}
                  />
                  <Meter
                    value={draft.intro.length}
                    min={INTRO_RANGE.min}
                    max={INTRO_RANGE.max}
                    label="Intro length"
                  />
                </>
              )}
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Section CTA label" error={errors.ctaLabel}>
                {(id) => (
                  <Input
                    id={id}
                    value={draft.ctaLabel}
                    placeholder="Get a free audit"
                    onChange={(event) => set("ctaLabel", event.target.value)}
                  />
                )}
              </Field>
              <Field label="Section CTA destination" error={errors.ctaHref}>
                {(id) => (
                  <Input
                    id={id}
                    value={draft.ctaHref}
                    placeholder="#contact"
                    onChange={(event) => set("ctaHref", event.target.value)}
                  />
                )}
              </Field>
            </div>

            <Field
              label="Desktop columns"
              hint="Phones are always one column and tablets two; this is the widest layout."
              error={errors.columns}
            >
              {(id) => (
                <Select
                  id={id}
                  value={String(draft.columns)}
                  onChange={(event) => set("columns", Number(event.target.value))}
                >
                  <option value="2">2 across</option>
                  <option value="3">3 across</option>
                  <option value="4">4 across</option>
                </Select>
              )}
            </Field>
          </Panel>

          <Panel>
            <PanelHeading
              title="Services"
              hint="The /01 numbering follows the drag order and is never stored by hand."
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRowDraft(EMPTY_SERVICE)}
                >
                  <Plus size={13} /> Add service
                </Button>
              }
            />

            <SortableList
              items={rows}
              getId={(service) => service.id}
              onReorder={(ids) => {
                const next = ids
                  .map((id) => rows.find((service) => service.id === id))
                  .filter((service): service is (typeof rows)[number] => Boolean(service));
                const previous = rows;
                setOrder(next);
                run(() => reorderServices(ids), {
                  rollback: () => setOrder(previous),
                  silent: true,
                });
              }}
              className="flex flex-col gap-2"
            >
              {(service, index) => (
                <SortableRow
                  key={service.id}
                  id={service.id}
                  label={`Reorder ${service.title}`}
                >
                  <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
                    <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                      <span className="mt-0.5 font-mono text-[11px] tabular-nums text-slate-500">
                        /{String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-cyan-300">
                        <Icon name={service.icon} size={14} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-slate-100">
                          {service.title || "Untitled"}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {service.description.slice(0, 90)}
                          {service.description.length > 90 ? "..." : ""}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2">
                          <MicroLabel>{service.kicker}</MicroLabel>
                          <span className="font-mono text-[10px] text-slate-600">
                            edited {formatDateTime(service.updatedAt)}
                          </span>
                        </span>
                      </span>

                      <button
                        type="button"
                        aria-label={`${service.status === "LIVE" ? "Move to draft" : "Publish"}: ${service.title}`}
                        onClick={() => {
                          const next = service.status === "LIVE" ? "DRAFT" : "LIVE";
                          setOverrides((map) => ({
                            ...map,
                            [service.id]: {
                              ...map[service.id],
                              status: next,
                              isVisible: next === "LIVE" ? true : service.isVisible,
                            },
                          }));
                          run(() => setServiceStatus(service.id, next), {
                            rollback: () =>
                              setOverrides((map) => ({
                                ...map,
                                [service.id]: { ...map[service.id], status: service.status },
                              })),
                          });
                        }}
                        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                      >
                        <Badge tone={service.status === "LIVE" ? "live" : "draft"}>
                          {service.status}
                        </Badge>
                      </button>

                      <Switch
                        checked={service.isVisible}
                        label={`Show "${service.title}" on the site`}
                        onChange={(next) => {
                          setOverrides((map) => ({
                            ...map,
                            [service.id]: {
                              ...map[service.id],
                              isVisible: next,
                              status: next ? service.status : "DRAFT",
                            },
                          }));
                          run(() => setServiceVisible(service.id, next), {
                            rollback: () =>
                              setOverrides((map) => ({
                                ...map,
                                [service.id]: {
                                  ...map[service.id],
                                  isVisible: service.isVisible,
                                  status: service.status,
                                },
                              })),
                          });
                        }}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${service.title}`}
                        onClick={() =>
                          setRowDraft({
                            id: service.id,
                            kicker: service.kicker,
                            title: service.title,
                            description: service.description,
                            icon: service.icon,
                            href: service.href ?? "",
                            status: service.status,
                            isVisible: service.isVisible,
                          })
                        }
                      >
                        <Pencil size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${service.title}`}
                        onClick={() => {
                          if (!window.confirm(`Delete "${service.title}"?`)) return;
                          run(() => deleteService(service.id));
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </SortableRow>
              )}
            </SortableList>
          </Panel>
        </div>

        <div className="wide:sticky wide:top-24">
          <PreviewFrame>
            <Services services={{ ...draft, items: liveItems }} />
          </PreviewFrame>
        </div>
      </div>

      <ServiceDrawer
        draft={rowDraft}
        section={draft}
        errors={rowErrors}
        onChange={setRowDraft}
        onClose={() => {
          setRowDraft(null);
          setRowErrors({});
        }}
        onSave={saveRow}
      />

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

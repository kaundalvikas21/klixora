"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
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
  Switch,
  Textarea,
} from "@/components/admin/ui/primitives";
import { SortableList, SortableRow } from "@/components/admin/ui/sortable";
import { PreviewFrame } from "@/components/admin/content/preview-frame";
import {
  EMPTY_STEP,
  FormStepDrawer,
  type StepDraft,
} from "@/components/admin/content/form-step-drawer";
import { SaveBar } from "@/components/admin/shell/save-bar";
import { diffFields, useReportDirty } from "@/components/admin/shell/dirty";
import { useRowAction } from "@/components/admin/ui/use-action";
import { Contact } from "@/components/sections/contact";
import {
  deleteContactPromise,
  deleteFormStep,
  reorderContactPromises,
  reorderFormSteps,
  saveContactPromise,
  saveFormStep,
  saveSection,
} from "@/server/actions/content";
import type { ContactSection } from "@/lib/schemas/content";
import type { AdminFormStep, AdminPromise } from "@/server/admin";
import type { SiteSettingsView } from "@/server/content";

const INTRO_RANGE = { min: 100, max: 200 };

const LABELS: Partial<Record<keyof ContactSection, string>> = {
  eyebrow: "Eyebrow",
  heading: "Heading",
  cardKicker: "Card kicker",
  formTitle: "Form title",
  formIntro: "Form intro",
  successTitle: "Success title",
  successMessage: "Success message",
  notifyInbox: "Notification inbox",
  slaHours: "Reply window",
  showContactBlock: "Contact block",
};

export function ContactEditor({
  initial,
  promises,
  steps,
  settings,
}: {
  initial: ContactSection;
  promises: AdminPromise[];
  steps: AdminFormStep[];
  settings: SiteSettingsView;
}) {
  const { run } = useRowAction();
  const [draft, setDraft] = useState<ContactSection>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [promiseOrder, setPromiseOrder] = useState(promises);
  const [promiseDraft, setPromiseDraft] = useState<{ id?: string; body: string } | null>(
    null,
  );

  const [stepOrder, setStepOrder] = useState(steps);
  const [stepDraft, setStepDraft] = useState<StepDraft | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const changes = useMemo(() => diffFields(initial, draft, LABELS), [initial, draft]);
  useReportDirty("content:contact", changes);

  const promiseRows = promiseOrder.length ? promiseOrder : promises;
  const stepRows = stepOrder.length ? stepOrder : steps;

  function set<K extends keyof ContactSection>(key: K, value: ContactSection[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  async function persist(publish: boolean) {
    const result = await saveSection("contact", draft, publish);
    setErrors(result.fieldErrors ?? {});
    return result;
  }

  const contactDetails = [
    { icon: MapPin, label: "Address", value: `${settings.addressLine1}, ${settings.addressLine2}` },
    { icon: Mail, label: "Email", value: settings.email },
    { icon: Phone, label: "Phone", value: settings.phone },
    { icon: Clock, label: "Hours sentence", value: settings.hoursLabel },
  ];

  return (
    <>
      <div className="grid gap-5 wide:grid-cols-2 wide:items-start">
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeading title="Section copy" />

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

            <Field
              label="Heading"
              hint="Wrap a word in *asterisks* to paint it cyan to violet."
              error={errors.heading}
            >
              {(id) => (
                <Input
                  id={id}
                  value={draft.heading}
                  onChange={(event) => set("heading", event.target.value)}
                  aria-invalid={Boolean(errors.heading)}
                />
              )}
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Card kicker" error={errors.cardKicker}>
                {(id) => (
                  <Input
                    id={id}
                    value={draft.cardKicker}
                    onChange={(event) => set("cardKicker", event.target.value)}
                  />
                )}
              </Field>
              <Field label="Form card title" error={errors.formTitle}>
                {(id) => (
                  <Input
                    id={id}
                    value={draft.formTitle}
                    onChange={(event) => set("formTitle", event.target.value)}
                  />
                )}
              </Field>
            </div>

            <Field
              label="Form intro"
              error={errors.formIntro}
              aside={
                <Counter
                  value={draft.formIntro.length}
                  min={INTRO_RANGE.min}
                  max={INTRO_RANGE.max}
                />
              }
            >
              {(id) => (
                <>
                  <Textarea
                    id={id}
                    rows={3}
                    value={draft.formIntro}
                    onChange={(event) => set("formIntro", event.target.value)}
                  />
                  <Meter
                    value={draft.formIntro.length}
                    min={INTRO_RANGE.min}
                    max={INTRO_RANGE.max}
                    label="Form intro length"
                  />
                </>
              )}
            </Field>
          </Panel>

          <Panel>
            <PanelHeading
              title="Promises"
              hint="The ticked list beside the form. Saved straight to the live page."
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPromiseDraft({ body: "" })}
                >
                  <Plus size={13} /> Add promise
                </Button>
              }
            />

            <SortableList
              items={promiseRows}
              getId={(promise) => promise.id}
              onReorder={(ids) => {
                const next = ids
                  .map((id) => promiseRows.find((p) => p.id === id))
                  .filter((p): p is AdminPromise => Boolean(p));
                const previous = promiseRows;
                setPromiseOrder(next);
                run(() => reorderContactPromises(ids), {
                  rollback: () => setPromiseOrder(previous),
                  silent: true,
                });
              }}
              className="flex flex-col gap-2"
            >
              {(promise) => (
                <SortableRow
                  key={promise.id}
                  id={promise.id}
                  label={`Reorder: ${promise.body.slice(0, 30)}`}
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={promise.body}
                      aria-label="Promise text"
                      readOnly
                      onClick={() =>
                        setPromiseDraft({ id: promise.id, body: promise.body })
                      }
                      className="cursor-pointer"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit promise"
                      onClick={() =>
                        setPromiseDraft({ id: promise.id, body: promise.body })
                      }
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete promise"
                      onClick={() => {
                        if (!window.confirm("Delete this promise?")) return;
                        run(() => deleteContactPromise(promise.id));
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </SortableRow>
              )}
            </SortableList>

            {promiseDraft ? (
              <div className="mt-3 rounded-lg border border-cyan-300/25 bg-cyan-400/5 p-3">
                <Field label={promiseDraft.id ? "Edit promise" : "New promise"}>
                  {(id) => (
                    <Textarea
                      id={id}
                      rows={2}
                      autoFocus
                      value={promiseDraft.body}
                      onChange={(event) =>
                        setPromiseDraft({ ...promiseDraft, body: event.target.value })
                      }
                    />
                  )}
                </Field>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPromiseDraft(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      run(async () => {
                        const result = await saveContactPromise(promiseDraft);
                        if (result.ok) setPromiseDraft(null);
                        return result;
                      })
                    }
                  >
                    Save promise
                  </Button>
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel>
            <PanelHeading
              title="Form steps"
              hint="Drag to reorder. Each field writes to the Lead column it names."
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStepDraft(EMPTY_STEP)}
                >
                  <Plus size={13} /> Add step
                </Button>
              }
            />

            <SortableList
              items={stepRows}
              getId={(step) => step.id}
              onReorder={(ids) => {
                const next = ids
                  .map((id) => stepRows.find((step) => step.id === id))
                  .filter((step): step is AdminFormStep => Boolean(step));
                const previous = stepRows;
                setStepOrder(next);
                run(() => reorderFormSteps(ids), {
                  rollback: () => setStepOrder(previous),
                  silent: true,
                });
              }}
              className="flex flex-col gap-2"
            >
              {(step, index) => (
                <SortableRow key={step.id} id={step.id} label={`Reorder step ${index + 1}`}>
                  <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="font-mono text-[11px] tabular-nums text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-slate-100">
                          {step.question}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">
                          {step.fields.map((field) => field.name || "?").join(", ")}
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit step ${index + 1}`}
                        onClick={() =>
                          setStepDraft({
                            id: step.id,
                            question: step.question,
                            fields: step.fields,
                          })
                        }
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete step ${index + 1}`}
                        onClick={() => {
                          if (!window.confirm(`Delete "${step.question}"?`)) return;
                          run(() => deleteFormStep(step.id));
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

          <Panel>
            <PanelHeading
              title="After a submission"
              hint="The reply window is the single number that drives the overdue flag everywhere in the Leads screen."
            />

            <Field label="Success title" error={errors.successTitle}>
              {(id) => (
                <Input
                  id={id}
                  value={draft.successTitle}
                  onChange={(event) => set("successTitle", event.target.value)}
                />
              )}
            </Field>

            <Field label="Success message" error={errors.successMessage}>
              {(id) => (
                <Textarea
                  id={id}
                  rows={3}
                  value={draft.successMessage}
                  onChange={(event) => set("successMessage", event.target.value)}
                />
              )}
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Notification inbox"
                hint="Where a new enquiry is emailed."
                error={errors.notifyInbox}
              >
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    value={draft.notifyInbox}
                    onChange={(event) => set("notifyInbox", event.target.value)}
                    aria-invalid={Boolean(errors.notifyInbox)}
                  />
                )}
              </Field>

              <Field
                label="Reply window (hours)"
                hint="Drives every reply-window pill and the overdue queue."
                error={errors.slaHours}
              >
                {(id) => (
                  <Input
                    id={id}
                    type="number"
                    min={1}
                    max={336}
                    inputMode="numeric"
                    value={draft.slaHours}
                    onChange={(event) => set("slaHours", Number(event.target.value))}
                    aria-invalid={Boolean(errors.slaHours)}
                  />
                )}
              </Field>
            </div>
          </Panel>

          <Panel>
            <PanelHeading
              title="Contact block"
              hint="Read-only here. These values live in Site Settings, so a phone number is only ever typed in one place."
              actions={
                <Switch
                  checked={draft.showContactBlock}
                  label="Show the contact block on the site"
                  onChange={(next) => set("showContactBlock", next)}
                />
              }
            />

            <ul className="flex flex-col gap-2">
              {contactDetails.map((detail) => {
                const Glyph = detail.icon;
                return (
                  <li
                    key={detail.label}
                    className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/[0.02] p-3"
                  >
                    <Glyph
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 text-cyan-300"
                    />
                    <span className="min-w-0 flex-1">
                      <MicroLabel>{detail.label}</MicroLabel>
                      <span className="block truncate text-sm text-slate-200">
                        {detail.value}
                      </span>
                    </span>
                    <Badge tone="neutral">From settings</Badge>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/admin/settings?tab=contact"
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300 hover:underline"
            >
              Edit in Site Settings <ArrowUpRight size={11} aria-hidden="true" />
            </Link>
          </Panel>
        </div>

        <div className="wide:sticky wide:top-24">
          <PreviewFrame>
            <Contact
              contact={{
                ...draft,
                promises: promiseRows.map((promise) => promise.body),
                steps: stepRows.map((step) => ({
                  id: step.id,
                  stepNumber: step.stepNumber,
                  question: step.question,
                  fields: step.fields,
                })),
              }}
              settings={settings}
            />
          </PreviewFrame>
        </div>
      </div>

      <FormStepDrawer
        draft={stepDraft}
        errors={stepErrors}
        onChange={setStepDraft}
        onClose={() => {
          setStepDraft(null);
          setStepErrors({});
        }}
        onSave={() =>
          run(async () => {
            const result = await saveFormStep(stepDraft);
            if (result.ok) {
              setStepDraft(null);
              setStepErrors({});
            } else {
              setStepErrors(result.fieldErrors ?? {});
            }
            return result;
          })
        }
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

"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  Field,
  Input,
  MicroLabel,
  Select,
  Switch,
  Textarea,
} from "@/components/admin/ui/primitives";
import { Drawer } from "@/components/admin/ui/drawer";
import type { FormFieldDef } from "@/lib/schemas/content";

export type StepDraft = {
  id?: string;
  question: string;
  fields: FormFieldDef[];
};

export const EMPTY_STEP: StepDraft = {
  question: "",
  fields: [{ name: "", label: "", type: "text", required: true }],
};

const TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "select", label: "Dropdown" },
  { value: "textarea", label: "Long text" },
] as const;

/**
 * A field's `name` is the Lead column it writes to. Anything not on that
 * list is still collected and validated, but has nowhere to be stored, so
 * the known names are offered explicitly.
 */
const LEAD_COLUMNS = [
  "firstName",
  "lastName",
  "company",
  "email",
  "phone",
  "goal",
  "budgetBand",
  "message",
] as const;

export function FormStepDrawer({
  draft,
  errors,
  onChange,
  onClose,
  onSave,
}: {
  draft: StepDraft | null;
  errors: Record<string, string>;
  onChange: (next: StepDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  function updateField(index: number, patch: Partial<FormFieldDef>) {
    if (!draft) return;
    const fields = draft.fields.map((field, i) =>
      i === index ? { ...field, ...patch } : field,
    );
    onChange({ ...draft, fields });
  }

  return (
    <Drawer
      open={draft !== null}
      onClose={onClose}
      width="lg"
      title={draft?.id ? "Edit form step" : "New form step"}
      description="Each field writes to the Lead column named below, which is what makes a submission show up with its answers in the Leads screen."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save step
          </Button>
        </>
      }
    >
      {draft ? (
        <div className="flex flex-col gap-1">
          <Field
            label="Question"
            hint="Shown as the step's heading, e.g. First, who are we talking to?"
            error={errors.question}
          >
            {(id) => (
              <Input
                id={id}
                value={draft.question}
                onChange={(event) => onChange({ ...draft, question: event.target.value })}
                aria-invalid={Boolean(errors.question)}
              />
            )}
          </Field>

          <div className="mt-3">
            <MicroLabel>Fields on this step</MicroLabel>
            <div className="mt-2 flex flex-col gap-3">
              {draft.fields.map((field, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/8 bg-white/[0.02] p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <MicroLabel>Field {index + 1}</MicroLabel>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove field ${index + 1}`}
                      disabled={draft.fields.length <= 1}
                      onClick={() =>
                        onChange({
                          ...draft,
                          fields: draft.fields.filter((_, i) => i !== index),
                        })
                      }
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Stores in"
                      error={errors[`fields.${index}.name`]}
                    >
                      {(id) => (
                        <Select
                          id={id}
                          value={field.name}
                          onChange={(event) =>
                            updateField(index, { name: event.target.value })
                          }
                        >
                          <option value="">Choose a column...</option>
                          {LEAD_COLUMNS.map((column) => (
                            <option key={column} value={column}>
                              {column}
                            </option>
                          ))}
                        </Select>
                      )}
                    </Field>

                    <Field label="Label" error={errors[`fields.${index}.label`]}>
                      {(id) => (
                        <Input
                          id={id}
                          value={field.label}
                          onChange={(event) =>
                            updateField(index, { label: event.target.value })
                          }
                        />
                      )}
                    </Field>

                    <Field label="Type" error={errors[`fields.${index}.type`]}>
                      {(id) => (
                        <Select
                          id={id}
                          value={field.type}
                          onChange={(event) =>
                            updateField(index, {
                              type: event.target.value as FormFieldDef["type"],
                            })
                          }
                        >
                          {TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>
                      )}
                    </Field>

                    <div className="pt-1">
                      <label className="flex h-[42px] items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-3">
                        <span className="text-sm text-slate-200">Required</span>
                        <Switch
                          checked={field.required}
                          label={`${field.label || "Field"} is required`}
                          onChange={(next) => updateField(index, { required: next })}
                        />
                      </label>
                    </div>
                  </div>

                  {field.type === "select" ? (
                    <Field
                      label="Options, one per line"
                      error={errors[`fields.${index}.options`]}
                    >
                      {(id) => (
                        <Textarea
                          id={id}
                          rows={5}
                          value={(field.options ?? []).join("\n")}
                          onChange={(event) =>
                            updateField(index, {
                              options: event.target.value
                                .split("\n")
                                .map((line) => line.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      )}
                    </Field>
                  ) : null}
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              disabled={draft.fields.length >= 4}
              onClick={() =>
                onChange({
                  ...draft,
                  fields: [
                    ...draft.fields,
                    { name: "", label: "", type: "text", required: false },
                  ],
                })
              }
            >
              <Plus size={13} /> Add field
            </Button>
            <p className="mt-2 text-xs text-slate-400">
              Two fields sit side by side on a desktop; more than two on one
              step gets cramped.
            </p>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

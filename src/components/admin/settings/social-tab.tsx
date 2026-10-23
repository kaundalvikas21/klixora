"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Field,
  Input,
  Panel,
  PanelHeading,
  Switch,
} from "@/components/admin/ui/primitives";
import { Drawer } from "@/components/admin/ui/drawer";
import { SortableList, SortableRow } from "@/components/admin/ui/sortable";
import { SocialIcon } from "@/components/ui/social-icon";
import { useRowAction } from "@/components/admin/ui/use-action";
import {
  deleteSocialLink,
  reorderSocialLinks,
  saveSocialLink,
} from "@/server/actions/settings";

type Row = {
  id: string;
  platform: string;
  url: string;
  isVisible: boolean;
  sortOrder: number;
};

type Draft = { id?: string; platform: string; url: string; isVisible: boolean };

const EMPTY: Draft = { platform: "", url: "", isVisible: true };

/** The brand marks the footer can actually draw, from ui/social-icon.tsx. */
const KNOWN = ["LinkedIn", "Instagram", "Facebook", "YouTube"];

export function SocialTab({ initial }: { initial: Row[] }) {
  const { run } = useRowAction();
  const [order, setOrder] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const rows = (order.length ? order : initial).map((row) => ({
    ...row,
    isVisible: overrides[row.id] ?? row.isVisible,
  }));

  return (
    <>
      <Panel>
        <PanelHeading
          title="Social links"
          hint={`The footer draws a brand mark for ${KNOWN.join(", ")}. Any other platform saves fine but has no icon to render.`}
          actions={
            <Button variant="secondary" size="sm" onClick={() => setDraft(EMPTY)}>
              <Plus size={13} /> Add link
            </Button>
          }
        />

        <SortableList
          items={rows}
          getId={(row) => row.id}
          onReorder={(ids) => {
            const next = ids
              .map((id) => rows.find((row) => row.id === id))
              .filter((row): row is (typeof rows)[number] => Boolean(row));
            const previous = rows;
            setOrder(next);
            run(() => reorderSocialLinks(ids), {
              rollback: () => setOrder(previous),
              silent: true,
            });
          }}
          className="flex flex-col gap-2"
        >
          {(row) => (
            <SortableRow key={row.id} id={row.id} label={`Reorder ${row.platform}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-300">
                  <SocialIcon name={row.platform.toLowerCase()} size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-slate-100">
                    {row.platform}
                  </span>
                  <span className="block truncate font-mono text-[10px] text-slate-500">
                    {row.url}
                  </span>
                </span>

                <Switch
                  checked={row.isVisible}
                  label={`Show ${row.platform} in the footer`}
                  onChange={(next) => {
                    setOverrides((map) => ({ ...map, [row.id]: next }));
                    run(
                      () =>
                        saveSocialLink({
                          id: row.id,
                          platform: row.platform,
                          url: row.url,
                          isVisible: next,
                        }),
                      {
                        rollback: () =>
                          setOverrides((map) => ({ ...map, [row.id]: !next })),
                        silent: true,
                      },
                    );
                  }}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${row.platform}`}
                  onClick={() =>
                    setDraft({
                      id: row.id,
                      platform: row.platform,
                      url: row.url,
                      isVisible: row.isVisible,
                    })
                  }
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${row.platform}`}
                  onClick={() => {
                    if (!window.confirm(`Delete the ${row.platform} link?`)) return;
                    run(() => deleteSocialLink(row.id));
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </SortableRow>
          )}
        </SortableList>
      </Panel>

      <Drawer
        open={draft !== null}
        onClose={() => {
          setDraft(null);
          setErrors({});
        }}
        title={draft?.id ? "Edit social link" : "New social link"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                run(async () => {
                  const result = await saveSocialLink(draft);
                  if (result.ok) {
                    setDraft(null);
                    setErrors({});
                  } else {
                    setErrors(result.fieldErrors ?? {});
                  }
                  return result;
                })
              }
            >
              Save link
            </Button>
          </>
        }
      >
        {draft ? (
          <div className="flex flex-col gap-1">
            <Field
              label="Platform"
              hint={`A brand mark exists for ${KNOWN.join(", ")}.`}
              error={errors.platform}
            >
              {(id) => (
                <Input
                  id={id}
                  list="known-platforms"
                  value={draft.platform}
                  onChange={(event) =>
                    setDraft({ ...draft, platform: event.target.value })
                  }
                  aria-invalid={Boolean(errors.platform)}
                />
              )}
            </Field>
            <datalist id="known-platforms">
              {KNOWN.map((platform) => (
                <option key={platform} value={platform} />
              ))}
            </datalist>

            <Field label="URL" error={errors.url}>
              {(id) => (
                <Input
                  id={id}
                  value={draft.url}
                  placeholder="https://linkedin.com/company/klixora"
                  onChange={(event) => setDraft({ ...draft, url: event.target.value })}
                  aria-invalid={Boolean(errors.url)}
                />
              )}
            </Field>

            <label className="mt-2 flex items-center justify-between gap-4">
              <span className="text-sm text-slate-200">Visible in the footer</span>
              <Switch
                checked={draft.isVisible}
                label="Visible in the footer"
                onChange={(next) => setDraft({ ...draft, isVisible: next })}
              />
            </label>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

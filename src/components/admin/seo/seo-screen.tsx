"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
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
  Textarea,
} from "@/components/admin/ui/primitives";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { ScoreRing } from "@/components/admin/ui/charts";
import { scoreTone } from "@/lib/status";
import { ImageField } from "@/components/admin/content/image-field";
import { GooglePreview, ShareCardPreview } from "@/components/admin/seo/previews";
import { SaveBar } from "@/components/admin/shell/save-bar";
import { diffFields, useReportDirty } from "@/components/admin/shell/dirty";
import { useRowAction } from "@/components/admin/ui/use-action";
import { saveSeoDefaults, saveSeoMeta } from "@/server/actions/seo";
import {
  DESCRIPTION_RANGE,
  ROBOTS_OPTIONS,
  SCHEMA_TYPES,
  TITLE_RANGE,
  TWITTER_CARDS,
} from "@/lib/schemas/seo";
import { effectiveOgImage, seoChecks } from "@/lib/seo-score";
import type { AdminSeoPage } from "@/server/admin";
import { formatDateTime } from "@/lib/format";

type Defaults = {
  titleTemplate: string;
  defaultOgImage: string;
  twitterHandle: string;
  sitemapUrl: string;
};

const LABELS: Partial<Record<keyof AdminSeoPage, string>> = {
  metaTitle: "Meta title",
  metaDescription: "Meta description",
  canonicalUrl: "Canonical",
  robots: "Robots",
  ogTitle: "OG title",
  ogDescription: "OG description",
  ogImageUrl: "OG image",
  twitterCard: "Card type",
  focusKeywords: "Focus keywords",
  schemaType: "Schema type",
};

export function SeoScreen({
  pages,
  defaults,
  selectedSlug,
  domain,
}: {
  pages: AdminSeoPage[];
  defaults: Defaults;
  selectedSlug: string;
  domain: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { run } = useRowAction();

  const selected = pages.find((page) => page.pageSlug === selectedSlug) ?? pages[0];

  const [draft, setDraft] = useState<AdminSeoPage | undefined>(selected);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keyword, setKeyword] = useState("");

  const [defaultsDraft, setDefaultsDraft] = useState(defaults);

  const changes = useMemo(
    () => (selected && draft ? diffFields(selected, draft, LABELS) : {}),
    [selected, draft],
  );
  useReportDirty("seo:page", changes);

  function select(slug: string) {
    const next = new URLSearchParams(params.toString());
    next.set("page", slug);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    const page = pages.find((candidate) => candidate.pageSlug === slug);
    setDraft(page);
    setErrors({});
  }

  function set<K extends keyof AdminSeoPage>(key: K, value: AdminSeoPage[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  const columns: Column<AdminSeoPage>[] = [
    {
      key: "page",
      header: "Page",
      label: "",
      cell: (page) => (
        <span className="block min-w-0 text-left">
          <span className="block truncate text-sm text-slate-100">{page.pageSlug}</span>
          <span className="block truncate font-mono text-[10px] text-slate-500">
            {page.path}
          </span>
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      cell: (page) => (
        <span className="flex items-center justify-end gap-2 sm:justify-start">
          <span className="hidden min-w-0 max-w-60 truncate text-xs text-slate-300 sm:inline">
            {page.metaTitle}
          </span>
          <Counter
            value={page.metaTitle.length}
            min={TITLE_RANGE.min}
            max={TITLE_RANGE.max}
          />
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (page) => (
        <Counter
          value={page.metaDescription.length}
          min={DESCRIPTION_RANGE.min}
          max={DESCRIPTION_RANGE.max}
        />
      ),
    },
    {
      key: "og",
      header: "OG image",
      cell: (page) =>
        page.ogImageUrl ? (
          <Badge tone="live">
            <Check size={9} aria-hidden="true" /> Custom
          </Badge>
        ) : (
          // Never "missing": every page falls back to the generated card.
          <Badge tone="neutral">Generated</Badge>
        ),
    },
    {
      key: "robots",
      header: "Robots",
      cell: (page) => (
        <span className="font-mono text-[10px] text-slate-400">{page.robots}</span>
      ),
    },
    {
      key: "score",
      header: "Score",
      cell: (page) => (
        <ScoreRing
          score={page.score}
          tone={scoreTone(page.score)}
          label={`${page.pageSlug} scores ${page.score}`}
        />
      ),
    },
    {
      key: "updated",
      header: "Updated",
      cell: (page) => (
        <span className="font-mono text-[10px] tabular-nums text-slate-500">
          {formatDateTime(page.updatedAt)}
        </span>
      ),
    },
    {
      key: "edit",
      header: "Edit",
      label: "",
      cell: (page) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => select(page.pageSlug)}
          aria-label={`Edit SEO for ${page.pageSlug}`}
        >
          Edit
        </Button>
      ),
      className: "w-20",
    },
  ];

  const checks = draft ? seoChecks(draft) : [];

  return (
    <div className="flex flex-col gap-5">
      <Panel>
        <PanelHeading
          title="Pages"
          hint="Anchor entries like /#services are managed here but are not separate URLs, so they stay out of the sitemap."
        />
        <DataTable
          columns={columns}
          rows={pages}
          rowKey={(page) => page.pageSlug}
          caption="Pages and their SEO scores"
        />
      </Panel>

      {draft ? (
        <>
          <div className="grid gap-5 wide:grid-cols-2 wide:items-start">
            <div className="flex flex-col gap-5">
              <Panel>
                <PanelHeading
                  title={`Meta for ${draft.pageSlug}`}
                  actions={<ScoreRing score={draft.score} tone={scoreTone(draft.score)} size={40} />}
                />

                <Field
                  label="Meta title"
                  hint="The complete title, rendered as typed. The site-wide template below is only used by pages with no row here."
                  error={errors.metaTitle}
                  aside={
                    <Counter
                      value={draft.metaTitle.length}
                      min={TITLE_RANGE.min}
                      max={TITLE_RANGE.max}
                    />
                  }
                >
                  {(id) => (
                    <>
                      <Input
                        id={id}
                        value={draft.metaTitle}
                        onChange={(event) => set("metaTitle", event.target.value)}
                        aria-invalid={Boolean(errors.metaTitle)}
                      />
                      <Meter
                        value={draft.metaTitle.length}
                        min={TITLE_RANGE.min}
                        max={TITLE_RANGE.max}
                        label="Meta title length"
                      />
                    </>
                  )}
                </Field>

                <Field
                  label="Meta description"
                  error={errors.metaDescription}
                  aside={
                    <Counter
                      value={draft.metaDescription.length}
                      min={DESCRIPTION_RANGE.min}
                      max={DESCRIPTION_RANGE.max}
                    />
                  }
                >
                  {(id) => (
                    <>
                      <Textarea
                        id={id}
                        rows={3}
                        value={draft.metaDescription}
                        onChange={(event) => set("metaDescription", event.target.value)}
                        aria-invalid={Boolean(errors.metaDescription)}
                      />
                      <Meter
                        value={draft.metaDescription.length}
                        min={DESCRIPTION_RANGE.min}
                        max={DESCRIPTION_RANGE.max}
                        label="Meta description length"
                      />
                    </>
                  )}
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Canonical URL" error={errors.canonicalUrl}>
                    {(id) => (
                      <Input
                        id={id}
                        value={draft.canonicalUrl}
                        placeholder={`https://${domain}${draft.path}`}
                        onChange={(event) => set("canonicalUrl", event.target.value)}
                      />
                    )}
                  </Field>

                  <Field label="Robots" error={errors.robots}>
                    {(id) => (
                      <Select
                        id={id}
                        value={draft.robots}
                        onChange={(event) => set("robots", event.target.value)}
                      >
                        {ROBOTS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </div>

                <div>
                  <MicroLabel>Focus keywords</MicroLabel>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {draft.focusKeywords.map((word) => (
                      <span
                        key={word}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] py-1 pl-2.5 pr-1.5 text-xs text-slate-200"
                      >
                        {word}
                        <button
                          type="button"
                          aria-label={`Remove ${word}`}
                          onClick={() =>
                            set(
                              "focusKeywords",
                              draft.focusKeywords.filter((k) => k !== word),
                            )
                          }
                          className="rounded-full p-0.5 text-slate-500 hover:text-rose-300"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const word = keyword.trim();
                      if (!word || draft.focusKeywords.includes(word)) return;
                      set("focusKeywords", [...draft.focusKeywords, word]);
                      setKeyword("");
                    }}
                  >
                    <Input
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
                      placeholder="Add a keyword"
                      aria-label="Add a focus keyword"
                    />
                    <Button type="submit" variant="secondary" size="md">
                      <Plus size={13} /> Add
                    </Button>
                  </form>
                </div>
              </Panel>

              <Panel>
                <PanelHeading
                  title="Open Graph"
                  hint="Leave the title and description empty to reuse the meta ones."
                />

                <Field label="OG title" error={errors.ogTitle}>
                  {(id) => (
                    <Input
                      id={id}
                      value={draft.ogTitle}
                      placeholder={draft.metaTitle}
                      onChange={(event) => set("ogTitle", event.target.value)}
                    />
                  )}
                </Field>

                <Field label="OG description" error={errors.ogDescription}>
                  {(id) => (
                    <Textarea
                      id={id}
                      rows={2}
                      value={draft.ogDescription}
                      placeholder={draft.metaDescription}
                      onChange={(event) => set("ogDescription", event.target.value)}
                    />
                  )}
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Card type" error={errors.twitterCard}>
                    {(id) => (
                      <Select
                        id={id}
                        value={draft.twitterCard}
                        onChange={(event) => set("twitterCard", event.target.value)}
                      >
                        {TWITTER_CARDS.map((card) => (
                          <option key={card} value={card}>
                            {card}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>

                  <Field
                    label="Structured data type"
                    hint="Emitted as JSON-LD from Site Settings and the hours table."
                    error={errors.schemaType}
                  >
                    {(id) => (
                      <Select
                        id={id}
                        value={draft.schemaType}
                        onChange={(event) => set("schemaType", event.target.value)}
                      >
                        <option value="">None</option>
                        {SCHEMA_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </div>

                <ImageField
                  label="OG image"
                  hint="Optional. Empty is a finished state, not a gap: the thumbnail shows exactly what this page shares today. Upload to use your own art instead."
                  value={draft.ogImageUrl}
                  onChange={(url) => set("ogImageUrl", url)}
                  recommendation="1200x630 is what every platform crops to"
                  // What an empty field actually resolves to: the site-wide
                  // fallback if one is set, otherwise this page's generated
                  // card. Shown rather than described, so nobody has to take
                  // the hint's word for it.
                  fallbackSrc={
                    effectiveOgImage(draft.pageSlug, defaultsDraft.defaultOgImage).url
                  }
                  fallbackNote={
                    defaultsDraft.defaultOgImage
                      ? "Using the site-wide fallback image"
                      : "Generated from this page's title, description and hero"
                  }
                  error={errors.ogImageUrl}
                />
              </Panel>
            </div>

            <div className="flex flex-col gap-5 wide:sticky wide:top-24">
              <Panel className="flex flex-col gap-5">
                <GooglePreview
                  title={draft.metaTitle}
                  description={draft.metaDescription}
                  canonicalUrl={draft.canonicalUrl}
                  path={draft.path}
                  domain={domain}
                />
                <ShareCardPreview
                  title={draft.ogTitle || draft.metaTitle}
                  description={draft.ogDescription || draft.metaDescription}
                  // What the page will really share: uploaded art if there
                  // is any, otherwise the generated card.
                  imageUrl={
                    effectiveOgImage(
                      draft.pageSlug,
                      draft.ogImageUrl || defaultsDraft.defaultOgImage,
                    ).url
                  }
                  generated={
                    effectiveOgImage(
                      draft.pageSlug,
                      draft.ogImageUrl || defaultsDraft.defaultOgImage,
                    ).generated
                  }
                  canonicalUrl={draft.canonicalUrl}
                  domain={domain}
                />
              </Panel>

              <Panel>
                <PanelHeading
                  title="Checks"
                  hint="What is wrong and why it costs you something, rather than a row of ticks."
                />
                <ul className="flex flex-col gap-2.5">
                  {checks.map((check) => (
                    <li key={check.id} className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          check.passed ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm text-slate-200">{check.label}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {check.passed ? "pass" : `-${check.points}`}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                          {check.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>

          <SaveBar
            onSaveDraft={() => persistPage(draft, setErrors)}
            onPublish={() => persistPage(draft, setErrors)}
            onDiscard={() => {
              setDraft(selected);
              setErrors({});
            }}
          />
        </>
      ) : null}

      <Panel>
        <PanelHeading
          title="Site-wide defaults"
          hint="Used wherever a page leaves a field empty."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                run(async () => {
                  const result = await saveSeoDefaults(defaultsDraft);
                  if (!result.ok) toast.error(result.message);
                  return result;
                })
              }
            >
              Save defaults
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Title template"
            hint="%s is replaced with each page's own title."
          >
            {(id) => (
              <Input
                id={id}
                value={defaultsDraft.titleTemplate}
                onChange={(event) =>
                  setDefaultsDraft({ ...defaultsDraft, titleTemplate: event.target.value })
                }
              />
            )}
          </Field>

          <Field label="Twitter handle">
            {(id) => (
              <Input
                id={id}
                value={defaultsDraft.twitterHandle}
                placeholder="@klixora"
                onChange={(event) =>
                  setDefaultsDraft({ ...defaultsDraft, twitterHandle: event.target.value })
                }
              />
            )}
          </Field>

          <Field label="Sitemap URL">
            {(id) => (
              <Input
                id={id}
                value={defaultsDraft.sitemapUrl}
                placeholder={`https://${domain}/sitemap.xml`}
                onChange={(event) =>
                  setDefaultsDraft({ ...defaultsDraft, sitemapUrl: event.target.value })
                }
              />
            )}
          </Field>

          <div className="sm:col-span-2">
            <ImageField
              label="Fallback OG image"
              hint="Used by any page without its own. Leave it empty and every page generates its own card instead, which is usually the better answer."
              recommendation="1200x630"
              value={defaultsDraft.defaultOgImage}
              onChange={(url) =>
                setDefaultsDraft({ ...defaultsDraft, defaultOgImage: url })
              }
              fallbackSrc={effectiveOgImage(selectedSlug).url}
              fallbackNote="No fallback set, so each page generates its own"
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}

/**
 * SEO has no draft stage, so "Save draft" and "Save & publish" do the same
 * thing here: a meta description is published the moment it is saved.
 */
async function persistPage(
  draft: AdminSeoPage,
  setErrors: (errors: Record<string, string>) => void,
) {
  const result = await saveSeoMeta({
    pageSlug: draft.pageSlug,
    path: draft.path,
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
    canonicalUrl: draft.canonicalUrl,
    robots: draft.robots,
    ogTitle: draft.ogTitle,
    ogDescription: draft.ogDescription,
    ogImageUrl: draft.ogImageUrl,
    twitterCard: draft.twitterCard,
    focusKeywords: draft.focusKeywords,
    schemaType: draft.schemaType,
  });
  setErrors(result.fieldErrors ?? {});
  return result;
}

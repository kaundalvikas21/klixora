import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Database, Inbox } from "lucide-react";
import { KpiTile } from "@/components/admin/overview/kpi-tile";
import { RangeToggle } from "@/components/admin/overview/range-toggle";
import { FitBar, SourceBars } from "@/components/admin/ui/charts";
import {
  Badge,
  EmptyState,
  MicroLabel,
  Panel,
  PanelHeading,
} from "@/components/admin/ui/primitives";
import { getOverview } from "@/server/admin";
import { isSupabaseConfigured } from "@/server/supabase";
import { formatDateTime } from "@/lib/format";
import { slaState } from "@/lib/sla";
import { SLA_BADGE_TONE } from "@/components/admin/leads/sla-pill";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

/** The queue is ordered by cost of delay, so its badges follow the same
 *  scale as everything else: an overdue lead is critical, a draft service is
 *  a warning, a missing OG image is informational. */
const QUEUE_TONE = {
  lead: "critical",
  service: "warning",
  seo: "info",
} as const;

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: raw } = await searchParams;
  const days = raw === "30" ? 30 : 7;

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        icon={<Database size={22} />}
        title="No database connected"
        detail="Run `npm run db:start` to bring the local Supabase stack up, then copy the printed keys into .env.local. The public site keeps rendering the seeded copy until then."
      />
    );
  }

  const overview = await getOverview(days);
  const now = overview.now;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-relaxed text-slate-400">
          Figures cover the last {days} days, compared with the {days} before
          that.
        </p>
        <RangeToggle days={days} />
      </div>

      {/* One row of four from `wide`, two-up on a tablet, stacked on a
          phone. `auto-cols-fr` keeps the four equal regardless of how long
          a footnote runs. */}
      <div
        data-testid="kpi-grid"
        className="grid gap-4 sm:grid-cols-2 wide:grid-cols-4 wide:auto-cols-fr"
      >
        {overview.tiles.map((tile) => (
          <KpiTile key={tile.id} tile={tile} />
        ))}
      </div>

      {/* items-start: each panel is as tall as its own content, rather than
          the sources chart stretching to match a long queue. */}
      <div className="grid items-start gap-5 wide:grid-cols-[1.4fr_1fr]">
        <Panel>
          <PanelHeading
            title="Needs you now"
            hint="Ordered by cost of delay: leads past the reply window first, then work that is written but is not live."
          />
          {overview.queue.length ? (
            <ul className="flex flex-col gap-2">
              {overview.queue.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/[0.02] p-3 transition-colors hover:border-cyan-300/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    <Badge tone={QUEUE_TONE[item.kind]} className="mt-0.5 shrink-0">
                      {item.kind}
                    </Badge>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-100">
                        {item.title}
                      </span>
                      <span className="block text-xs leading-relaxed text-slate-400">
                        {item.detail}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={14}
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-slate-500"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nothing is waiting"
              detail="No lead is past its reply window, and nothing is sitting in draft."
            />
          )}
        </Panel>

        <Panel>
          <PanelHeading
            title="How leads reach the form"
            // One form, so the interesting question is not which form but
            // which route: the CTA they clicked, or a scroll straight to it.
            hint={`Which route they took to the one enquiry form. Last ${days} days.`}
          />
          <SourceBars items={overview.sources} />
        </Panel>
      </div>

      <Panel>
        <PanelHeading
          title="Latest leads"
          actions={
            <Link
              href="/admin/leads"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300 hover:underline"
            >
              All leads
            </Link>
          }
        />
        {overview.recentLeads.length ? (
          <ul className="flex flex-col divide-y divide-white/5">
            {overview.recentLeads.map((lead) => {
              const sla = slaState(
                new Date(lead.createdAt),
                overview.slaHours,
                lead.status,
                new Date(now),
              );
              return (
                <li key={lead.id}>
                  <Link
                    href={`/admin/leads?lead=${lead.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 transition-colors hover:bg-white/[0.02] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-100">
                        {lead.firstName} {lead.lastName}
                        {lead.company ? (
                          <span className="text-slate-500"> · {lead.company}</span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                        {lead.ref} · {lead.source}
                      </span>
                    </span>
                    <FitBar score={lead.fitScore} />
                    <Badge
                      tone={SLA_BADGE_TONE[sla.tone]}
                    >
                      {sla.label}
                    </Badge>
                    <span className="font-mono text-[10px] tabular-nums text-slate-500">
                      {formatDateTime(lead.createdAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={<Inbox size={20} />}
            title="No leads yet"
            detail="Submissions from the home page form land here, with the block they came from and any UTM parameters."
          />
        )}
      </Panel>

      <div className="grid gap-3 sm:grid-cols-3">
        {overview.blocks.map((block) => (
          <Link
            key={block.key}
            href={`/admin/content?tab=${block.key}`}
            className="rounded-xl border border-white/8 bg-card/70 p-4 transition-colors hover:border-cyan-300/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <div className="flex items-center justify-between gap-2">
              <MicroLabel>{block.label}</MicroLabel>
              {block.state.hasUnpublishedChanges ? (
                <Badge tone="draft">
                  <AlertTriangle size={9} aria-hidden="true" /> Unpublished
                </Badge>
              ) : (
                <Badge tone="live">Live</Badge>
              )}
            </div>
            <p className="mt-3 text-sm text-slate-200">{block.rowSummary}</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
              {block.state.publishedAt
                ? `Published ${formatDateTime(block.state.publishedAt)}`
                : "Never published"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

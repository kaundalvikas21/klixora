"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Columns3,
  Download,
  Inbox,
  Rows3,
  Search,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  MicroLabel,
  Panel,
  Select,
} from "@/components/admin/ui/primitives";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { FitBar } from "@/components/admin/ui/charts";
import { SlaPill } from "@/components/admin/leads/sla-pill";
import { LeadBoard } from "@/components/admin/leads/lead-board";
import { LeadDrawer } from "@/components/admin/leads/lead-drawer";
import { useRowAction } from "@/components/admin/ui/use-action";
import {
  bulkUpdateLeads,
  exportLeadsCsv,
  setLeadStatus,
} from "@/server/actions/leads";
import { LEAD_STATUSES, type LeadStatusName } from "@/lib/schemas/leads";
import { LEAD_LABEL, LEAD_TONE, STATUS } from "@/lib/status";
import type { AdminLead, AdminLeadNote } from "@/server/admin";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/utils/cn";

const CHIPS = ["all", ...LEAD_STATUSES] as const;

export function LeadsScreen({
  leads,
  counts,
  users,
  slaHours,
  openLead,
  openLeadNotes,
  filters,
}: {
  leads: AdminLead[];
  counts: Record<string, number>;
  users: { id: string; name: string }[];
  slaHours: number;
  openLead: AdminLead | null;
  openLeadNotes: AdminLeadNote[];
  filters: { q: string; status: string; view: "table" | "board" };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { run } = useRowAction();

  const [query, setQuery] = useState(filters.q);
  const [selected, setSelected] = useState<string[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, LeadStatusName>
  >({});

  /**
   * `now` is captured once per mount rather than read during render, so the
   * reply-window pills do not produce a different string on the server and
   * in the browser.
   */
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const rows = useMemo(
    () =>
      leads.map((lead) => ({
        ...lead,
        status: statusOverrides[lead.id] ?? lead.status,
      })),
    [leads, statusOverrides],
  );

  function setParam(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  // Debounced search: the query lives in the URL so the server can filter.
  useEffect(() => {
    if (query === filters.q) return;
    const timer = setTimeout(() => setParam({ q: query || null }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function move(id: string, status: LeadStatusName) {
    const previous = rows.find((lead) => lead.id === id)?.status;
    setStatusOverrides((map) => ({ ...map, [id]: status }));
    run(() => setLeadStatus({ id, status }), {
      rollback: () =>
        setStatusOverrides((map) => ({ ...map, [id]: previous ?? "NEW" })),
      silent: true,
    });
  }

  function download(csv: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `klixora-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: "select",
      header: "Select",
      label: "",
      cell: (lead) => (
        <input
          type="checkbox"
          checked={selected.includes(lead.id)}
          aria-label={`Select ${lead.firstName} ${lead.lastName}`}
          onChange={(event) =>
            setSelected((current) =>
              event.target.checked
                ? [...current, lead.id]
                : current.filter((id) => id !== lead.id),
            )
          }
          className="h-4 w-4 accent-cyan-400"
        />
      ),
      className: "w-10",
    },
    {
      key: "lead",
      header: "Lead",
      label: "",
      cell: (lead) => (
        <span className="block min-w-0 text-left">
          <span className="block truncate text-sm text-slate-100">
            {lead.firstName} {lead.lastName}
            {lead.company ? (
              <span className="text-slate-500"> · {lead.company}</span>
            ) : null}
          </span>
          <span className="block truncate font-mono text-[10px] text-slate-500">
            {lead.ref} · {lead.email}
          </span>
        </span>
      ),
    },
    {
      key: "goal",
      header: "Goal",
      cell: (lead) => (
        <span className="block min-w-0 text-left">
          <span className="block truncate text-sm text-slate-200">{lead.goal}</span>
          {lead.budgetBand ? (
            <span className="block truncate font-mono text-[10px] text-slate-500">
              {lead.budgetBand}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      cell: (lead) => <Badge tone="neutral">{lead.source}</Badge>,
    },
    { key: "fit", header: "Fit", cell: (lead) => <FitBar score={lead.fitScore} /> },
    {
      key: "status",
      header: "Status",
      cell: (lead) => (
        <span className="flex items-center justify-end gap-2 sm:justify-start">
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              STATUS[LEAD_TONE[lead.status] ?? "neutral"].dot,
            )}
          />
        <Select
          value={lead.status}
          aria-label={`Status for ${lead.firstName} ${lead.lastName}`}
          onChange={(event) => move(lead.id, event.target.value as LeadStatusName)}
          className="!w-auto !py-1.5 !text-xs"
        >
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        </span>
      ),
    },
    {
      key: "sla",
      header: "Reply window",
      cell: (lead) => (
        <SlaPill
          createdAt={lead.createdAt}
          slaHours={slaHours}
          status={lead.status}
          now={now}
        />
      ),
    },
    {
      key: "received",
      header: "Received",
      cell: (lead) => (
        <span className="font-mono text-[11px] tabular-nums text-slate-400">
          {formatDateTime(lead.createdAt)}
        </span>
      ),
    },
    {
      key: "open",
      header: "Open",
      label: "",
      cell: (lead) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setParam({ lead: lead.id })}
          aria-label={`Open ${lead.firstName} ${lead.lastName}`}
        >
          Open
        </Button>
      ),
      className: "w-20",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, company, email, goal or source"
              aria-label="Search leads"
              className="pl-9"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-200"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          <div
            role="group"
            aria-label="View"
            className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
          >
            {(
              [
                { id: "table", icon: Rows3, label: "Table" },
                { id: "board", icon: Columns3, label: "Board" },
              ] as const
            ).map((option) => {
              const Glyph = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={filters.view === option.id}
                  aria-label={`${option.label} view`}
                  onClick={() => setParam({ view: option.id })}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
                    filters.view === option.id
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:text-slate-200",
                  )}
                >
                  <Glyph size={14} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() =>
              run(async () => {
                const result = await exportLeadsCsv(
                  selected.length ? selected : undefined,
                );
                if (result.ok && result.data) download(result.data);
                return result;
              })
            }
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>

        {/* Pipeline states carry their stage colour: new is informational,
            contacted is in-flight, qualified and won are green, lost is the
            red end. Each chip pairs the colour with a dot AND the state's
            name, so the status never rests on hue alone. */}
        <div
          role="group"
          aria-label="Filter by status"
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 no-scrollbar"
        >
          {CHIPS.map((chip) => {
            const isActive = (filters.status || "all") === chip;
            const count = counts[chip] ?? 0;
            const tone = STATUS[LEAD_TONE[chip] ?? "neutral"];
            const empty = count === 0 && chip !== "all";

            return (
              <button
                key={chip}
                type="button"
                aria-pressed={isActive}
                title={LEAD_LABEL[chip]}
                onClick={() => setParam({ status: chip === "all" ? null : chip })}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
                  isActive
                    ? tone.chip
                    : "border-white/10 text-slate-300 hover:border-white/20",
                  // An empty bucket recedes rather than shouting a colour at
                  // a number that is zero.
                  empty && !isActive && "opacity-55",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)}
                />
                {chip === "all" ? "All" : chip}
                <span className="font-mono text-[10px] tabular-nums opacity-70">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      {selected.length ? (
        <Panel className="flex flex-wrap items-center gap-3 border-cyan-300/25 bg-cyan-400/5">
          <MicroLabel>{selected.length} selected</MicroLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() =>
                run(async () => {
                  const result = await bulkUpdateLeads({
                    ids: selected,
                    action: "contacted",
                  });
                  if (result.ok) setSelected([]);
                  return result;
                })
              }
            >
              Mark contacted
            </Button>

            <Select
              aria-label="Assign selected leads to"
              defaultValue=""
              onChange={(event) => {
                const assignedToId = event.target.value;
                if (!assignedToId) return;
                run(async () => {
                  const result = await bulkUpdateLeads({
                    ids: selected,
                    action: "assign",
                    assignedToId,
                  });
                  if (result.ok) setSelected([]);
                  return result;
                });
              }}
              className="!w-auto !py-1.5 !text-xs"
            >
              <option value="">Assign to...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>

            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                run(async () => {
                  const result = await exportLeadsCsv(selected);
                  if (result.ok && result.data) download(result.data);
                  return result;
                })
              }
            >
              <Download size={13} /> Export selected
            </Button>

            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        </Panel>
      ) : null}

      {filters.view === "board" ? (
        <LeadBoard
          leads={rows}
          slaHours={slaHours}
          now={now}
          onMove={move}
          onOpen={(id) => setParam({ lead: id })}
        />
      ) : (
        <Panel>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(lead) => lead.id}
            caption="Contact leads"
            empty={
              <EmptyState
                icon={<Inbox size={20} />}
                title={filters.q || filters.status ? "Nothing matches" : "No leads yet"}
                detail={
                  filters.q || filters.status
                    ? "Clear the search or pick a different status chip."
                    : "Submissions from the home page form land here with the block they came from and any UTM parameters."
                }
                action={
                  filters.q || filters.status ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setQuery("");
                        setParam({ q: null, status: null });
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        </Panel>
      )}

      <LeadDrawer
        lead={openLead}
        notes={openLeadNotes}
        users={users}
        slaHours={slaHours}
        now={now}
        onClose={() => setParam({ lead: null })}
      />
    </div>
  );
}

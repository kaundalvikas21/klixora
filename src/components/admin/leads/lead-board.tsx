"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FitBar } from "@/components/admin/ui/charts";
import { MicroLabel, Select } from "@/components/admin/ui/primitives";
import { SlaPill } from "@/components/admin/leads/sla-pill";
import { LEAD_STATUSES, type LeadStatusName } from "@/lib/schemas/leads";
import { LEAD_LABEL, LEAD_TONE, STATUS } from "@/lib/status";
import type { AdminLead } from "@/server/admin";
import { cn } from "@/utils/cn";

/**
 * Kanban by status. Dragging a card between columns changes the status.
 *
 * Every card also carries a status select: a board that can only be driven
 * by dragging is unusable with a keyboard or on a phone, and dnd-kit's
 * keyboard sensor cannot express "move to another column" on its own.
 */
export function LeadBoard({
  leads,
  slaHours,
  now,
  onMove,
  onOpen,
}: {
  leads: AdminLead[];
  slaHours: number;
  now: number;
  onMove: (id: string, status: LeadStatusName) => void;
  onOpen: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    const status = event.over?.id;
    const id = event.active.id;
    if (!status || typeof status !== "string") return;
    if (!LEAD_STATUSES.includes(status as LeadStatusName)) return;

    const lead = leads.find((candidate) => candidate.id === id);
    if (!lead || lead.status === status) return;

    onMove(String(id), status as LeadStatusName);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {LEAD_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            leads={leads.filter((lead) => lead.status === status)}
            slaHours={slaHours}
            now={now}
            onMove={onMove}
            onOpen={onOpen}
          />
        ))}
      </div>
    </DndContext>
  );
}

function Column({
  status,
  leads,
  slaHours,
  now,
  onMove,
  onOpen,
}: {
  status: LeadStatusName;
  leads: AdminLead[];
  slaHours: number;
  now: number;
  onMove: (id: string, status: LeadStatusName) => void;
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[17rem] shrink-0 flex-col rounded-xl border bg-white/[0.02] p-2.5 transition-colors",
        isOver ? "border-cyan-300/50 bg-cyan-400/5" : "border-white/8",
      )}
    >
      {/* The column header carries the stage colour as a dot plus its name,
          so the board is still readable in greyscale. */}
      <header
        className="flex items-center justify-between px-1 pb-2"
        title={LEAD_LABEL[status]}
      >
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              STATUS[LEAD_TONE[status] ?? "neutral"].dot,
            )}
          />
          <MicroLabel>{status}</MicroLabel>
        </span>
        <span className="font-mono text-[10px] tabular-nums text-slate-500">
          {leads.length}
        </span>
      </header>

      <ul className="flex min-h-24 flex-col gap-2">
        {leads.map((lead) => (
          <Card
            key={lead.id}
            lead={lead}
            slaHours={slaHours}
            now={now}
            onMove={onMove}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </section>
  );
}

function Card({
  lead,
  slaHours,
  now,
  onMove,
  onOpen,
}: {
  lead: AdminLead;
  slaHours: number;
  now: number;
  onMove: (id: string, status: LeadStatusName) => void;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-lg border border-white/8 bg-card/80 p-2.5",
        isDragging && "relative z-10 opacity-90 shadow-lg shadow-black/50",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <button
          type="button"
          onClick={() => onOpen(lead.id)}
          className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          <span className="block truncate text-sm text-slate-100">
            {lead.firstName} {lead.lastName}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
            {lead.ref} · {lead.source}
          </span>
        </button>

        <p className="mt-2 truncate text-xs text-slate-400">{lead.goal}</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <FitBar score={lead.fitScore} />
          <SlaPill
            createdAt={lead.createdAt}
            slaHours={slaHours}
            status={lead.status}
            now={now}
          />
        </div>
      </div>

      <Select
        value={lead.status}
        aria-label={`Status for ${lead.firstName} ${lead.lastName}`}
        onChange={(event) => onMove(lead.id, event.target.value as LeadStatusName)}
        className="mt-2 !py-1.5 !text-xs"
      >
        {LEAD_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </li>
  );
}

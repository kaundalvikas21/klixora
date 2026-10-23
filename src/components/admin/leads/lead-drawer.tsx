"use client";

import { useState } from "react";
import { Check, Copy, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Field,
  MicroLabel,
  Select,
  Textarea,
} from "@/components/admin/ui/primitives";
import { Drawer } from "@/components/admin/ui/drawer";
import { FitBar } from "@/components/admin/ui/charts";
import { SlaPill } from "@/components/admin/leads/sla-pill";
import { useRowAction } from "@/components/admin/ui/use-action";
import { addLeadNote, assignLead, setLeadStatus } from "@/server/actions/leads";
import { LEAD_STATUSES, type LeadStatusName } from "@/lib/schemas/leads";
import type { AdminLead, AdminLeadNote } from "@/server/admin";
import { formatDateTime } from "@/lib/format";

export function LeadDrawer({
  lead,
  notes,
  users,
  slaHours,
  now,
  onClose,
}: {
  lead: AdminLead | null;
  notes: AdminLeadNote[];
  users: { id: string; name: string }[];
  slaHours: number;
  now: number;
  onClose: () => void;
}) {
  const { run } = useRowAction();
  const [note, setNote] = useState("");

  if (!lead) {
    return <Drawer open={false} onClose={onClose} title="Lead">{null}</Drawer>;
  }

  const answers = [
    { label: "First name", value: lead.firstName },
    { label: "Last name", value: lead.lastName },
    { label: "Company", value: lead.company },
    { label: "Email", value: lead.email },
    { label: "Phone", value: lead.phone },
    { label: "Goal", value: lead.goal },
    { label: "Budget", value: lead.budgetBand },
    { label: "Message", value: lead.message },
  ].filter((answer) => answer.value);

  const events = notes.filter((entry) => entry.kind === "event");
  const comments = notes.filter((entry) => entry.kind !== "event");

  return (
    <Drawer
      open
      onClose={onClose}
      width="lg"
      title={`${lead.firstName} ${lead.lastName}`}
      description={`${lead.ref} · ${lead.source} · received ${formatDateTime(lead.createdAt)}`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <FitBar score={lead.fitScore} />
          <SlaPill
            createdAt={lead.createdAt}
            slaHours={slaHours}
            status={lead.status}
            now={now}
          />
          {lead.firstReplyAt ? (
            <Badge tone="live">
              <Check size={9} aria-hidden="true" /> Replied{" "}
              {formatDateTime(lead.firstReplyAt)}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyButton
            value={lead.email}
            label="Copy email"
            icon={<Mail size={13} />}
          />
          {lead.phone ? (
            <CopyButton
              value={lead.phone}
              label="Copy phone"
              icon={<Phone size={13} />}
            />
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Status">
            {(id) => (
              <Select
                id={id}
                value={lead.status}
                onChange={(event) =>
                  run(() =>
                    setLeadStatus({
                      id: lead.id,
                      status: event.target.value as LeadStatusName,
                    }),
                  )
                }
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Assigned to">
            {(id) => (
              <Select
                id={id}
                value={lead.assignedToId ?? ""}
                onChange={(event) =>
                  run(() => assignLead(lead.id, event.target.value || null))
                }
              >
                <option value="">Nobody</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <section>
          <MicroLabel>Form answers</MicroLabel>
          <dl className="mt-2 flex flex-col divide-y divide-white/5 rounded-lg border border-white/8">
            {answers.map((answer) => (
              <div
                key={answer.label}
                className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5"
              >
                <dt>
                  <MicroLabel>{answer.label}</MicroLabel>
                </dt>
                <dd className="min-w-0 max-w-full text-sm text-slate-200 sm:max-w-[60%] sm:text-right">
                  {answer.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {lead.utm && Object.keys(lead.utm).length ? (
          <section>
            <MicroLabel>Attribution</MicroLabel>
            <dl className="mt-2 flex flex-col divide-y divide-white/5 rounded-lg border border-white/8">
              {Object.entries(lead.utm).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-baseline justify-between gap-2 px-3 py-2"
                >
                  <dt className="font-mono text-[10px] text-slate-400">{key}</dt>
                  <dd className="truncate font-mono text-xs text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section>
          <MicroLabel>Internal notes</MicroLabel>
          <div className="mt-2">
            <Textarea
              rows={3}
              value={note}
              placeholder="What did you say, and what happens next?"
              aria-label="New internal note"
              onChange={(event) => setNote(event.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                disabled={note.trim().length === 0}
                onClick={() =>
                  run(async () => {
                    const result = await addLeadNote({ leadId: lead.id, body: note });
                    if (result.ok) setNote("");
                    return result;
                  })
                }
              >
                Add note
              </Button>
            </div>
          </div>

          {comments.length ? (
            <ul className="mt-3 flex flex-col gap-2">
              {comments.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-white/8 bg-white/[0.02] p-3"
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                    {entry.body}
                  </p>
                  <p className="mt-1.5 font-mono text-[10px] text-slate-500">
                    {formatDateTime(entry.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-slate-400">No notes yet.</p>
          )}
        </section>

        <section>
          <MicroLabel>Activity</MicroLabel>
          <ol className="mt-2 flex flex-col gap-0">
            {events.map((entry, index) => (
              <li key={entry.id} className="flex gap-3">
                <span className="flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"
                  />
                  {index < events.length - 1 ? (
                    <span aria-hidden="true" className="w-px flex-1 bg-white/10" />
                  ) : null}
                </span>
                <span className="min-w-0 pb-4">
                  <span className="block text-sm text-slate-200">{entry.body}</span>
                  <span className="block font-mono text-[10px] text-slate-500">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </span>
              </li>
            ))}
            {events.length === 0 ? (
              <li className="text-xs text-slate-400">Nothing recorded yet.</li>
            ) : null}
          </ol>
        </section>
      </div>
    </Drawer>
  );
}

function CopyButton({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          // Clipboard access needs a secure context and can be blocked.
          toast.error(`Could not copy. The value is ${value}`);
        }
      }}
    >
      {copied ? <Check size={13} /> : icon}
      <span className="max-w-40 truncate">{copied ? "Copied" : value}</span>
      <span className="sr-only">{label}</span>
      {copied ? null : <Copy size={11} aria-hidden="true" className="text-slate-500" />}
    </Button>
  );
}

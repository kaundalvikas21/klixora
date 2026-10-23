"use client";

import { useMemo, useState } from "react";
import { CopyCheck } from "lucide-react";
import {
  Button,
  Input,
  Panel,
  PanelHeading,
  Switch,
} from "@/components/admin/ui/primitives";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { SaveBar } from "@/components/admin/shell/save-bar";
import { useReportDirty, type DirtyChange } from "@/components/admin/shell/dirty";
import { saveWorkingHours } from "@/server/actions/settings";
import { DAY_NAMES } from "@/lib/schemas/settings";
import { hoursBetween } from "@/lib/format";

type Row = {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
};

export function HoursTab({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // One dirty entry per changed day, so the save bar names the day rather
  // than saying "hours changed".
  const changes = useMemo(() => {
    const result: Record<string, DirtyChange> = {};
    rows.forEach((row, index) => {
      const before = initial[index];
      if (!before) return;
      if (JSON.stringify(before) === JSON.stringify(row)) return;
      result[`day-${row.dayOfWeek}`] = {
        label: DAY_NAMES[row.dayOfWeek]!,
        summary: row.isClosed ? "set to closed" : `${row.opensAt} to ${row.closesAt}`,
      };
    });
    return result;
  }, [initial, rows]);

  useReportDirty("settings:hours", changes);

  function update(dayOfWeek: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row) => (row.dayOfWeek === dayOfWeek ? { ...row, ...patch } : row)),
    );
    setErrors({});
  }

  /** Monday to every weekday, which is how most weeks are actually set up. */
  function copyMonday() {
    const monday = rows.find((row) => row.dayOfWeek === 0);
    if (!monday) return;
    setRows((current) =>
      current.map((row) =>
        row.dayOfWeek >= 1 && row.dayOfWeek <= 4
          ? {
              ...row,
              opensAt: monday.opensAt,
              closesAt: monday.closesAt,
              isClosed: monday.isClosed,
            }
          : row,
      ),
    );
  }

  async function persist() {
    const result = await saveWorkingHours({ hours: rows });
    setErrors(result.fieldErrors ?? {});
    return result;
  }

  const columns: Column<Row>[] = [
    {
      key: "day",
      header: "Day",
      label: "",
      cell: (row) => (
        <span className="text-sm text-slate-100">{DAY_NAMES[row.dayOfWeek]}</span>
      ),
    },
    {
      key: "opens",
      header: "Opens",
      cell: (row) => (
        <Input
          type="time"
          value={row.opensAt}
          disabled={row.isClosed}
          aria-label={`${DAY_NAMES[row.dayOfWeek]} opening time`}
          onChange={(event) => update(row.dayOfWeek, { opensAt: event.target.value })}
          className="!w-32 !py-1.5"
        />
      ),
    },
    {
      key: "closes",
      header: "Closes",
      cell: (row) => (
        <Input
          type="time"
          value={row.closesAt}
          disabled={row.isClosed}
          aria-label={`${DAY_NAMES[row.dayOfWeek]} closing time`}
          onChange={(event) => update(row.dayOfWeek, { closesAt: event.target.value })}
          className="!w-32 !py-1.5"
        />
      ),
    },
    {
      key: "duration",
      header: "Open for",
      cell: (row) => (
        <span className="font-mono text-[11px] tabular-nums text-slate-400">
          {row.isClosed ? "closed" : hoursBetween(row.opensAt, row.closesAt)}
        </span>
      ),
    },
    {
      key: "closed",
      header: "Closed",
      cell: (row) => (
        <Switch
          checked={row.isClosed}
          label={`${DAY_NAMES[row.dayOfWeek]} is closed`}
          onChange={(next) => update(row.dayOfWeek, { isClosed: next })}
        />
      ),
    },
  ];

  return (
    <>
      <Panel>
        <PanelHeading
          title="Working hours"
          hint="This table is what search engines read: it becomes the openingHoursSpecification in the structured data. The sentence on the Contact details tab is what visitors read, and the two are allowed to differ."
          actions={
            <Button variant="secondary" size="sm" onClick={copyMonday}>
              <CopyCheck size={13} /> Copy Monday to weekdays
            </Button>
          }
        />

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => String(row.dayOfWeek)}
          caption="Opening hours by day"
        />

        {Object.keys(errors).length ? (
          <p aria-live="polite" className="mt-3 text-xs text-rose-300">
            {Object.values(errors)[0]}
          </p>
        ) : null}
      </Panel>

      <SaveBar
        onSaveDraft={persist}
        onPublish={persist}
        onDiscard={() => {
          setRows(initial);
          setErrors({});
        }}
      />
    </>
  );
}

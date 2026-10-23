import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * One table renderer for every admin table.
 *
 * The responsive behaviour is CSS (see `responsive-table` in globals.css):
 * below 720px each row becomes a labelled card. Wide tables scroll inside
 * their own container, never the page.
 */
export type Column<Row> = {
  key: string;
  /** Column heading, and the prefix each cell carries on a phone. */
  header: ReactNode;
  /** Pass "" to suppress the prefix, for a cell that is the row's identity. */
  label?: string;
  cell: (row: Row) => ReactNode;
  className?: string;
};

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  caption,
  empty,
  className,
}: {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  caption: string;
  empty?: ReactNode;
  className?: string;
}) {
  if (!rows.length && empty) return <>{empty}</>;

  return (
    <div className={cn("-mx-1 overflow-x-auto px-1", className)}>
      <table className="responsive-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(
                onRowClick &&
                  "cursor-pointer transition-colors hover:bg-white/[0.03] md:focus-within:bg-white/[0.03]",
              )}
            >
              {columns.map((column, index) => (
                <td
                  key={column.key}
                  data-label={
                    column.label ?? (typeof column.header === "string" ? column.header : "")
                  }
                  className={column.className}
                  // The whole row opens the record, but only a real button or
                  // link inside it is keyboard-reachable, which is why each
                  // table also renders an explicit "open" control.
                  onClick={
                    onRowClick && index !== columns.length - 1
                      ? () => onRowClick(row)
                      : undefined
                  }
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

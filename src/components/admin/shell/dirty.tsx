"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Unsaved-edit tracking.
 *
 * An editor reports its dirty fields here; the save bar renders them and the
 * navigation guard reads the count. It is one shared record rather than
 * per-editor state because the rail, the top bar and the browser's unload
 * warning all have to agree on whether anything is unsaved.
 */
export type DirtyChange = {
  /** Field name as the operator would read it, e.g. "Sub-headline". */
  label: string;
  /** One line describing what changed, e.g. "142 -> 151 characters". */
  summary: string;
};

type DirtyContextValue = {
  changes: Record<string, DirtyChange>;
  count: number;
  /** Replaces the whole set for one owner, keyed to avoid cross-tab leakage. */
  report: (owner: string, changes: Record<string, DirtyChange>) => void;
  clear: (owner: string) => void;
};

const DirtyContext = createContext<DirtyContextValue | null>(null);

export function DirtyProvider({ children }: { children: ReactNode }) {
  const [byOwner, setByOwner] = useState<Record<string, Record<string, DirtyChange>>>({});

  const report = useCallback(
    (owner: string, changes: Record<string, DirtyChange>) => {
      setByOwner((current) => {
        const existing = current[owner];
        // Cheap equality check: this runs on every keystroke.
        if (JSON.stringify(existing ?? {}) === JSON.stringify(changes)) return current;
        return { ...current, [owner]: changes };
      });
    },
    [],
  );

  const clear = useCallback((owner: string) => {
    setByOwner((current) => {
      if (!current[owner]) return current;
      const next = { ...current };
      delete next[owner];
      return next;
    });
  }, []);

  const changes = useMemo(
    () => Object.assign({}, ...Object.values(byOwner)) as Record<string, DirtyChange>,
    [byOwner],
  );

  const count = Object.keys(changes).length;

  // The browser's own warning covers a reload, a closed tab and a typed URL.
  // Client-side navigation is handled by the rail, which reads `count`.
  useEffect(() => {
    if (count === 0) return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [count]);

  const value = useMemo(
    () => ({ changes, count, report, clear }),
    [changes, count, report, clear],
  );

  return <DirtyContext.Provider value={value}>{children}</DirtyContext.Provider>;
}

export function useDirty() {
  const context = useContext(DirtyContext);
  if (!context) {
    throw new Error("useDirty must be used inside the admin shell's DirtyProvider.");
  }
  return context;
}

/**
 * Keeps one editor's dirty set in sync with the provider and clears it on
 * unmount, so switching tabs cannot leave a stale "3 unsaved changes".
 */
export function useReportDirty(owner: string, changes: Record<string, DirtyChange>) {
  const { report, clear } = useDirty();

  useEffect(() => {
    report(owner, changes);
  }, [owner, changes, report]);

  useEffect(() => () => clear(owner), [owner, clear]);
}

/**
 * Builds the dirty set by comparing two flat objects. Returns {} when
 * nothing differs, which is what the save bar keys off.
 *
 * Only LABELLED keys are compared. A field with no label is not something
 * the operator can edit, so it cannot be one of their unsaved changes. The
 * SEO editor carries `score` and `updatedAt` on the same object as the
 * copy, and without this the bar reported "2 unsaved changes: updatedAt
 * (32 to 31 characters)" and could never be cleared, because the server
 * restamps updatedAt on every save.
 */
export function diffFields<T extends Record<string, unknown>>(
  initial: T,
  current: T,
  labels: Partial<Record<keyof T, string>>,
): Record<string, DirtyChange> {
  const changes: Record<string, DirtyChange> = {};

  for (const key of Object.keys(labels) as (keyof T)[]) {
    const before = initial[key];
    const after = current[key];
    if (JSON.stringify(before) === JSON.stringify(after)) continue;

    changes[String(key)] = {
      label: labels[key] ?? String(key),
      summary: describe(before, after),
    };
  }

  return changes;
}

function describe(before: unknown, after: unknown): string {
  if (typeof before === "string" && typeof after === "string") {
    if (before.length === 0) return "added";
    if (after.length === 0) return "cleared";
    return `${before.length} to ${after.length} characters`;
  }
  if (Array.isArray(before) && Array.isArray(after)) {
    if (before.length !== after.length) {
      return `${before.length} to ${after.length} items`;
    }
    return "reordered or edited";
  }
  if (typeof before === "boolean" || typeof after === "boolean") {
    return after ? "turned on" : "turned off";
  }
  return `${String(before)} to ${String(after)}`;
}

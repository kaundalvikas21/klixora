import { cn } from "@/utils/cn";

/**
 * The operator's identity in the rail footer: initials, name and email
 * stacked, the way a profile block reads everywhere else.
 *
 * The email matters here. A single-operator admin still gets handed between
 * people, and "which account am I signed in as" should be answerable without
 * opening a menu.
 */
export function AdminProfile({
  name,
  email,
  className,
}: {
  name: string;
  email: string;
  className?: string;
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || email.slice(0, 2).toUpperCase();

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 px-2 py-1.5", className)}>
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-mono text-[11px] text-slate-200"
      >
        {initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-slate-200">
          {name}
        </span>
        <span className="block truncate font-mono text-[10px] text-slate-500">
          {email}
        </span>
      </span>
    </div>
  );
}

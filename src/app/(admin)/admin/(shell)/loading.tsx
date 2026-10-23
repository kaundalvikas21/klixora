import { AdminLoading } from "@/components/admin/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const PANEL = "rounded-xl border border-white/8 bg-card/70 p-4 sm:p-5";

/**
 * Overview's placeholder, and the <Suspense> boundary that lets the rest of
 * the admin shell paint while the figures are still being read. Everything
 * on this screen comes from the operator's own session, so none of it can be
 * prerendered; this is what it looks like while it streams in.
 */
export default function Loading() {
  return (
    <AdminLoading label="the overview">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>

        {/* Same grid as the real tiles, so the row does not reflow. */}
        <div className="grid gap-4 sm:grid-cols-2 wide:grid-cols-4 wide:auto-cols-fr">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl border border-white/8 bg-card/70 p-4 sm:p-5"
            >
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        <div className="grid items-start gap-5 wide:grid-cols-[1.4fr_1fr]">
          {/* The queue: a heading, its hint, then rows. */}
          <div className={`${PANEL} flex flex-col gap-3`}>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-full max-w-md" />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>

          {/* How leads reach the form: heading, hint, then the reading —
              the count, the route, its share, and the footnote under it. */}
          <div className={`${PANEL} flex flex-col gap-3`}>
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-full max-w-xs" />
            <div className="mt-2 flex items-baseline gap-2">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-3 w-9" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-3 w-full max-w-sm" />
          </div>
        </div>
      </div>
    </AdminLoading>
  );
}

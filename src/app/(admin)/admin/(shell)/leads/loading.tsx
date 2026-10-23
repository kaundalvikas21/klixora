import { AdminLoading, TableSkeleton } from "@/components/admin/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AdminLoading label="the leads">
      <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-card/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        {/* The status filter chips. */}
        <div className="flex flex-wrap gap-1.5">
          {[92, 74, 86, 78, 70].map((w) => (
            <Skeleton key={w} className="h-8 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-card/70 p-4 sm:p-5">
        <TableSkeleton rows={6} cols={5} />
      </div>
    </AdminLoading>
  );
}

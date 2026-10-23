import {
  AdminLoading,
  EditorSkeleton,
  TabBarSkeleton,
} from "@/components/admin/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AdminLoading label="the home page editor">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBarSkeleton widths={[72, 120, 92]} />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <EditorSkeleton left={2} right={1} />
    </AdminLoading>
  );
}

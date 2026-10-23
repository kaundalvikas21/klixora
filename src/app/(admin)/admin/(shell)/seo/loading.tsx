import { AdminLoading, EditorSkeleton } from "@/components/admin/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AdminLoading label="SEO and social">
      {/* The page picker, then the two-up editor and preview columns. */}
      <div className="flex flex-wrap gap-1.5">
        {[88, 132, 148, 96, 104].map((w) => (
          <Skeleton key={w} className="h-9 rounded-lg" style={{ width: w }} />
        ))}
      </div>
      <EditorSkeleton left={3} right={2} />
    </AdminLoading>
  );
}

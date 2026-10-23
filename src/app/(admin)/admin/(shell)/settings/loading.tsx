import {
  AdminLoading,
  PanelSkeleton,
  TabBarSkeleton,
} from "@/components/admin/ui/skeletons";

export default function Loading() {
  return (
    <AdminLoading label="site settings">
      <TabBarSkeleton widths={[86, 128, 124, 104]} />
      <div className="grid gap-5 wide:grid-cols-2 wide:items-start">
        <PanelSkeleton fields={4} />
        <PanelSkeleton fields={3} />
      </div>
    </AdminLoading>
  );
}

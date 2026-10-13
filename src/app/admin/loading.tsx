import { LoadingStatus, SkeletonBlock, SkeletonHeading } from '@/features/admin/components/AdminSkeleton';

export default function AdminLoading() {
  return (
    <div>
      <LoadingStatus label="Memuat halaman admin..." />
      <SkeletonHeading />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <SkeletonBlock key={index} className="h-28 rounded-2xl" />)}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SkeletonBlock className="h-64 rounded-2xl" />
        <SkeletonBlock className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

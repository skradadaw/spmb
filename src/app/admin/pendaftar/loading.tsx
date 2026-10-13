import { LoadingStatus, SkeletonBlock, SkeletonHeading } from '@/features/admin/components/AdminSkeleton';

export default function ParticipantsLoading() {
  return (
    <div>
      <LoadingStatus label="Memuat data pendaftar..." />
      <SkeletonHeading />
      <div className="mt-6 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <SkeletonBlock key={index} className="h-10" />)}
        </div>
        <div className="mt-4 flex gap-2">
          <SkeletonBlock className="h-10 w-36" />
          <SkeletonBlock className="h-10 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
        <SkeletonBlock className="h-9" />
        {Array.from({ length: 8 }, (_, index) => <SkeletonBlock key={index} className="h-12 rounded-lg" />)}
      </div>
    </div>
  );
}

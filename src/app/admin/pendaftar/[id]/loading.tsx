import { LoadingStatus, SkeletonBlock } from '@/features/admin/components/AdminSkeleton';

export default function ParticipantDetailLoading() {
  return (
    <div>
      <LoadingStatus label="Memuat detail peserta..." />
      <SkeletonBlock className="mb-4 h-9 w-48" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-40 rounded-md" />
          <SkeletonBlock className="h-8 w-64 rounded-lg" />
        </div>
        <SkeletonBlock className="h-9 w-48" />
      </div>
      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_33rem]">
        <div className="space-y-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
          {Array.from({ length: 6 }, (_, index) => <SkeletonBlock key={index} className="h-24" />)}
        </div>
        <div className="grid gap-4">
          <SkeletonBlock className="h-56 rounded-2xl" />
          <SkeletonBlock className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';

export function SkeletonBlock({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-xl bg-slate-200/70', className)} />;
}

/** Page heading placeholder shared by admin loading states. */
export function SkeletonHeading() {
  return (
    <section className="flex flex-col gap-3">
      <SkeletonBlock className="h-3 w-24 rounded-md" />
      <SkeletonBlock className="h-8 w-56 rounded-lg" />
      <SkeletonBlock className="h-4 w-full max-w-md rounded-md" />
    </section>
  );
}

export function LoadingStatus({ label }: { label: string }) {
  return <p role="status" className="sr-only">{label}</p>;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}

export default function AdminLoading() {
  return (
    <div className="admin-scope space-y-7 sm:space-y-8" aria-label="Memuat dasbor admin" role="status">
      <div className="space-y-3">
        <SkeletonBlock className="h-9 w-64" />
        <SkeletonBlock className="h-5 w-full max-w-md" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {["metric-1", "metric-2", "metric-3"].map((key) => (
          <div key={key} className="rounded-[20px] border border-slate-200/80 bg-white p-5 sm:p-6">
            <SkeletonBlock className="h-5 w-28" />
            <SkeletonBlock className="mt-5 h-10 w-20" />
            <SkeletonBlock className="mt-3 h-4 w-40" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,32,0.04)]">
          <div className="space-y-3 border-b border-slate-200/80 px-5 py-5 sm:px-6">
            <SkeletonBlock className="h-6 w-44" />
            <SkeletonBlock className="h-4 w-full max-w-sm" />
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[680px] space-y-4 px-5 py-5 sm:px-6">
              {["row-1", "row-2", "row-3", "row-4"].map((key) => (
                <SkeletonBlock key={key} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-[20px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,32,0.04)]">
          <SkeletonBlock className="h-6 w-36" />
          <div className="mt-5 space-y-3">
            {["quick-action-1", "quick-action-2", "quick-action-3"].map((key) => (
              <SkeletonBlock key={key} className="h-[68px] w-full" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

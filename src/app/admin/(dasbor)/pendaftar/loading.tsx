function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}

export default function PendaftarLoading() {
  return (
    <div className="admin-scope space-y-7" aria-label="Memuat daftar pendaftar" role="status">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-9 w-44" />
          <SkeletonBlock className="h-5 w-72 max-w-full" />
        </div>
        <SkeletonBlock className="h-11 w-full sm:w-44" />
      </header>

      <div className="rounded-[20px] border border-slate-200/80 bg-white p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(190px,1fr)_minmax(190px,1fr)_auto] lg:items-end">
          {["filter-1", "filter-2", "filter-3"].map((key) => (
            <div key={key} className="space-y-2">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
          ))}
          <SkeletonBlock className="h-11 w-full lg:w-32" />
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {["card-1", "card-2", "card-3"].map((key) => (
          <div key={key} className="rounded-[20px] border border-slate-200/80 bg-white p-5">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-3 h-5 w-48" />
            <SkeletonBlock className="mt-5 h-11 w-full" />
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[20px] border border-slate-200/80 bg-white md:block">
        <div className="overflow-x-auto">
          <div className="min-w-[850px] space-y-3 p-5 sm:p-6">
            <SkeletonBlock className="h-10 w-full" />
            {["table-row-1", "table-row-2", "table-row-3", "table-row-4"].map((key) => (
              <SkeletonBlock key={key} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

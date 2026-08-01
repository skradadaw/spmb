function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}

export default function DetailPendaftarLoading() {
  return (
    <div className="admin-scope space-y-6" aria-label="Memuat detail pendaftar" role="status">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-11 w-48" />
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-9 w-72 max-w-full" />
        </div>
        <SkeletonBlock className="h-8 w-56" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start">
        <div className="space-y-6">
          {["student-card", "parent-card", "document-card"].map((key) => (
            <section key={key} className="rounded-[20px] border border-slate-200/80 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <SkeletonBlock className="h-11 w-11" />
                <SkeletonBlock className="h-6 w-48" />
              </div>
              <div className="mt-4 space-y-3">
                {[`${key}-row-1`, `${key}-row-2`, `${key}-row-3`].map((rowKey) => (
                  <SkeletonBlock key={rowKey} className="h-10 w-full" />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="rounded-[20px] border border-slate-200/80 bg-white p-5 sm:p-6 lg:sticky lg:top-28">
          <SkeletonBlock className="h-6 w-44" />
          <div className="mt-6 space-y-4">
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-11 w-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}

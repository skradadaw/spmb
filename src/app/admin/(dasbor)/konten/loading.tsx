function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}

export default function KontenLoading() {
  return (
    <div className="admin-scope space-y-6" aria-label="Memuat pengelolaan konten" role="status">
      <header className="rounded-[20px] border border-slate-200/80 bg-white p-5 sm:p-6">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="mt-3 h-5 w-full max-w-xl" />
      </header>

      {["editor-1", "editor-2", "editor-3"].map((key) => (
        <section key={key} className="rounded-[20px] border border-slate-200/80 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <SkeletonBlock className="h-11 w-11" />
            <SkeletonBlock className="h-6 w-52" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <SkeletonBlock className="h-11 w-full sm:w-40" />
            <SkeletonBlock className="h-11 w-full sm:w-40" />
          </div>
        </section>
      ))}
    </div>
  );
}

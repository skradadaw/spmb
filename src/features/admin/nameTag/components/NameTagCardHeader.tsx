/** Header seragam untuk kartu di halaman Name Tag: nomor langkah (bila ada) dan judul. */
export function NameTagCardHeader({ id, step, title, action }: { id: string; step?: number; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-7 items-center gap-2.5">
      {step && (
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--admin-sidebar)] text-xs font-semibold text-white">{step}</span>
      )}
      <h2 id={id} className="min-w-0 flex-1 text-sm font-semibold text-foreground">{title}</h2>
      {action}
    </div>
  );
}

/** Kartu dasar halaman Name Tag. */
export const NAME_TAG_CARD = 'rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm';
export const NAME_TAG_SUBHEADING = 'text-xs font-medium text-muted-foreground';

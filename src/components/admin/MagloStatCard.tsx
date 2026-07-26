"use client";

type Props = {
  title: string;
  value: number;
  total: number;
  icon: string;
  trendText?: string;
  colorTheme: "emerald" | "amber" | "rose" | "slate";
};

const THEME_STYLES = {
  emerald: {
    bgIcon: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    bar: "bg-emerald-600",
  },
  amber: {
    bgIcon: "bg-amber-100 text-amber-700",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    bar: "bg-amber-500",
  },
  rose: {
    bgIcon: "bg-rose-100 text-rose-700",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
    bar: "bg-rose-500",
  },
  slate: {
    bgIcon: "bg-slate-100 text-slate-700",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    bar: "bg-slate-800",
  },
};

export default function MagloStatCard({
  title,
  value,
  total,
  icon,
  trendText,
  colorTheme,
}: Props) {
  const theme = THEME_STYLES[colorTheme];
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold ${theme.bgIcon}`}>
          {icon}
        </div>
        {trendText && (
          <span className={`rounded-xl border px-2.5 py-1 text-xs font-bold ${theme.badge}`}>
            {trendText}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
          <span className="text-xs text-slate-400 font-medium">/ {total} Total</span>
        </div>
      </div>

      {/* Visual Progress Bar ala Maglo */}
      <div className="mt-4">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Persentase</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

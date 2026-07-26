"use client";

type Props = {
  title: string;
  value: number;
  total: number;
  icon: string;
  trendText?: string;
  colorTheme: "lime" | "amber" | "rose" | "dark";
};

const THEME_STYLES = {
  lime: {
    bgIcon: "bg-[#c8ee44] text-[#1c1a2e]",
    badge: "bg-[#f4fce3] text-[#1c1a2e] border-[#c8ee44]",
    bar: "bg-[#c8ee44]",
  },
  amber: {
    bgIcon: "bg-amber-100 text-amber-900",
    badge: "bg-amber-50 text-amber-900 border-amber-300",
    bar: "bg-amber-400",
  },
  rose: {
    bgIcon: "bg-rose-100 text-rose-900",
    badge: "bg-rose-50 text-rose-900 border-rose-300",
    bar: "bg-rose-500",
  },
  dark: {
    bgIcon: "bg-[#1c1a2e] text-[#c8ee44]",
    badge: "bg-slate-100 text-[#1c1a2e] border-slate-300",
    bar: "bg-[#1c1a2e]",
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
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold shadow-sm ${theme.bgIcon}`}>
          {icon}
        </div>
        {trendText && (
          <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${theme.badge}`}>
            {trendText}
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-3.5xl font-black tracking-tight text-[#1c1a2e] text-3xl">{value}</p>
          <span className="text-xs text-slate-400 font-semibold">/ {total} Total</span>
        </div>
      </div>

      {/* Visual Progress Bar Maglo Style */}
      <div className="mt-5">
        <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
          <span>Rasio Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

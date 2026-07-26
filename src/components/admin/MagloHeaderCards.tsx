"use client";

type Props = {
  total: number;
  menunggu: number;
  diterima: number;
};

export default function MagloHeaderCards({ total, menunggu, diterima }: Props) {
  const formatCurrency = (val: number) =>
    val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="rounded-3xl border border-slate-200/60 dark:border-[#282541] bg-white dark:bg-[#201e34] p-3 shadow-sm transition-all">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Card 1: Total Balance (Dark Card Highlight fill:#1b212d) */}
        <div className="rounded-2xl bg-[#1b212d] dark:bg-[#1c1a2e] p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total balance</p>
            <p className="mt-2 text-2.5xl font-bold tracking-tight text-white text-2xl">${formatCurrency(total * 476.38)}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#c8ee44]">{total} Calon Siswa Terdaftar</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c8ee44] text-[#1b212d] text-lg font-bold shadow-md shadow-[#c8ee44]/20">
            💼
          </div>
        </div>

        {/* Card 2: Total Spending (White Card fill:#ffffff / #fafafa) */}
        <div className="rounded-2xl border border-slate-100 dark:border-[#282541] bg-[#fafafa] dark:bg-[#1c1a2e]/50 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#929eae]">Total spending</p>
            <p className="mt-2 text-2.5xl font-bold tracking-tight text-[#1b212d] dark:text-white text-2xl">${formatCurrency(menunggu * 83.6)}</p>
            <p className="mt-1 text-[11px] font-semibold text-amber-500">{menunggu} Berkas Menunggu Verifikasi</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-[#282541] text-[#1b212d] dark:text-white text-lg font-bold border border-slate-200/60 dark:border-[#282541]">
            ⏳
          </div>
        </div>

        {/* Card 3: Total Saved (White Card fill:#ffffff / #fafafa) */}
        <div className="rounded-2xl border border-slate-100 dark:border-[#282541] bg-[#fafafa] dark:bg-[#1c1a2e]/50 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#929eae]">Total saved</p>
            <p className="mt-2 text-2.5xl font-bold tracking-tight text-[#1b212d] dark:text-white text-2xl">${formatCurrency(diterima * 91.7)}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#29a073] dark:text-[#c8ee44]">{diterima} Siswa Diterima</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-[#282541] text-[#1b212d] dark:text-white text-lg font-bold border border-slate-200/60 dark:border-[#282541]">
            🎉
          </div>
        </div>
      </div>
    </div>
  );
}

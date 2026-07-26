"use client";

type Props = {
  total: number;
  menunggu: number;
  diterima: number;
};

export default function MagloHeaderCards({ total, menunggu, diterima }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-[#282541] bg-white dark:bg-[#201e34] p-3 shadow-sm transition-all">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Card 1: Total Calon Siswa (Dark Card Highlight ala Maglo Total Balance) */}
        <div className="rounded-2xl bg-[#1c1a2e] dark:bg-[#282541] p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Calon Siswa</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-white">{total}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#c8ee44]">100% Berkas Terdaftar</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c8ee44] text-[#1c1a2e] text-xl font-bold shadow-md shadow-[#c8ee44]/20">
            👥
          </div>
        </div>

        {/* Card 2: Menunggu Verifikasi (Light Section ala Maglo Total Spending) */}
        <div className="rounded-2xl border border-slate-100 dark:border-[#282541] bg-slate-50/50 dark:bg-[#1c1a2e]/50 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Menunggu Verifikasi</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-[#1c1a2e] dark:text-white">{menunggu}</p>
            <p className="mt-1 text-[11px] font-semibold text-amber-500">Perlu Tindakan Panitia</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 text-xl font-bold">
            ⏳
          </div>
        </div>

        {/* Card 3: Siswa Diterima (Light Section ala Maglo Total Saved) */}
        <div className="rounded-2xl border border-slate-100 dark:border-[#282541] bg-slate-50/50 dark:bg-[#1c1a2e]/50 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Siswa Diterima</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-[#1c1a2e] dark:text-white">{diterima}</p>
            <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-[#c8ee44]">Lulus Seleksi SPMB</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c8ee44]/30 text-[#1c1a2e] dark:text-[#c8ee44] text-xl font-bold">
            🎉
          </div>
        </div>
      </div>
    </div>
  );
}

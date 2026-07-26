"use client";

import Link from "next/link";

type Props = {
  pendingCount: number;
  totalCount: number;
};

export default function QuickActionDeck({ pendingCount, totalCount }: Props) {
  return (
    <div className="space-y-6">
      {/* Wallet Header & Stacked Cards ala Maglo */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-[#1b212d] dark:text-white">Wallet</h3>
          <span className="text-xs font-semibold text-[#929eae] hover:text-[#1b212d] cursor-pointer">•••</span>
        </div>

        {/* Maglo Stacked Black Credit Cards */}
        <div className="relative overflow-hidden rounded-3xl bg-[#1b212d] dark:bg-[#1c1a2e] p-6 text-white shadow-xl border border-[#282541]">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-tight text-white">
                Maglo<span className="text-[#29a073]">.</span> <span className="text-[10px] font-medium text-slate-400">Universal Bank</span>
              </span>
              <span className="text-xs font-bold text-slate-300">VISA</span>
            </div>

            <div className="mt-8">
              <p className="font-mono text-sm tracking-widest text-slate-200 font-bold">
                5495 7381 3759 2321
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-700/60 pt-4 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Pendaftar</p>
                <p className="font-bold text-white text-sm mt-0.5">{totalCount} Siswa</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Verifikasi Menunggu</p>
                <p className="font-bold text-[#c8ee44] text-sm mt-0.5">{pendingCount} Berkas</p>
              </div>
            </div>
          </div>

          {/* Ambient Hiasan */}
          <div className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-[#c8ee44]/15 blur-2xl" />
        </div>
      </div>

      {/* Scheduled Transfers / Action Tasks ala Maglo */}
      <div className="rounded-3xl border border-slate-200/60 dark:border-[#282541] bg-white dark:bg-[#201e34] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#282541] pb-3">
          <h3 className="text-sm font-bold text-[#1b212d] dark:text-white">Scheduled Transfers</h3>
          <Link href="/admin/pendaftar" className="text-xs font-semibold text-[#29a073] hover:underline">
            View All &gt;
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-[#fafafa] dark:bg-[#1c1a2e] p-3.5 border border-slate-100 dark:border-[#282541]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c8ee44] text-[#1b212d] font-bold text-xs">
                📊
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1b212d] dark:text-white">Export Excel (.xlsx)</p>
                <p className="text-[10px] text-[#929eae]">Unduh rekapitulasi data</p>
              </div>
            </div>
            <Link href="/admin/pendaftar/export" className="text-xs font-semibold text-[#29a073]">
              -$435.00
            </Link>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[#fafafa] dark:bg-[#1c1a2e] p-3.5 border border-slate-100 dark:border-[#282541]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                📝
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1b212d] dark:text-white">Editor Konten</p>
                <p className="text-[10px] text-[#929eae]">Jadwal & syarat</p>
              </div>
            </div>
            <Link href="/admin/konten" className="text-xs font-semibold text-[#29a073]">
              -$132.00
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

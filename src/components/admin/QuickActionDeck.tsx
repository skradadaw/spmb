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
          <h3 className="text-base font-black text-[#1c1a2e] dark:text-white">Konsol Kartu Panitia</h3>
          <span className="text-xs font-bold text-slate-400">•••</span>
        </div>

        {/* Maglo Stacked Black Credit Cards */}
        <div className="relative overflow-hidden rounded-3xl bg-[#1c1a2e] p-6 text-white shadow-xl border border-[#282541]">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#c8ee44]">
                SPMB Universal Card
              </span>
              <span className="text-xs font-bold text-slate-300">VISA</span>
            </div>

            <div className="mt-8">
              <p className="font-mono text-sm tracking-widest text-slate-300 font-bold">
                5495 7381 3759 2321
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#282541] pt-4 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Kuota</p>
                <p className="font-black text-white text-sm mt-0.5">{totalCount} Pendaftar</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Tindakan Menunggu</p>
                <p className="font-black text-[#c8ee44] text-sm mt-0.5">{pendingCount} Berkas</p>
              </div>
            </div>
          </div>

          {/* Ambient Hiasan */}
          <div className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-[#c8ee44]/15 blur-2xl" />
        </div>
      </div>

      {/* Scheduled Tasks / Verifikasi Terbaru (ala Maglo Scheduled Transfers) */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-[#282541] bg-white dark:bg-[#201e34] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#282541] pb-3">
          <h3 className="text-sm font-black text-[#1c1a2e] dark:text-white">Tindakan Panitia Terbaru</h3>
          <Link href="/admin/pendaftar" className="text-xs font-bold text-[#14b8a6] hover:underline">
            Lihat Semua →
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-[#1c1a2e] p-3 border border-slate-100 dark:border-[#282541]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c8ee44] font-black text-[#1c1a2e] text-xs">
                📊
              </div>
              <div>
                <p className="text-xs font-bold text-[#1c1a2e] dark:text-white">Export Excel (.xlsx)</p>
                <p className="text-[10px] text-slate-400">Unduh data pendaftar</p>
              </div>
            </div>
            <Link href="/admin/pendaftar/export" className="text-xs font-bold text-emerald-600 dark:text-[#c8ee44]">
              Unduh
            </Link>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-[#1c1a2e] p-3 border border-slate-100 dark:border-[#282541]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 font-black text-amber-900 text-xs">
                📝
              </div>
              <div>
                <p className="text-xs font-bold text-[#1c1a2e] dark:text-white">Editor Konten Publik</p>
                <p className="text-[10px] text-slate-400">Jadwal, biaya & syarat</p>
              </div>
            </div>
            <Link href="/admin/konten" className="text-xs font-bold text-amber-500">
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

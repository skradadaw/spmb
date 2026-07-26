"use client";

import Link from "next/link";

type Props = {
  pendingCount: number;
  totalCount: number;
};

export default function QuickActionDeck({ pendingCount, totalCount }: Props) {
  return (
    <div className="space-y-6">
      {/* Maglo Metallic Card Preview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Konsol Utama Panitia
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
              TA 2027/2028
            </span>
          </div>

          <div className="mt-6">
            <p className="text-xs text-slate-400 font-medium">Status Kuota Pendaftaran</p>
            <p className="text-2xl font-extrabold tracking-tight text-white mt-0.5">
              {totalCount} <span className="text-sm font-normal text-slate-400">Pendaftar</span>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-700/60 pt-4 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tindakan Menunggu</p>
              <p className="font-bold text-amber-400 mt-0.5">{pendingCount} Berkas</p>
            </div>
            <Link
              href="/admin/pendaftar?verifikasi=menunggu"
              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md"
            >
              Proses Sekarang →
            </Link>
          </div>
        </div>

        {/* Ambient Hiasan */}
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />
      </div>

      {/* Tindakan Pintas Maglo Deck */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Tindakan Pintas Panitia
        </h3>

        <div className="space-y-2.5">
          <Link
            href="/admin/pendaftar"
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                👥
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Tabel Pendaftar</p>
                <p className="text-[11px] text-slate-400">Verifikasi & ubah status</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/admin/pendaftar/export"
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold text-sm">
                📊
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Export Berkas Excel</p>
                <p className="text-[11px] text-slate-400">Format spreadsheet .xlsx</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/admin/konten"
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
                📝
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Editor Konten Publik</p>
                <p className="text-[11px] text-slate-400">Jadwal, biaya & syarat</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

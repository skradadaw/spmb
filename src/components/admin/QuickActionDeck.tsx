"use client";

import Link from "next/link";

type Props = {
  pendingCount: number;
  totalCount: number;
};

export default function QuickActionDeck({ pendingCount, totalCount }: Props) {
  return (
    <div className="space-y-6">
      {/* Maglo Metallic Dark Card (#1c1a2e & #c8ee44) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1c1a2e] p-6 text-white shadow-xl border border-[#282541]">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#c8ee44]">
              Maglo Console Card
            </span>
            <span className="rounded-full bg-[#c8ee44]/20 px-3 py-1 text-[10px] font-extrabold text-[#c8ee44] border border-[#c8ee44]/30">
              TA 2027/2028
            </span>
          </div>

          <div className="mt-6">
            <p className="text-xs text-slate-400 font-semibold">Total Registrasi Pendaftar</p>
            <p className="text-3xl font-black tracking-tight text-white mt-1">
              {totalCount} <span className="text-xs font-bold text-slate-400">Pendaftar</span>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#282541] pt-4 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Verifikasi Menunggu</p>
              <p className="font-black text-[#c8ee44] text-sm mt-0.5">{pendingCount} Berkas</p>
            </div>
            <Link
              href="/admin/pendaftar?verifikasi=menunggu"
              className="rounded-2xl bg-[#c8ee44] px-4 py-2.5 text-xs font-black text-[#1c1a2e] hover:bg-[#b5da35] transition-all shadow-md shadow-[#c8ee44]/20"
            >
              Verifikasi →
            </Link>
          </div>
        </div>

        {/* Ambient Glossy Background Hiasan */}
        <div className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-[#c8ee44]/15 blur-2xl" />
      </div>

      {/* Tindakan Pintas Deck */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-[#1c1a2e] border-b border-slate-100 pb-3">
          Akses Pintas Panitia
        </h3>

        <div className="space-y-2.5">
          <Link
            href="/admin/pendaftar"
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 hover:bg-[#f4fce3] hover:border-[#c8ee44] transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c8ee44] text-[#1c1a2e] font-black text-sm shadow-sm">
                👥
              </span>
              <div>
                <p className="text-xs font-black text-[#1c1a2e] group-hover:text-[#1c1a2e]">Tabel Pendaftar</p>
                <p className="text-[11px] font-medium text-slate-400">Verifikasi & ubah status</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/admin/pendaftar/export"
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 hover:bg-[#f4fce3] hover:border-[#c8ee44] transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 font-black text-sm shadow-sm">
                📊
              </span>
              <div>
                <p className="text-xs font-black text-[#1c1a2e] group-hover:text-[#1c1a2e]">Export Berkas Excel</p>
                <p className="text-[11px] font-medium text-slate-400">Format spreadsheet .xlsx</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/admin/konten"
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 hover:bg-[#f4fce3] hover:border-[#c8ee44] transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1c1a2e] text-[#c8ee44] font-black text-sm shadow-sm">
                📝
              </span>
              <div>
                <p className="text-xs font-black text-[#1c1a2e] group-hover:text-[#1c1a2e]">Editor Konten Publik</p>
                <p className="text-[11px] font-medium text-slate-400">Jadwal, biaya & syarat</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

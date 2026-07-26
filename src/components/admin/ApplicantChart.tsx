"use client";

export default function ApplicantChart() {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-[#282541] bg-white dark:bg-[#201e34] p-6 shadow-sm">
      {/* Header Maglo Working Capital Style */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-[#282541] pb-4">
        <div>
          <h3 className="text-base font-black text-[#1c1a2e] dark:text-white">Tren Pendaftaran Bulanan</h3>
          <p className="text-xs font-medium text-slate-400">Perbandingan Pendaftar Baru vs Berkas Terverifikasi</p>
        </div>

        {/* Legend Map Maglo Style */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#c8ee44] border border-[#1c1a2e]" />
            <span>Pendaftar Baru</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#14b8a6]" />
            <span>Terverifikasi</span>
          </div>
          <select className="rounded-xl border border-slate-200 dark:border-[#282541] bg-slate-50 dark:bg-[#1c1a2e] px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <option>7 Hari Terakhir</option>
            <option>Bulan Ini</option>
            <option>TA 2027/2028</option>
          </select>
        </div>
      </div>

      {/* Dual Curved Line Graph Maglo Style */}
      <div className="mt-6 relative h-56 w-full">
        {/* Horizontal Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-bold text-slate-300 dark:text-slate-600 pointer-events-none">
          <div className="border-b border-slate-100 dark:border-[#282541] pb-1">10K</div>
          <div className="border-b border-slate-100 dark:border-[#282541] pb-1">5K</div>
          <div className="border-b border-slate-100 dark:border-[#282541] pb-1">1K</div>
          <div className="pb-1">0</div>
        </div>

        {/* SVG Curved Path Lines */}
        <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 160">
          {/* Line 1: Pendaftar Baru (Lime #c8ee44) */}
          <path
            d="M 0 100 Q 80 40 160 80 T 320 50 T 500 70"
            fill="none"
            stroke="#c8ee44"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Line 2: Terverifikasi (Teal #14b8a6) */}
          <path
            d="M 0 130 Q 80 90 160 110 T 320 80 T 500 95"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Highlighted Tooltip Marker Point (Apr 17) */}
          <circle cx="240" cy="65" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" />
        </svg>

        {/* Tooltip Popup Badge */}
        <div className="absolute left-[45%] top-[10%] -translate-x-1/2 rounded-xl bg-[#1c1a2e] text-white px-2.5 py-1 text-[10px] font-extrabold shadow-lg border border-[#c8ee44]">
          <span className="text-[#c8ee44]">Peak: 11 Pendaftar</span>
        </div>
      </div>

      {/* X-Axis Labels Maglo Style */}
      <div className="mt-4 flex justify-between text-[11px] font-bold text-slate-400">
        <span>Apr 14</span>
        <span>Apr 15</span>
        <span className="text-[#1c1a2e] dark:text-[#c8ee44] font-black">Apr 17</span>
        <span>Apr 18</span>
        <span>Apr 19</span>
        <span>Apr 20</span>
      </div>
    </div>
  );
}

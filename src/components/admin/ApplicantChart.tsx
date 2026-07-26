"use client";

export default function ApplicantChart() {
  return (
    <div className="rounded-3xl border border-slate-200/60 dark:border-[#282541] bg-white dark:bg-[#201e34] p-6 shadow-sm">
      {/* Header Maglo Working Capital Style */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-[#282541] pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#1b212d] dark:text-white">Working Capital</h3>
        </div>

        {/* Legend Map Maglo Style */}
        <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-[#929eae]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c8ee44] border border-[#1b212d]" />
            <span className="text-[#1b212d] dark:text-slate-300">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#29a073]" />
            <span className="text-[#1b212d] dark:text-slate-300">Expenses</span>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200/60 dark:border-[#282541] bg-slate-50 dark:bg-[#1c1a2e] px-3 py-1.5 text-xs font-semibold text-[#29a073]">
            <span>Last 7 days</span>
            <span>▼</span>
          </div>
        </div>
      </div>

      {/* Dual Curved Line Graph Maglo Style */}
      <div className="mt-6 relative h-56 w-full">
        {/* Horizontal Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-[11px] font-medium text-[#929eae] pointer-events-none">
          <div className="border-b border-slate-100 dark:border-[#282541] pb-1">10K</div>
          <div className="border-b border-slate-100 dark:border-[#282541] pb-1">5K</div>
          <div className="border-b border-slate-100 dark:border-[#282541] pb-1">1K</div>
          <div className="pb-1">0</div>
        </div>

        {/* SVG Curved Path Lines */}
        <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 160">
          {/* Line 1: Income (Lime #c8ee44) */}
          <path
            d="M 0 100 Q 80 40 160 80 T 320 50 T 500 70"
            fill="none"
            stroke="#c8ee44"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Line 2: Expenses (Teal #29a073) */}
          <path
            d="M 0 130 Q 80 90 160 110 T 320 80 T 500 95"
            fill="none"
            stroke="#29a073"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Highlighted Tooltip Marker Point (Apr 17) */}
          <circle cx="240" cy="65" r="5.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" />
        </svg>

        {/* Tooltip Popup Badge */}
        <div className="absolute left-[47%] top-[12%] -translate-x-1/2 rounded-xl bg-[#1b212d] text-white px-3 py-1 text-[11px] font-semibold shadow-lg">
          <span>$5,500</span>
        </div>
      </div>

      {/* X-Axis Labels Maglo Style */}
      <div className="mt-4 flex justify-between text-[11px] font-medium text-[#929eae]">
        <span>Apr 14</span>
        <span>Apr 15</span>
        <span className="text-[#1b212d] dark:text-[#c8ee44] font-bold">Apr 17</span>
        <span>Apr 18</span>
        <span>Apr 19</span>
        <span>Apr 20</span>
      </div>
    </div>
  );
}

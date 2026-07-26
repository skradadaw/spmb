"use client";

type Props = {
  data: {
    label: string;
    terverifikasi: number;
    menunggu: number;
    diterima: number;
  }[];
};

export default function ApplicantChart({ data }: Props) {
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.terverifikasi, d.menunggu, d.diterima)),
    10
  );

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-[#1c1a2e]">Analitik Tren Pendaftaran</h3>
          <p className="text-xs font-medium text-slate-400">Distribusi status berkas & seleksi penerimaan</p>
        </div>

        {/* Legend Map Maglo Style */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#c8ee44] border border-[#1c1a2e]" />
            <span>Diterima</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span>Menunggu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#1c1a2e]" />
            <span>Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Visual Bars Container */}
      <div className="mt-6 flex h-48 items-end gap-6 sm:gap-8 px-2">
        {data.map((item, idx) => {
          const hTerverifikasi = (item.terverifikasi / maxVal) * 100;
          const hMenunggu = (item.menunggu / maxVal) * 100;
          const hDiterima = (item.diterima / maxVal) * 100;

          return (
            <div key={idx} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
              <div className="flex items-end gap-1.5 h-full w-full justify-center">
                {/* Bar Terverifikasi */}
                <div
                  className="w-3.5 sm:w-4 rounded-t-lg bg-[#1c1a2e] group-hover:bg-[#282541] transition-all"
                  style={{ height: `${Math.max(hTerverifikasi, 8)}%` }}
                  title={`Terverifikasi: ${item.terverifikasi}`}
                />
                {/* Bar Menunggu */}
                <div
                  className="w-3.5 sm:w-4 rounded-t-lg bg-amber-400 group-hover:bg-amber-300 transition-all"
                  style={{ height: `${Math.max(hMenunggu, 8)}%` }}
                  title={`Menunggu: ${item.menunggu}`}
                />
                {/* Bar Diterima */}
                <div
                  className="w-3.5 sm:w-4 rounded-t-lg bg-[#c8ee44] border border-[#1c1a2e]/30 group-hover:bg-[#b5da35] transition-all"
                  style={{ height: `${Math.max(hDiterima, 8)}%` }}
                  title={`Diterima: ${item.diterima}`}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

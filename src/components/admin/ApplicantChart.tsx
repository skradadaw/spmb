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
          <h3 className="text-base font-bold text-slate-900">Analitik Tren Pendaftaran</h3>
          <p className="text-xs text-slate-400">Distribusi status berkas dan penerimaan calon siswa</p>
        </div>

        {/* Legend Map Maglo Style */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-600" />
            <span>Diterima</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span>Menunggu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-800" />
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
                  className="w-3 sm:w-4 rounded-t-lg bg-slate-800 group-hover:bg-slate-700 transition-all"
                  style={{ height: `${Math.max(hTerverifikasi, 8)}%` }}
                  title={`Terverifikasi: ${item.terverifikasi}`}
                />
                {/* Bar Menunggu */}
                <div
                  className="w-3 sm:w-4 rounded-t-lg bg-amber-500 group-hover:bg-amber-400 transition-all"
                  style={{ height: `${Math.max(hMenunggu, 8)}%` }}
                  title={`Menunggu: ${item.menunggu}`}
                />
                {/* Bar Diterima */}
                <div
                  className="w-3 sm:w-4 rounded-t-lg bg-emerald-600 group-hover:bg-emerald-500 transition-all"
                  style={{ height: `${Math.max(hDiterima, 8)}%` }}
                  title={`Diterima: ${item.diterima}`}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

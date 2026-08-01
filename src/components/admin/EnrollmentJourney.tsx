import { adminCardCls } from "./styles";

type JourneyProps = {
  total: number;
  terverifikasi: number;
  diputuskan: number;
  diterima: number;
};

export function EnrollmentJourney({ total, terverifikasi, diputuskan, diterima }: JourneyProps) {
  const stages = [
    { label: "Daftar", value: total },
    { label: "Verifikasi", value: terverifikasi },
    { label: "Seleksi", value: diputuskan },
    { label: "Diterima", value: diterima },
  ];

  return (
    <section className={`${adminCardCls} overflow-hidden p-5 sm:p-6`} aria-labelledby="jalur-siswa-title">
      <div>
        <h2 id="jalur-siswa-title" className="admin-display text-lg text-[#101820]">Jalur Siswa</h2>
        <p className="mt-1 text-sm text-[#667085]">Perkembangan calon siswa dari pendaftaran hingga keputusan akhir.</p>
      </div>

      <ol className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-0">
        {stages.map((stage, index) => (
          <li key={stage.label} className="relative min-w-0 sm:flex-1">
            {index < stages.length - 1 && (
              <span aria-hidden="true" className="absolute left-8 right-0 top-4 hidden h-0.5 bg-[#00AA13] sm:block" />
            )}
            <div className="relative z-10 flex items-center gap-3 sm:flex-col sm:items-start">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00AA13] text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#101820]">{stage.label}</p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-[#101820]">{stage.value}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

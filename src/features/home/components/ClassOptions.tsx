import { ArrowRightLeft, BookOpenText, Globe2, Info, School } from 'lucide-react';
import { classProgramDescriptions } from '@/features/home/data';
import {
  CLASS_OPTIONS,
  classQuotaStatus,
  type ClassCapacity,
  type ClassOption,
  type ClassQuotaStatus,
} from '@/features/registration/classCapacity';
import { AccreditationBadge } from './ContactLinks';
import SectionHeading from './SectionHeading';

const statusStyles: Record<ClassQuotaStatus, string> = {
  Tersedia: 'bg-public-tint text-public-green ring-public-line',
  'Hampir penuh': 'bg-amber-100 text-amber-900 ring-amber-300',
  Penuh: 'bg-public-deep/5 text-public-deep/70 ring-public-deep/15',
};

const programIcons: Record<ClassOption, typeof School> = {
  Reguler: School,
  Bilingual: Globe2,
  Tahfizh: BookOpenText,
};

export default function ClassOptions({
  classCapacities,
}: {
  classCapacities: ClassCapacity[] | null;
}) {
  return (
    <section
      id="kelas"
      aria-labelledby="kelas-title"
      className="scroll-mt-24 bg-public-canvas px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="kelas-title"
            eyebrow="Program kelas"
            title="Pilihan Kelas"
            description="Pilih program yang paling sesuai untuk Ananda saat mengisi formulir. Pilihan Kelas yang kuotanya penuh tidak dapat dipilih."
          />
          <AccreditationBadge className="bg-public-deep px-4 py-2 text-sm text-white shadow-lg shadow-public-deep/15" />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {CLASS_OPTIONS.map((pilihanKelas) => {
            const description = classProgramDescriptions[pilihanKelas];
            const capacity = classCapacities?.find((item) => item.pilihanKelas === pilihanKelas);
            const status = capacity ? classQuotaStatus(capacity) : null;
            const Icon = programIcons[pilihanKelas];
            const titleId = `kelas-${pilihanKelas.toLowerCase()}`;

            return (
              <article
                key={pilihanKelas}
                aria-labelledby={titleId}
                className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg hover:shadow-public-deep/5 sm:p-7 ${
                  status === 'Penuh' ? 'border-public-deep/5 opacity-90' : 'border-public-deep/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-public-tint text-public-green">
                    <Icon aria-hidden="true" size={24} />
                  </span>
                  {status && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[status]}`}
                    >
                      {status}
                    </span>
                  )}
                </div>
                <h3 id={titleId} className="mt-6 text-xl font-bold text-slate-950">
                  {pilihanKelas}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-7 text-slate-600">{description}</p>
                {status === 'Penuh' && (
                  <p className="mt-4 rounded-xl bg-public-deep/5 px-3 py-2 text-sm font-semibold text-public-deep/70">
                    Pilihan Kelas ini sudah penuh
                  </p>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1fr]">
          <div className="flex items-start gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
              <ArrowRightLeft aria-hidden="true" size={20} />
            </span>
            <p className="text-[0.95rem] leading-7 text-slate-700">
              <strong className="text-slate-950">Pindahan ke kelas 2–6?</strong> Daftar lewat
              formulir yang sama, pilih Jenis Pendaftaran Pindahan.
            </p>
          </div>
          <div className="flex items-start gap-4 rounded-3xl border border-public-deep/10 bg-white p-5 sm:p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-public-tint text-public-green">
              <Info aria-hidden="true" size={20} />
            </span>
            <p className="text-[0.95rem] leading-7 text-slate-700">
              Kelas Penempatan ditetapkan Panitia setelah OKB dan dapat berbeda dari Pilihan Kelas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

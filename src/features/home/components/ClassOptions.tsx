import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookHeart,
  BookOpenCheck,
  BookOpenText,
  Brain,
  Bus,
  Languages,
  Laptop,
  LibraryBig,
  MicVocal,
  MoonStar,
  Mosque,
  Palette,
  Presentation,
  ShieldCheck,
  Sparkles,
  Speech,
  Star,
  Tent,
  TentTree,
  Utensils,
  Volleyball,
  type LucideIcon,
} from 'lucide-react';
import { classHighlights, classProgramDescriptions, schoolFacilities } from '@/features/home/data';
import {
  CLASS_OPTIONS,
  classQuotaStatus,
  type ClassCapacity,
  type ClassOption,
  type ClassQuotaStatus,
} from '@/features/registration/classCapacity';
import { AccreditationBadge } from './ContactLinks';
import SectionBackdrop from './SectionBackdrop';
import SectionHeading from './SectionHeading';
import { actionClass } from './actionStyles';

/** Badges sit on the card's deep green band. */
const statusStyles: Record<ClassQuotaStatus, string> = {
  Tersedia: 'bg-white/15 text-white ring-white/25',
  'Hampir penuh': 'bg-amber-300 text-public-deep ring-amber-200',
  Penuh: 'bg-white/10 text-white/70 ring-white/15',
};

/** 3D illustrations from Microsoft Fluent Emoji (MIT, see public/images/kelas/LICENSE-fluentui-emoji.txt). */
const classImages: Record<ClassOption, string> = {
  Reguler: '/images/kelas/reguler.png',
  Bilingual: '/images/kelas/bilingual.png',
  Tahfizh: '/images/kelas/tahfizh.png',
};

/** Each Pilihan Kelas keeps its own hue on the band, icons, and seat bar. */
const classThemes: Record<
  ClassOption,
  { band: string; accentText: string; accentBar: string; iconTile: string; seatBar: string }
> = {
  Reguler: {
    band: 'bg-public-deep',
    accentText: 'text-amber-300',
    accentBar: 'bg-amber-300',
    iconTile: 'bg-public-tint text-public-green ring-public-line',
    seatBar: 'bg-public-green',
  },
  Bilingual: {
    band: 'bg-class-bilingual',
    accentText: 'text-class-bilingual-accent',
    accentBar: 'bg-class-bilingual-accent',
    iconTile: 'bg-class-bilingual-tint text-class-bilingual ring-class-bilingual-line',
    seatBar: 'bg-class-bilingual',
  },
  Tahfizh: {
    band: 'bg-class-tahfizh',
    accentText: 'text-class-tahfizh-accent',
    accentBar: 'bg-class-tahfizh-accent',
    iconTile: 'bg-class-tahfizh-tint text-class-tahfizh ring-class-tahfizh-line',
    seatBar: 'bg-class-tahfizh',
  },
};

const quotaBarStyles: Record<Exclude<ClassQuotaStatus, 'Tersedia'>, string> = {
  'Hampir penuh': 'bg-amber-400',
  Penuh: 'bg-public-deep/40',
};

const programIcons: Record<ClassOption, LucideIcon> = {
  Reguler: Mosque,
  Bilingual: Languages,
  Tahfizh: BookOpenText,
};

/** One icon per entry of classHighlights, in the same order. */
const classHighlightIcons: Record<ClassOption, readonly LucideIcon[]> = {
  Reguler: [BookOpenCheck, MicVocal, Languages],
  Bilingual: [Speech, TentTree, Bus],
  Tahfizh: [BookHeart, Tent, Bus],
};

/** One icon per entry of schoolFacilities, in the same order. */
const schoolFacilityIcons = [Presentation, ShieldCheck, Laptop, Volleyball, Palette, LibraryBig, Bus, Brain, Utensils];

function SeatsLeft({
  capacity,
  status,
  availableBar,
}: {
  capacity: ClassCapacity;
  status: ClassQuotaStatus;
  availableBar: string;
}) {
  const remaining = Math.max(0, capacity.kuota - capacity.terpakai);
  const filled = Math.min(100, Math.round((capacity.terpakai / capacity.kuota) * 100));

  return (
    <div>
      <p className="text-sm font-bold text-slate-800">
        {status === 'Penuh' ? 'Kuota terisi penuh' : `Sisa ${remaining} dari ${capacity.kuota} kursi`}
      </p>
      <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-full bg-public-deep/10">
        <div
          className={`h-full rounded-full ${status === 'Tersedia' ? availableBar : quotaBarStyles[status]}`} style={{ width: `${filled}%` }} />
      </div>
    </div>
  );
}

export default function ClassOptions({
  classCapacities,
}: {
  classCapacities: ClassCapacity[] | null;
}) {
  return (
    <section
      id="kelas"
      aria-labelledby="kelas-title"
      data-tone="canvas"
      className="relative isolate scroll-mt-24 overflow-hidden bg-public-canvas px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <SectionBackdrop />
      <div
        aria-hidden="true"
        className="absolute right-[4%] top-20 -z-10 hidden h-16 w-16 rotate-12 items-center justify-center rounded-3xl border border-amber-200 bg-white/70 text-amber-500 shadow-lg shadow-public-deep/5 backdrop-blur-sm xl:flex"
      >
        <MoonStar size={28} strokeWidth={1.8} />
      </div>
      <Sparkles
        aria-hidden="true"
        className="absolute left-[46%] top-16 -z-10 hidden text-amber-400/70 lg:block"
        size={26}
        strokeWidth={1.7}
      />
      <Star
        aria-hidden="true"
        className="absolute bottom-40 left-[3%] -z-10 hidden fill-public-line text-public-line xl:block"
        size={22}
      />

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

        {/* Cards share row tracks (subgrid) so descriptions of different length never shift the highlights */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {CLASS_OPTIONS.map((pilihanKelas) => {
            const capacity = classCapacities?.find((item) => item.pilihanKelas === pilihanKelas);
            const status = capacity ? classQuotaStatus(capacity) : null;
            const Icon = programIcons[pilihanKelas];
            const titleId = `kelas-${pilihanKelas.toLowerCase()}`;
            const theme = classThemes[pilihanKelas];

            return (
              <article
                key={pilihanKelas}
                aria-labelledby={titleId}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white md:row-span-4 md:grid md:grid-rows-subgrid md:gap-0 shadow-sm shadow-public-deep/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-public-deep/10 motion-reduce:hover:translate-y-0 ${
                  status === 'Hampir penuh'
                    ? 'border-amber-300 ring-2 ring-amber-200/60'
                    : status === 'Penuh'
                      ? 'border-public-deep/5 opacity-90'
                      : 'border-public-deep/10'
                }`}
              >
                <div className={`relative isolate overflow-hidden px-6 pb-7 pt-6 text-white sm:px-7 ${theme.band}`}>
                  <div aria-hidden="true" className="texture-dots-on-deep absolute inset-0 -z-10 opacity-30" />
                  <span aria-hidden="true" className="absolute -bottom-10 -right-10 -z-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
                  <Image
                    src={classImages[pilihanKelas]}
                    alt=""
                    width={256}
                    height={256}
                    sizes="(min-width: 1024px) 112px, (min-width: 768px) 72px, (min-width: 640px) 120px, 104px"
                    className="pointer-events-none absolute bottom-3 right-3 -z-10 h-26 w-26 rotate-6 drop-shadow-[0_14px_18px_rgb(0_0_0/0.35)] transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-110 motion-reduce:transition-none sm:h-30 sm:w-30 md:h-18 md:w-18 lg:h-28 lg:w-28"
                  />
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur-sm ${theme.accentText}`}
                    >
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
                  <p className="mt-6 text-xs font-bold uppercase tracking-wider text-public-mint/80">
                    Kelas
                  </p>
                  <h3 id={titleId} className="mt-1 text-2xl font-bold tracking-tight">
                    {pilihanKelas}
                  </h3>
                  <div aria-hidden="true" className={`mt-3 h-1 w-10 rounded-full ${theme.accentBar}`} />
                </div>

                <p className="px-6 pt-6 text-[0.95rem] leading-7 text-slate-600 sm:px-7 sm:pt-7">
                  {classProgramDescriptions[pilihanKelas]}
                </p>
                <ul className="space-y-2.5 px-6 pt-5 sm:px-7">
                  {classHighlights[pilihanKelas].map((highlight, index) => {
                    const HighlightIcon = classHighlightIcons[pilihanKelas][index];
                    return (
                      <li key={highlight} className="flex items-center gap-3 text-[0.95rem] font-semibold text-slate-800">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${theme.iconTile}`}
                        >
                          <HighlightIcon aria-hidden="true" size={17} />
                        </span>
                        {highlight}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-auto px-6 pb-6 pt-6 sm:px-7 sm:pb-7">
                  <div className="space-y-4 border-t border-public-deep/10 pt-5">
                    {capacity && status && <SeatsLeft capacity={capacity} status={status} availableBar={theme.seatBar} />}
                    {status === 'Penuh' ? (
                      <p className="flex min-h-12 items-center justify-center rounded-xl bg-public-deep/5 px-6 text-base font-bold text-public-deep/60">
                        Kuota Siswa Baru penuh
                      </p>
                    ) : (
                      <Link
                        href={`/pendaftaran?kelas=${pilihanKelas}`}
                        className={actionClass('primary', 'lg', 'w-full')}
                      >
                        Daftar {pilihanKelas} <ArrowRight aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <section
          aria-labelledby="keunggulan-title"
          className="relative mt-6 overflow-hidden rounded-3xl border border-public-deep/10 bg-white/80 p-6 shadow-sm shadow-public-deep/5 backdrop-blur-sm sm:p-8 lg:p-10"
        >
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-public-green via-amber-300 to-public-green" />
          <p className="text-xs font-bold uppercase tracking-wider text-public-green">Fasilitas unggul di semua Pilihan Kelas</p>
          <h3 id="keunggulan-title" className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Aman, nyaman, dan lengkap untuk tumbuh kembang Ananda
          </h3>
          <ul className="mt-8 grid gap-x-10 gap-y-6 border-t border-public-deep/10 pt-8 sm:grid-cols-2 sm:gap-y-7 lg:grid-cols-3">
            {schoolFacilities.map(({ title, description }, index) => {
              const FacilityIcon = schoolFacilityIcons[index];
              return (
                // The two text lines match the icon's height, so both sit on one centre line.
                <li key={title} className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-public-tint text-public-green ring-1 ring-inset ring-public-line">
                    <FacilityIcon aria-hidden="true" size={20} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-[0.95rem] font-semibold leading-5 text-slate-900">{title}</h4>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </section>
  );
}

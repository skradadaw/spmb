import { BookOpen, Check, GraduationCap, Users } from 'lucide-react';
import { registrationInfo } from '@/features/home/data';

const highlights = [
  {
    title: 'Kurikulum Unggulan',
    description:
      'Perpaduan kurikulum nasional dan nilai-nilai Islami yang komprehensif.',
    icon: GraduationCap,
    tone: 'bg-emerald-50 text-[#00AA13] border-emerald-100',
  },
  {
    title: 'Tenaga Pendidik Profesional',
    description:
      'Guru berpengalaman yang berdedikasi membimbing setiap potensi anak.',
    icon: Users,
    tone: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  {
    title: 'Fasilitas Modern',
    description:
      'Lingkungan belajar yang nyaman, aman, dan dilengkapi teknologi terkini.',
    icon: BookOpen,
    tone: 'bg-amber-50 text-amber-700 border-amber-100',
  },
] as const;

export function SchoolHighlights() {
  return (
    <div className="mt-20 rounded-[2rem] border border-emerald-100 bg-[#F4F7F1] px-5 py-10 text-center sm:px-8 sm:py-14 lg:px-12">
      <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#007A10]">
        Mengapa Al-Muhajirin?
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Lingkungan terbaik untuk tumbuh
      </h2>
      <div className="mt-10 grid gap-5 text-left md:grid-cols-3">
        {highlights.map(({ title, description, icon: Icon, tone }) => (
          <article key={title} className={`rounded-2xl border p-6 ${tone}`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon aria-hidden="true" size={23} />
            </span>
            <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-base leading-7 text-slate-700">{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function RegistrationPreparation() {
  return (
    <section
      id="persyaratan"
      aria-labelledby="requirements-title"
      className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#007A10]">
              Persiapan Pendaftaran
            </p>
            <h2
              id="requirements-title"
              className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl"
            >
              Siapkan data sebelum mulai mengisi
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Dokumen yang lengkap membuat proses pengisian formulir lebih cepat dan nyaman.
            </p>
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base leading-7 text-emerald-950">
              Siapkan file akta lahir, kartu keluarga, pas foto, dan bukti pembayaran yang jelas.
              NISN cukup dicatat sebagai nomor.
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {registrationInfo.requirements.map((item, index) => (
              <article
                key={item}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-[#FAFBF8] p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF6E8] text-[#007A10]">
                  <Check aria-hidden="true" size={20} strokeWidth={3} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-600">
                    {item === 'Nomor NISN' ? 'DATA' : 'DOKUMEN'} 0{index + 1}
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">{item}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <SchoolHighlights />
      </div>
    </section>
  );
}

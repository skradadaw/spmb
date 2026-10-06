import { ClipboardList, FileText, School } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Siapkan dokumen',
    description:
      'Bayar biaya OKB dan siapkan bukti pembayaran bersama dokumen digital. NISN cukup dicatat sebagai nomor.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Isi formulir',
    description:
      'Lengkapi formulir, masukkan NISN, lalu unggah dokumen dan bukti pembayaran.',
    icon: ClipboardList,
  },
  {
    number: '03',
    title: 'Ikuti Tes OKB',
    description: 'Hadir sesuai jadwal seleksi yang telah ditentukan.',
    icon: School,
  },
] as const;

export default function RegistrationSteps() {
  return (
    <section
      id="cara-daftar"
      aria-labelledby="steps-title"
      className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#007A10]">
            Cara mendaftar
          </p>
          <h2 id="steps-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Tiga langkah untuk memulai
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-700">
            Ikuti urutan berikut agar proses pendaftaran lebih cepat dan tidak ada data yang terlewat.
          </p>
        </div>

        <ol aria-label="Langkah pendaftaran" className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <li key={title} className="relative rounded-2xl border border-slate-200 bg-[#FAFBF8] p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF6E8] text-[#007A10]">
                  <Icon aria-hidden="true" size={23} />
                </span>
                <span aria-hidden="true" className="text-3xl font-black text-slate-200">
                  {number}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-base leading-7 text-slate-700">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

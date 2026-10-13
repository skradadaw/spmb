import { registrationFlow } from '@/features/home/data';
import SectionHeading from './SectionHeading';

export default function RegistrationSteps() {
  return (
    <section
      id="alur"
      aria-labelledby="alur-title"
      className="relative scroll-mt-24 overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-64 [background-image:radial-gradient(circle_at_center,rgb(6_78_27/0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          id="alur-title"
          eyebrow="Cara mendaftar"
          title="Alur Pendaftaran"
          description="Lima langkah dari pembayaran sampai Keputusan Penerimaan. Ikuti berurutan agar tidak ada data yang terlewat."
        />

        <ol
          aria-label="Langkah pendaftaran"
          className="relative mt-12 grid gap-0 lg:grid-cols-5 lg:gap-6"
        >
          <span
            aria-hidden="true"
            className="absolute left-6 right-auto top-6 hidden h-0.5 w-[calc(100%-3rem)] bg-gradient-to-r from-public-green via-emerald-300 to-amber-300 lg:block"
          />
          {registrationFlow.map(({ title, description }, index) => {
            const last = index === registrationFlow.length - 1;
            return (
              <li
                key={title}
                className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-4 pb-8 last:pb-0 lg:block lg:pb-0"
              >
                {!last && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-6 top-12 w-0.5 -translate-x-1/2 bg-emerald-200 lg:hidden"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black shadow-lg ring-4 ring-white ${
                    last
                      ? 'bg-amber-300 text-public-deep shadow-amber-900/15'
                      : 'bg-public-deep text-white shadow-emerald-950/20'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="pt-1 lg:mt-5 lg:pt-0">
                  <h3 className="text-lg font-bold text-slate-950">{title}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-7 text-slate-600">{description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

import { ChevronDown, Clock3 } from 'lucide-react';
import { contactInfo, faqs } from '@/features/home/data';
import { WhatsAppLink } from './ContactLinks';
import SectionHeading from './SectionHeading';

export default function FrequentQuestions() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative scroll-mt-24 overflow-hidden bg-public-canvas px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div aria-hidden="true" className="texture-dots absolute inset-x-0 top-0 h-64" />
      <div className="relative mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-x-16">
        <SectionHeading
          id="faq-title"
          eyebrow="FAQ"
          title="Pertanyaan yang Sering Diajukan"
          description="Jawaban singkat untuk hal yang paling sering ditanyakan Ayah dan Bunda."
        />

        <div className="divide-y divide-public-deep/10 rounded-3xl border border-public-deep/10 bg-white px-5 shadow-sm sm:px-7 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {faqs.map(({ question, answer }) => (
            <details key={question} className="group py-1">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-left text-base font-bold text-slate-950 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-green [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  aria-hidden="true"
                  size={20}
                  className="shrink-0 text-public-green transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <p className="max-w-[65ch] pb-5 text-[0.95rem] leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>

        <div className="rounded-3xl bg-public-deep p-6 text-white shadow-xl shadow-public-deep/15">
          <p className="text-lg font-bold">Masih ada pertanyaan?</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-public-mint">
            <Clock3 aria-hidden="true" size={16} className="text-amber-300" />
            Layanan panitia pukul {contactInfo.serviceHours}
          </p>
          <WhatsAppLink
            iconClassName="size-5 text-public-green"
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-base font-bold text-public-deep tap-press hover:bg-public-tint active:bg-public-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            Chat WhatsApp Panitia
          </WhatsAppLink>
        </div>
      </div>
    </section>
  );
}

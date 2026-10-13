import Image from 'next/image';
import { BadgeCheck, Clock3, MapPin, Navigation } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { contactInfo, registrationInfo, schoolProfile } from '@/features/home/data';

export default function SiteFooter() {
  return (
    <footer className="bg-public-deep px-4 pt-14 text-sm text-emerald-100/80 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 pb-10 md:grid-cols-[1.1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5">
              <Image src="/logo.png" alt="" width={48} height={48} className="h-11 w-11 object-contain" />
            </span>
            <div>
              <p className="text-base font-bold text-white">SD Plus 3 Al-Muhajirin</p>
              <p className="mt-0.5">Open Booking · Tahun Pelajaran {registrationInfo.academicYear}</p>
            </div>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-bold text-white ring-1 ring-inset ring-white/15">
            <BadgeCheck aria-hidden="true" className="size-4 text-amber-300" />
            Terakreditasi {schoolProfile.accreditation}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Lokasi</p>
          <p className="mt-4 flex items-start gap-2.5 leading-6">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-300" />
            <span>{contactInfo.address}</span>
          </p>
          <a
            href={contactInfo.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Navigation aria-hidden="true" className="size-4" />
            Buka di Google Maps
          </a>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Panitia Open Booking</p>
          <a
            href={contactInfo.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-2.5 rounded-lg font-bold text-white transition-colors hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <WhatsAppIcon className="size-4 text-emerald-300" />
            WhatsApp {contactInfo.whatsappLabel}
          </a>
          <p className="mt-2 flex items-center gap-2.5">
            <Clock3 aria-hidden="true" className="size-4 shrink-0 text-emerald-300" />
            Jam layanan {contactInfo.serviceHours}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-white/10 py-6 text-center text-xs text-emerald-100/60">
        © SD Plus 3 Al-Muhajirin Purwakarta
      </div>
    </footer>
  );
}

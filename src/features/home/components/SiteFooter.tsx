import Image from 'next/image';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { ArrowUpRight, ChevronRight, Clock3, MapPin } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/icons/SocialIcons';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { contactInfo, registrationInfo, schoolProfile, socialLinks } from '@/features/home/data';
import { AccreditationBadge } from './ContactLinks';

const SOCIAL_ICONS = { Instagram: InstagramIcon, Facebook: FacebookIcon, TikTok: TikTokIcon };

/** Labels say what parents will find there, not just the section name. */
const QUICK_LINKS = [
  ['Jadwal penting Open Booking', '#jadwal'],
  ['Alur pendaftaran langkah demi langkah', '#alur'],
  ['Pilihan Kelas dan sisa kuota', '#kelas'],
  ['Biaya OKB dan Berkas yang disiapkan', '#persiapan'],
  ['Unduh rincian biaya (PDF)', registrationInfo.feeDocument],
  ['Isi formulir pendaftaran', '/pendaftaran'],
] as const;

const HEADING = 'text-xs font-bold uppercase tracking-[0.16em] text-amber-300';
const LINK = 'rounded-md transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/** One contact line: an icon, a small label and its value, so every contact reads the same way. */
function ContactItem({ icon: Icon, label, className = '', children }: { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; className?: string; children: ReactNode }) {
  return (
    <li className={`flex items-start gap-3 ${className}`}>
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-300" />
      <div className="min-w-0">
        <p className="text-xs leading-4 text-public-mint/60">{label}</p>
        <div className="mt-1 leading-6 text-white">{children}</div>
      </div>
    </li>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-public-deep px-4 text-sm text-public-mint/80 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-public-green via-amber-300 to-public-green" />
      <div aria-hidden="true" className="hero-grid absolute inset-0 -z-10 opacity-10" />

      <div className="mx-auto grid max-w-7xl gap-x-10 gap-y-12 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-5 lg:pr-10">
          <div className="flex items-center gap-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-lg shadow-black/10">
              <Image src="/logo.png" alt="" width={48} height={48} className="size-11 object-contain" />
            </span>
            <div>
              <p className="text-base font-bold text-white">SD Plus 3 Al-Muhajirin</p>
              <p className="mt-0.5 text-xs">Purwakarta, Jawa Barat</p>
            </div>
          </div>
          <p className="mt-5 max-w-md leading-6">{schoolProfile.summary}</p>
          <AccreditationBadge className="mt-6 bg-white/10 px-3.5 py-1.5 text-white ring-1 ring-inset ring-white/15" />
        </div>

        <nav aria-label="Tautan cepat" className="lg:col-span-3">
          <p className={HEADING}>Tautan cepat</p>
          <ul className="mt-5 space-y-3">
            {QUICK_LINKS.map(([label, href]) => (
              <li key={href}>
                <a href={href} className={`group inline-flex items-start gap-1.5 leading-6 ${LINK}`}>
                  <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-public-mint/40 transition-colors group-hover:text-amber-300" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <p className={HEADING}>Hubungi kami</p>
          <ul className="mt-5 space-y-5">
            <ContactItem icon={WhatsAppIcon} label="WhatsApp panitia">
              <a
                href={contactInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp panitia ${contactInfo.whatsappLabel}`}
                className={`font-bold ${LINK} hover:text-amber-200`}
              >
                {contactInfo.whatsappLabel}
              </a>
            </ContactItem>
            <ContactItem icon={Clock3} label="Jam layanan">
              {contactInfo.serviceDays}, {contactInfo.serviceHours}
            </ContactItem>
            <ContactItem icon={MapPin} label="Lokasi sekolah">
              <span>{contactInfo.address}</span>
              <a href={contactInfo.mapsUrl} target="_blank" rel="noopener noreferrer" className={`mt-1 flex w-fit items-center gap-1 text-xs font-bold text-amber-300 ${LINK} hover:text-amber-200`}>
                Buka di Google Maps<ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
            </ContactItem>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-4 border-t border-white/10 py-6 sm:flex-row sm:justify-between">
        <p className="text-center text-xs text-public-mint/60 sm:text-left">© SD Plus 3 Al-Muhajirin Purwakarta</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-public-mint/60">Ikuti kami</span>
          <ul aria-label="Media sosial" className="flex gap-2">
            {socialLinks.map(({ platform, url }) => {
              const Icon = SOCIAL_ICONS[platform];
              return (
                <li key={platform}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${platform} SD Plus 3 Al-Muhajirin`}
                    title={platform}
                    className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-white hover:text-public-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}

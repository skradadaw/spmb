import { BadgeCheck } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { contactInfo, schoolProfile } from '@/features/home/data';

/** Opens a chat with the Panitia Open Booking in a new tab. */
export function WhatsAppLink({
  className,
  iconClassName = 'size-5',
  children,
}: {
  className: string;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={contactInfo.whatsappUrl} target="_blank" rel="noopener noreferrer" className={className}>
      <WhatsAppIcon className={iconClassName} />
      {children}
    </a>
  );
}

export function AccreditationBadge({ className }: { className: string }) {
  return (
    <p className={`inline-flex w-fit items-center gap-2 rounded-full font-bold ${className}`}>
      <BadgeCheck aria-hidden="true" className="size-4 text-amber-300" />
      Terakreditasi {schoolProfile.accreditation}
    </p>
  );
}

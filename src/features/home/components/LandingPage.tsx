import ClassOptions from './ClassOptions';
import ClosingCta from './ClosingCta';
import FrequentQuestions from './FrequentQuestions';
import HomeHero, { HomeHeader } from './HomeHero';
import PaymentInformation from './PaymentInformation';
import RegistrationPreparation from './RegistrationPreparation';
import RegistrationSteps from './RegistrationSteps';
import SiteFooter from './SiteFooter';
import { totalUsedSeats, type ClassCapacity } from '@/features/registration/classCapacity';

export default function LandingPage({
  classCapacities,
}: {
  classCapacities: ClassCapacity[] | null;
}) {
  const completedCount = classCapacities === null ? null : totalUsedSeats(classCapacities);

  return (
    <div className="min-h-screen bg-public-canvas text-slate-950">
      <a
        href="#konten-utama"
        className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-slate-950 px-4 py-3 font-bold text-white focus:not-sr-only"
      >
        Lewati ke konten utama
      </a>
      <HomeHeader />
      <main id="konten-utama">
        <HomeHero completedCount={completedCount} />
        <RegistrationSteps />
        <ClassOptions classCapacities={classCapacities} />
        <PaymentInformation />
        <RegistrationPreparation />
        <FrequentQuestions />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}

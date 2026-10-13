import type { Metadata } from 'next';
import { LandingPage } from '@/features/home';
import {
  ClassCapacityLoadError,
  fetchClassCapacities,
} from '@/features/registration/server/classCapacityRepository';
import {
  getSupabaseAdmin,
  SupabaseConfigurationError,
} from '@/features/registration/server/supabaseAdmin';

export const metadata: Metadata = {
  title: 'Open Booking Pendaftaran | SD Plus 3 Al-Muhajirin',
  description:
    'Informasi Open Booking Pendaftaran SD Plus 3 Al-Muhajirin Tahun Pelajaran 2027/2028.',
};

export const revalidate = 60;

async function getClassCapacities() {
  try {
    return await fetchClassCapacities(getSupabaseAdmin());
  } catch (error) {
    const safeType =
      error instanceof ClassCapacityLoadError || error instanceof SupabaseConfigurationError
        ? error.name
        : 'UnexpectedClassCapacityError';
    console.error('Open Booking progress could not be loaded.', safeType);
    return null;
  }
}

export default async function Home() {
  return <LandingPage classCapacities={await getClassCapacities()} />;
}

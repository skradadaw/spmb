import type { Metadata } from 'next';
import { LandingPage } from '@/features/home';
import {
  BookingProgressLoadError,
  createBookingProgressRepository,
} from '@/features/home/server/bookingProgressRepository';
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

async function getCompletedBookingCount() {
  try {
    return await createBookingProgressRepository(getSupabaseAdmin()).getCompletedCount();
  } catch (error) {
    const safeType =
      error instanceof BookingProgressLoadError || error instanceof SupabaseConfigurationError
        ? error.name
        : 'UnexpectedBookingProgressError';
    console.error('Open Booking progress could not be loaded.', safeType);
    return null;
  }
}

export default async function Home() {
  return <LandingPage completedCount={await getCompletedBookingCount()} />;
}

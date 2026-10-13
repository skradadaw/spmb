import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchClassCapacities } from '@/features/registration/server/classCapacityRepository';

const SAFE_ERROR = 'Progress Open Booking tidak dapat dimuat.';

export class BookingProgressLoadError extends Error {
  constructor() {
    super(SAFE_ERROR);
    this.name = 'BookingProgressLoadError';
  }
}

export function createBookingProgressRepository(client: Pick<SupabaseClient, 'rpc'>) {
  return {
    async getClassCapacities() {
      try {
        return await fetchClassCapacities(client);
      } catch {
        throw new BookingProgressLoadError();
      }
    },
  };
}

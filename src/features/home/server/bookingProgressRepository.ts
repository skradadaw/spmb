import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

const SAFE_ERROR = 'Progress Open Booking tidak dapat dimuat.';

export class BookingProgressLoadError extends Error {
  constructor() {
    super(SAFE_ERROR);
    this.name = 'BookingProgressLoadError';
  }
}

export function createBookingProgressRepository(client: SupabaseClient) {
  return {
    async getCompletedCount() {
      const { count, error } = await client
        .from('pendaftar')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'Menunggu Unggahan');

      if (error || count === null) throw new BookingProgressLoadError();
      return count;
    },
  };
}

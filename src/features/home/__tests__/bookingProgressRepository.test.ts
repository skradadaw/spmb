import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BookingProgressLoadError,
  createBookingProgressRepository,
} from '../server/bookingProgressRepository';

function makeClient(count: number | null, error: unknown = null) {
  const neq = vi.fn().mockResolvedValue({ count, error });
  const select = vi.fn().mockReturnValue({ neq });
  const from = vi.fn().mockReturnValue({ select });
  return {
    client: { from } as unknown as SupabaseClient,
    spies: { from, select, neq },
  };
}

describe('booking progress repository', () => {
  it('counts only registrations that completed document uploads', async () => {
    const { client, spies } = makeClient(86);

    await expect(createBookingProgressRepository(client).getCompletedCount()).resolves.toBe(86);
    expect(spies.from).toHaveBeenCalledWith('pendaftar');
    expect(spies.select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(spies.neq).toHaveBeenCalledWith('status', 'Menunggu Unggahan');
  });

  it('treats a null count as unavailable data', async () => {
    const { client } = makeClient(null);

    await expect(createBookingProgressRepository(client).getCompletedCount()).rejects.toEqual(
      new BookingProgressLoadError(),
    );
  });

  it('maps database failures to a safe typed error', async () => {
    const { client } = makeClient(null, { message: 'private database detail' });

    await expect(createBookingProgressRepository(client).getCompletedCount()).rejects.toEqual(
      new BookingProgressLoadError(),
    );
  });
});

import { describe, expect, it, vi } from 'vitest';
import {
  BookingProgressLoadError,
  createBookingProgressRepository,
} from '../server/bookingProgressRepository';

function makeClient(data: unknown, error: unknown = null) {
  const rpc = vi.fn().mockResolvedValue({ data, error });
  return { client: { rpc } as never, rpc };
}

describe('booking progress repository', () => {
  it('sums used seats across every class from the capacity usage RPC', async () => {
    const { client, rpc } = makeClient([
      { pilihan_kelas: 'Bilingual', kuota: 56, terpakai: 50 },
      { pilihan_kelas: 'Reguler', kuota: 28, terpakai: 20 },
      { pilihan_kelas: 'Tahfizh', kuota: 28, terpakai: 16 },
    ]);

    await expect(createBookingProgressRepository(client).getCompletedCount()).resolves.toBe(86);
    expect(rpc).toHaveBeenCalledWith('get_class_capacity_usage');
  });

  it('treats a missing result as unavailable data', async () => {
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

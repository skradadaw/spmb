import { describe, expect, it, vi } from 'vitest';
import { ClassCapacityLoadError, fetchClassCapacities } from '../server/classCapacityRepository';

function makeClient(data: unknown, error: unknown = null) {
  const rpc = vi.fn().mockResolvedValue({ data, error });
  return { client: { rpc } as never, rpc };
}

describe('class capacity repository', () => {
  it('returns the capacity of every Pilihan Kelas from the capacity usage RPC', async () => {
    const { client, rpc } = makeClient([
      { pilihan_kelas: 'Bilingual', kuota: 56, terpakai: 50 },
      { pilihan_kelas: 'Reguler', kuota: 28, terpakai: 20 },
      { pilihan_kelas: 'Tahfizh', kuota: 28, terpakai: 16 },
    ]);

    await expect(fetchClassCapacities(client)).resolves.toEqual([
      { pilihanKelas: 'Reguler', kuota: 28, terpakai: 20 },
      { pilihanKelas: 'Bilingual', kuota: 56, terpakai: 50 },
      { pilihanKelas: 'Tahfizh', kuota: 28, terpakai: 16 },
    ]);
    expect(rpc).toHaveBeenCalledWith('get_class_capacity_usage');
  });

  it('treats a missing result as unavailable data', async () => {
    const { client } = makeClient(null);

    await expect(fetchClassCapacities(client)).rejects.toEqual(
      new ClassCapacityLoadError(),
    );
  });

  it('maps database failures to a safe typed error', async () => {
    const { client } = makeClient(null, { message: 'private database detail' });

    await expect(fetchClassCapacities(client)).rejects.toEqual(
      new ClassCapacityLoadError(),
    );
  });
});

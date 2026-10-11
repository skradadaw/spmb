import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { createParticipantsRepository } from '../server/participantsRepository';
import { parseParticipantListQuery } from '../query';

describe('participant export repository', () => {
  it('returns all filtered rows in ordered batches, without count queries', async () => {
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), ilike: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), range: vi.fn() };
    query.range.mockResolvedValueOnce({ data: Array.from({ length: 1000 }, (_, index) => ({ id: String(index), nama_lengkap: 'Ani' })), error: null }).mockResolvedValueOnce({ data: [{ id: 'last', nama_lengkap: '=formula' }], error: null });
    const repo = createParticipantsRepository({ from: vi.fn(() => query) } as unknown as SupabaseClient);
    const rows = await repo.exportAll(parseParticipantListQuery(new URLSearchParams('q=Ani&status=Diterima')));
    expect(query.ilike).toHaveBeenCalledWith('nama_lengkap', '%Ani%');
    expect(query.eq).toHaveBeenCalledWith('status', 'Diterima');
    expect(query.range).toHaveBeenNthCalledWith(1, 0, 999);
    expect(query.range).toHaveBeenNthCalledWith(2, 1000, 1999);
    expect(rows).toHaveLength(1001);
  });
});

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NameTagSummaryPanel } from '../NameTagSummaryPanel';

const member = (id: string, ruangOkb: string | null) => ({ id, namaLengkap: id, ruangOkb });
const progressText = () => screen.getByText(/\/ \d+ Pendaftar/).closest('p')?.textContent;
const members = [member('a', 'Kelas 10'), member('b', null), member('c', 'Kelas 2'), member('d', 'Kelas 10')];

describe('NameTagSummaryPanel', () => {
  it('shows how far the room assignment is', () => {
    render(<NameTagSummaryPanel members={members} />);

    expect(progressText()).toBe('3 / 4 Pendaftar');
    expect(screen.getByText('75%')).toBeDefined();
    expect(screen.getByText('sudah punya Ruang OKB')).toBeDefined();
    expect(screen.getByRole('progressbar', { name: 'Pendaftar dengan Ruang OKB' }).getAttribute('aria-valuenow')).toBe('75');
  });

  it('lists how many Pendaftar are in each room, then those without one', () => {
    render(<NameTagSummaryPanel members={members} />);
    const rows = within(screen.getByRole('list', { name: 'Pendaftar per ruangan' })).getAllByRole('listitem');

    expect(rows.map(row => row.textContent)).toEqual(['Kelas 21', 'Kelas 102', 'Belum ada ruangan1']);
  });

  it('leaves out the without-room row once everyone has a room', () => {
    render(<NameTagSummaryPanel members={[member('a', 'Kelas 2')]} />);

    expect(screen.queryByText('Belum ada ruangan')).toBeNull();
    expect(progressText()).toBe('1 / 1 Pendaftar');
  });
});

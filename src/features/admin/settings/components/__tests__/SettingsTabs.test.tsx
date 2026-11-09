import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ pathname: vi.fn(() => '/admin/pengaturan/kuota') }));
vi.mock('next/navigation', () => ({ usePathname: mocks.pathname }));

import { SettingsTabs } from '../SettingsTabs';

describe('SettingsTabs', () => {
  beforeEach(() => { mocks.pathname.mockReturnValue('/admin/pengaturan/kuota'); });

  it('lists Kuota Kelas then Ruang OKB, each at its own address', () => {
    render(<SettingsTabs />);

    const links = screen.getAllByRole('link');
    expect(links.map(link => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Kuota Kelas', '/admin/pengaturan/kuota'],
      ['Ruang OKB', '/admin/pengaturan/ruang-okb'],
    ]);
  });

  it('marks only Kuota Kelas active on its address', () => {
    render(<SettingsTabs />);

    expect(screen.getByRole('link', { name: 'Kuota Kelas' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Ruang OKB' }).getAttribute('aria-current')).toBeNull();
  });

  it('marks only Ruang OKB active on its address', () => {
    mocks.pathname.mockReturnValue('/admin/pengaturan/ruang-okb');
    render(<SettingsTabs />);

    expect(screen.getByRole('link', { name: 'Ruang OKB' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Kuota Kelas' }).getAttribute('aria-current')).toBeNull();
  });
});

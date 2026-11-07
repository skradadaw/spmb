import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ pathname: vi.fn(() => '/admin/okb') }));
vi.mock('next/navigation', () => ({ usePathname: mocks.pathname }));

import { OkbTabs } from '../OkbTabs';

describe('OkbTabs', () => {
  beforeEach(() => { mocks.pathname.mockReturnValue('/admin/okb'); });

  it('marks Jadwal active on the opening address', () => {
    render(<OkbTabs />);

    const link = screen.getByRole('link', { name: 'Jadwal' });
    expect(link.getAttribute('href')).toBe('/admin/okb');
    expect(link.getAttribute('aria-current')).toBe('page');
  });

  it('marks only Scan Kehadiran active on its address', () => {
    mocks.pathname.mockReturnValue('/admin/okb/scan');
    render(<OkbTabs />);

    const link = screen.getByRole('link', { name: 'Scan Kehadiran' });
    expect(link.getAttribute('href')).toBe('/admin/okb/scan');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Name Tag' }).getAttribute('aria-current')).toBeNull();
  });

  it('marks only Name Tag active on its address', () => {
    mocks.pathname.mockReturnValue('/admin/okb/name-tag');
    render(<OkbTabs />);

    const link = screen.getByRole('link', { name: 'Name Tag' });
    expect(link.getAttribute('href')).toBe('/admin/okb/name-tag');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Jadwal' }).getAttribute('aria-current')).toBeNull();
  });
});

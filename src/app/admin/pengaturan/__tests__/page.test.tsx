import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }) }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import SettingsPage from '../page';

describe('SettingsPage', () => {
  it('opens on the Kuota Kelas tab', () => {
    expect(() => SettingsPage()).toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/admin/pengaturan/kuota');
  });
});

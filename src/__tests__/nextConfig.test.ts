import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('next.config redirects', () => {
  it('sends the old Name Tag address to its OKB tab, temporarily', async () => {
    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({ source: '/admin/name-tag', destination: '/admin/okb/name-tag', permanent: false });
  });

  it('sends the Scan Kehadiran tab address back to its own page, temporarily', async () => {
    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({ source: '/admin/okb/scan', destination: '/admin/scan', permanent: false });
    expect(redirects.some(({ source }) => source === '/admin/scan')).toBe(false);
  });

  it('sends the old Pengumuman addresses, template included, to its OKB tab, temporarily', async () => {
    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({ source: '/admin/pengumuman/:path*', destination: '/admin/okb/pengumuman/:path*', permanent: false });
  });

  it('sends the old Kuota Kelas address to its Pengaturan tab, temporarily', async () => {
    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({ source: '/admin/kuota', destination: '/admin/pengaturan/kuota', permanent: false });
  });
});

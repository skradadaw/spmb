import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('next.config redirects', () => {
  it('sends the old Name Tag address to its OKB tab, temporarily', async () => {
    const redirects = await nextConfig.redirects!();

    expect(redirects).toContainEqual({ source: '/admin/name-tag', destination: '/admin/okb/name-tag', permanent: false });
  });
});

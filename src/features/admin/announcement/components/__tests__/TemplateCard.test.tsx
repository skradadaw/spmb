import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('../../actions/templateActions', () => ({
  prepareTemplateUploadAction: vi.fn(), checkTemplateAction: vi.fn(), activateTemplateAction: vi.fn(), discardTemplateAction: vi.fn(),
}));

import { TemplateCard } from '../TemplateCard';

describe('TemplateCard', () => {
  it('warns that results cannot be announced until a template is active', () => {
    render(<TemplateCard active={null} />);
    expect(screen.getByText(/Belum ada template aktif/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Unggah template' })).toBeDefined();
    expect(screen.getByLabelText('Pilih file template PDF').getAttribute('accept')).toBe('application/pdf');
  });

  it('shows when the active template was uploaded with links to download and preview it', () => {
    render(<TemplateCard active={{ uploadedAt: '2026-10-29T03:15:00Z' }} />);
    expect(screen.getByText(/Template aktif, diunggah 29 Oktober 2026/)).toBeDefined();
    expect(screen.getByRole('link', { name: /Unduh template/ }).getAttribute('href')).toBe('/admin/pengumuman/template');
    expect(screen.getByRole('link', { name: /Lihat pratinjau/ }).getAttribute('href')).toBe('/admin/pengumuman/template/pratinjau?contoh=biasa');
    expect(screen.getByRole('button', { name: 'Ganti template' })).toBeDefined();
  });
});

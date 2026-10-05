import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseConfigurationError } from '@/features/registration/server/supabaseAdmin';

const mocks = vi.hoisted(() => ({ getSupabaseAdmin: vi.fn() }));
vi.mock('@/features/registration/server/supabaseAdmin', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/features/registration/server/supabaseAdmin')>(),
  getSupabaseAdmin: mocks.getSupabaseAdmin,
}));

import AdminPage from '../page';

function clientReturning(data: unknown[] | null, error: unknown = null) {
  return { from: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data, error }) }) };
}

describe('AdminPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders live registration metrics from Supabase', async () => {
    mocks.getSupabaseAdmin.mockReturnValue(clientReturning([
      { id: '1', nama_lengkap: 'Alya', pilihan_kelas: 'Reguler', jenis_pendaftaran: 'Siswa Baru', status: 'Menunggu Verifikasi', created_at: '2026-10-06T08:00:00Z' },
    ]));
    render(await AdminPage());

    expect(screen.getByText('Dashboard Pendaftaran')).toBeDefined();
    expect(screen.getAllByText('Alya')).toHaveLength(2);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('renders the dashboard empty state for zero registrations', async () => {
    mocks.getSupabaseAdmin.mockReturnValue(clientReturning([]));
    render(await AdminPage());
    expect(screen.getByText(/Belum ada data pendaftar/)).toBeDefined();
  });

  it('renders a safe alert when configuration is unavailable', async () => {
    mocks.getSupabaseAdmin.mockImplementation(() => { throw new SupabaseConfigurationError(); });
    render(await AdminPage());

    expect(screen.getByRole('alert').textContent).toContain('Dashboard belum dapat dimuat');
    expect(document.body.textContent).not.toContain('service role');
    expect(screen.getByRole('button', { name: 'Muat ulang halaman' }).closest('form')?.getAttribute('action')).toBe('/admin');
  });

  it('does not expose raw Supabase errors', async () => {
    mocks.getSupabaseAdmin.mockReturnValue(clientReturning(null, { message: 'secret database detail' }));
    render(await AdminPage());

    expect(screen.getByRole('alert').textContent).toContain('Dashboard belum dapat dimuat');
    expect(document.body.textContent).not.toContain('secret database detail');
  });
});

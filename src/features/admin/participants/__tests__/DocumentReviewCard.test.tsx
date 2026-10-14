import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock('../actions/saveDocumentReviewAction', () => ({ saveDocumentReviewAction: mocks.save }));

import { DocumentReviewCard } from '../components/DocumentReviewCard';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
const document = { id: 'buktiPembayaran' as const, title: 'Bukti Pembayaran OKB', path: 'registrations/x/buktiPembayaran.webp' };
const viewerDocuments = [{ id: 'buktiPembayaran' as const, title: 'Bukti Pembayaran OKB', href: '/admin/pendaftar/x/dokumen/buktiPembayaran?contentType=image%2Fwebp&v=o', verified: false, replacedAt: null }];

function renderCard() {
  render(<DocumentReviewCard participantId={participantId} document={document} status="pending" sourceLabel="Dari pendaftaran" viewerDocuments={viewerDocuments} viewerIndex={0} />);
  return screen.getByText('Bukti Pembayaran OKB').closest('article')!;
}

describe('DocumentReviewCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the Berkas as verified the moment Verifikasi is clicked, while the server saves', async () => {
    let finish: () => void = () => {};
    mocks.save.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
    const card = renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'Verifikasi Bukti Pembayaran OKB' }));

    await waitFor(() => expect(card.getAttribute('data-review-state')).toBe('verified'));
    expect(screen.getByRole('button', { name: 'Terverifikasi Bukti Pembayaran OKB' }).getAttribute('aria-pressed')).toBe('true');
    const formData = mocks.save.mock.calls[0][0] as FormData;
    expect([formData.get('participantId'), formData.get('documentId'), formData.get('status')]).toEqual([participantId, 'buktiPembayaran', 'verified']);
    finish();
  });

  it('goes back to unverified and says so when saving fails', async () => {
    mocks.save.mockRejectedValue(new Error('Status verifikasi tidak dapat disimpan.'));
    const card = renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'Verifikasi Bukti Pembayaran OKB' }));

    // Under a busy test run the failed transition can settle late, so wait for both the message and the revert.
    await waitFor(() => {
      expect(screen.getByText('Verifikasi gagal disimpan. Coba lagi.')).toBeDefined();
      expect(card.getAttribute('data-review-state')).toBe('pending');
    }, { timeout: 3000 });
    expect(screen.getByRole('button', { name: 'Verifikasi Bukti Pembayaran OKB' }).getAttribute('aria-pressed')).toBe('false');
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ save: vi.fn(), savePayment: vi.fn() }));
vi.mock('../actions/saveDocumentReviewAction', () => ({ saveDocumentReviewAction: mocks.save }));
vi.mock('../actions/savePaymentMethodAction', () => ({ savePaymentMethodAction: mocks.savePayment }));

import { DocumentReviewCard } from '../components/DocumentReviewCard';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
const document = { id: 'buktiPembayaran' as const, title: 'Bukti Pembayaran OKB', path: 'registrations/x/buktiPembayaran.webp' };
const viewerDocuments = [{ id: 'buktiPembayaran' as const, title: 'Bukti Pembayaran OKB', href: '/admin/pendaftar/x/dokumen/buktiPembayaran?contentType=image%2Fwebp&v=o', verified: false, replacedAt: null }];

function renderCard() {
  render(<DocumentReviewCard participantId={participantId} document={document} status="pending" sourceLabel={null} viewerDocuments={viewerDocuments} viewerIndex={0} />);
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
    // Terverifikasi is a label, not a button that would save the same review again.
    expect(screen.getByText('Terverifikasi').closest('button')).toBeNull();
    expect(screen.queryByRole('button', { name: /Verifikasi Bukti Pembayaran OKB/ })).toBeNull();
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
    expect(screen.getByRole('button', { name: 'Verifikasi Bukti Pembayaran OKB' })).toBeDefined();
  });

  describe('Bukti Pembayaran', () => {
    const renderPayment = (status: 'pending' | 'verified', paymentMethod: 'cash' | 'transfer' | null) => {
      render(<DocumentReviewCard participantId={participantId} document={document} status={status} sourceLabel={null} viewerDocuments={viewerDocuments} viewerIndex={0} paymentMethod={paymentMethod} />);
      return screen.getByText('Bukti Pembayaran OKB').closest('article')!;
    };

    it('is verified by choosing Cash or Transfer, which then replaces Terverifikasi', async () => {
      let finish: () => void = () => {};
      mocks.savePayment.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
      const card = renderPayment('pending', null);
      expect(screen.queryByRole('button', { name: /Verifikasi/ })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Transfer' }));

      await waitFor(() => expect(card.getAttribute('data-review-state')).toBe('verified'));
      expect(screen.getByText('Transfer').closest('button')).toBeNull();
      expect(screen.queryByText('Terverifikasi')).toBeNull();
      const formData = mocks.savePayment.mock.calls[0][0] as FormData;
      expect([formData.get('participantId'), formData.get('method'), formData.get('verify')]).toEqual([participantId, 'transfer', 'true']);
      finish();
    });

    it('shows the recorded method as the verified label, each method in its own colour', () => {
      renderPayment('verified', 'cash');
      expect(screen.getByText('Cash').closest('button')).toBeNull();
      expect(screen.getByText('Cash').closest('[data-payment-method]')?.className).toContain('bg-amber-50');
      expect(screen.queryByRole('button', { name: 'Transfer' })).toBeNull();
    });

    it('still asks for the method on a Bukti Pembayaran verified before methods were recorded, without verifying again', async () => {
      mocks.savePayment.mockResolvedValue(undefined);
      renderPayment('verified', null);
      fireEvent.click(screen.getByRole('button', { name: 'Cash' }));
      await waitFor(() => expect(mocks.savePayment).toHaveBeenCalledOnce());
      expect((mocks.savePayment.mock.calls[0][0] as FormData).get('verify')).toBe('false');
    });

    it('goes back and says so when saving fails', async () => {
      mocks.savePayment.mockRejectedValue(new Error('x'));
      const card = renderPayment('pending', null);
      fireEvent.click(screen.getByRole('button', { name: 'Cash' }));
      await waitFor(() => {
        expect(screen.getByText('Metode pembayaran gagal disimpan. Coba lagi.')).toBeDefined();
        expect(card.getAttribute('data-review-state')).toBe('pending');
      }, { timeout: 3000 });
      expect(screen.getByRole('button', { name: 'Cash' })).toBeDefined();
    });
  });
});

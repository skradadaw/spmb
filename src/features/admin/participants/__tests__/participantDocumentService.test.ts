import { describe, expect, it, vi } from 'vitest';
import { createParticipantDocumentUrl, getDocumentPath, isSafeDocumentPath } from '../server/participantDocumentService';

const id = '123e4567-e89b-12d3-a456-426614174000';
const submissionId = '223e4567-e89b-12d3-a456-426614174000';
const path = `registrations/${submissionId}/pasFoto.png`;

describe('participant document service', () => {
  it('requires safe storage paths to match the row submission ID and document', () => {
    expect(isSafeDocumentPath(path)).toBe(true);
    expect(isSafeDocumentPath(path, submissionId, 'pasFoto')).toBe(true);
    expect(isSafeDocumentPath(path, id, 'pasFoto')).toBe(false);
    expect(isSafeDocumentPath(path, id, 'aktaKelahiran')).toBe(false);
    expect(isSafeDocumentPath('https://evil.test/a')).toBe(false);
    expect(isSafeDocumentPath('../secret')).toBe(false);
    expect(isSafeDocumentPath('registrations/not-a-uuid/pasFoto.png')).toBe(false);
    expect(isSafeDocumentPath(path.replace('pasFoto.png', 'pasFoto-r1760400000000.webp'), submissionId, 'pasFoto')).toBe(true);
    expect(isSafeDocumentPath(path.replace('pasFoto.png', 'pasFoto-rx.webp'), submissionId, 'pasFoto')).toBe(false);
    expect(isSafeDocumentPath(path.replace('pasFoto.png', 'pasFoto-r1760400000000/../x.webp'), submissionId, 'pasFoto')).toBe(false);
  });

  it('maps allowlisted document IDs to safe row paths', () => {
    expect(getDocumentPath({ submission_id: submissionId, dokumen_pas_foto: path }, 'pasFoto')).toBe(path);
    expect(getDocumentPath({ submission_id: id, dokumen_pas_foto: path }, 'pasFoto')).toBeNull();
    expect(getDocumentPath({ dokumen_pas_foto: path }, 'pasFoto')).toBeNull();
  });

  it('requests a 60-second signed URL for the participant row path', async () => {
    const getDocumentRow = vi.fn().mockResolvedValue({ id, submission_id: submissionId, dokumen_pas_foto: path });
    const createSignedUrl = vi.fn().mockResolvedValue({ data: { signedUrl: 'https://storage.test/private-token' }, error: null });
    const result = await createParticipantDocumentUrl(id, 'pasFoto', { getDocumentRow }, { createSignedUrl });
    expect(getDocumentRow).toHaveBeenCalledWith(id);
    expect(createSignedUrl).toHaveBeenCalledWith(path, 60);
    expect(result).toEqual({ signedUrl: 'https://storage.test/private-token', path });
  });

  it('rejects storage failures without returning a URL', async () => {
    const getDocumentRow = vi.fn().mockResolvedValue({ id, submission_id: submissionId, dokumen_pas_foto: path });
    await expect(createParticipantDocumentUrl(id, 'pasFoto', { getDocumentRow }, { createSignedUrl: vi.fn().mockResolvedValue({ data: null, error: new Error('private') }) })).rejects.toThrow('Dokumen peserta tidak dapat dibuka.');
  });
});
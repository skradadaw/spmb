import type { ParticipantExportRecord } from './contracts';
import { PARTICIPANT_FIELDS, type ParticipantFieldGroupName } from './fields';
import { formatParticipantFieldValue } from './presentation';
import { formatHomeAddress } from '@/lib/address';
import { buildXlsx } from '@/lib/xlsx';

const groups: [keyof typeof PARTICIPANT_FIELDS | 'admin', string][] = [['identity', 'Identitas siswa'], ['registration', 'Pendaftaran'], ['school', 'Sekolah'], ['affiliation', 'Afiliasi'], ['referral', 'Rujukan murid'], ['okb', 'OKB'], ['decision', 'Keputusan'], ['address', 'Alamat'], ['father', 'Data ayah'], ['mother', 'Data ibu'], ['admin', 'Administrasi']];
type ExportField = { key: string; title: string; group?: ParticipantFieldGroupName; fieldKey?: string };
const recordKey = (group: ParticipantFieldGroupName, key: string) => group === 'father' ? `father${key[0].toUpperCase()}${key.slice(1)}` : group === 'mother' ? `mother${key[0].toUpperCase()}${key.slice(1)}` : key;
const fields: ExportField[] = groups.flatMap(([group, label]): ExportField[] => group === 'admin' ? [['status', 'Status'], ['nisnMismatch', 'NISN tidak sesuai'], ['adminNote', 'Catatan admin'], ['createdAt', 'Tanggal daftar'], ['updatedAt', 'Terakhir diperbarui']].map(([key, title]) => ({ key, title: `${label} - ${title}` })) : PARTICIPANT_FIELDS[group].map(([key, , title]) => ({ key: recordKey(group, key), title: `${label} - ${title}`, group, fieldKey: key })));
const headers = fields.map(field => field.title);
const widths = fields.map(field => Math.min(36, Math.max(18, field.title.length + 3)));
const dateValue = (value: string | null) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : '';
/** Data fields are written as the admin sees them on screen; Alamat rumah is rebuilt from the tidied address parts. */
function fieldValue(record: ParticipantExportRecord, group: ParticipantFieldGroupName, fieldKey: string, key: string) {
  if (group === 'address' && fieldKey === 'alamatRumah') return formatHomeAddress(record.fields) || (record.fields.alamatRumah ?? '');
  const value = record.fields[key];
  return value?.trim() ? formatParticipantFieldValue(group, fieldKey, value) : '';
}
const valueFor = (record: ParticipantExportRecord, field: ExportField) => field.group && field.fieldKey ? fieldValue(record, field.group, field.fieldKey, field.key) : field.key === 'status' ? record.status : field.key === 'nisnMismatch' ? (record.nisnMismatch ? 'Ya' : '') : field.key === 'adminNote' ? record.adminNote ?? '' : field.key === 'createdAt' ? dateValue(record.createdAt) : field.key === 'updatedAt' ? dateValue(record.updatedAt) : '';

/** Semua kolom Data Pendaftar, ditulis seperti yang dilihat admin di layar. */
export function participantExportXlsx(items: ParticipantExportRecord[]) {
  return buildXlsx({ sheetName: 'Pendaftar', headers, rows: items.map(record => fields.map(field => valueFor(record, field))), widths });
}

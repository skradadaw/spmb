import { deflateRawSync } from 'node:zlib';
import type { ParticipantExportRecord } from './contracts';
import { PARTICIPANT_FIELDS } from './fields';

type ZipEntry = { name: string; data: Buffer; crc: number; offset: number; size: number };
const groups: [keyof typeof PARTICIPANT_FIELDS | 'admin', string][] = [['identity', 'Identitas siswa'], ['registration', 'Pendaftaran'], ['school', 'Sekolah'], ['affiliation', 'Afiliasi'], ['referral', 'Rujukan murid'], ['okb', 'OKB'], ['decision', 'Keputusan'], ['address', 'Alamat'], ['father', 'Data ayah'], ['mother', 'Data ibu'], ['admin', 'Administrasi']];
const fields = groups.flatMap(([group, label]) => group === 'admin' ? [['status', 'Status'], ['adminNote', 'Catatan admin'], ['createdAt', 'Tanggal daftar'], ['updatedAt', 'Terakhir diperbarui']].map(([key, title]) => ({ key, title: `${label} - ${title}` })) : PARTICIPANT_FIELDS[group].map(([key, , title]) => ({ key: group === 'father' ? `father${key[0].toUpperCase()}${key.slice(1)}` : group === 'mother' ? `mother${key[0].toUpperCase()}${key.slice(1)}` : key, title: `${label} - ${title}` })));
const headers = fields.map(field => field.title);
const widths = fields.map(field => Math.min(36, Math.max(18, field.title.length + 3)));
const dateValue = (value: string | null) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date(value)) : '';
const valueFor = (record: ParticipantExportRecord, key: string) => key === 'status' ? record.status : key === 'adminNote' ? record.adminNote ?? '' : key === 'createdAt' ? dateValue(record.createdAt) : key === 'updatedAt' ? dateValue(record.updatedAt) : record.fields[key] ?? '';
const xml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const column = (index: number) => { let value = ''; for (let number = index + 1; number; number = Math.floor((number - 1) / 26)) value = String.fromCharCode(65 + (number - 1) % 26) + value; return value; };
const crc32 = (data: Buffer) => { let crc = 0xffffffff; for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); } return (crc ^ 0xffffffff) >>> 0; };

function makeZip(files: Record<string, string>) {
  const entries: ZipEntry[] = [];
  const local: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const filename = Buffer.from(name, 'utf8');
    const data = deflateRawSync(Buffer.from(content, 'utf8'));
    const crc = crc32(Buffer.from(content, 'utf8'));
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x0800, 6); header.writeUInt16LE(8, 8);
    header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(Buffer.byteLength(content), 22); header.writeUInt16LE(filename.length, 26);
    local.push(header, filename, data);
    entries.push({ name, data, crc, offset, size: Buffer.byteLength(content) });
    offset += header.length + filename.length + data.length;
  }
  const central = entries.map(entry => {
    const filename = Buffer.from(entry.name, 'utf8'); const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(20, 6); header.writeUInt16LE(0x0800, 8); header.writeUInt16LE(8, 10);
    header.writeUInt32LE(entry.crc, 16); header.writeUInt32LE(entry.data.length, 20); header.writeUInt32LE(entry.size, 24); header.writeUInt16LE(filename.length, 28); header.writeUInt32LE(entry.offset, 42);
    return Buffer.concat([header, filename]);
  });
  const centralDirectory = Buffer.concat(central); const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(centralDirectory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, centralDirectory, end]);
}

export function participantExportXlsx(items: ParticipantExportRecord[]) {
  const rows: string[][] = [headers, ...items.map(record => fields.map(field => valueFor(record, field.key)))];
  const sheetRows = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => `<c r="${column(columnIndex)}${rowIndex + 1}" s="${rowIndex === 0 ? 1 : 0}" t="inlineStr"><is><t xml:space="preserve">${xml(rowIndex === 0 ? value : /^[\s\u0000-\u001f]*[=+@-]/.test(value) ? `'${value}` : value)}</t></is></c>`).join('')}</row>`).join('');
  const files = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Pendaftar" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF217A52"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><bottom style="thin"><color rgb="FFD9E2DC"/></bottom><left/><right/><top/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
    'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('')}</cols><sheetData>${sheetRows}</sheetData><autoFilter ref="A1:${column(headers.length - 1)}${rows.length}"/></worksheet>`,
  };
  return makeZip(files);
}

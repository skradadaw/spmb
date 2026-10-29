// @vitest-environment node
import { deflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { readVaImportFile } from '../server/vaImportFile';

const encode = (text: string) => new TextEncoder().encode(text);

/** Arsip zip minimal (tanpa CRC, yang tidak diperiksa pembaca) seperti yang ditulis Excel. */
function zip(files: Record<string, string>) {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = Buffer.from(name);
    const data = deflateRawSync(Buffer.from(content));
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt16LE(nameBytes.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBytes, data);
    centrals.push(central, nameBytes);
    offset += 30 + nameBytes.length + data.length;
  }
  const centralBytes = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(centralBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, centralBytes, end]));
}

describe('Nomor VA import file', () => {
  it('reads a comma CSV with headers in any case, skipping blank lines', () => {
    const rows = readVaImportFile('va.csv', encode('﻿No,NOMOR PENDAFTARAN,Nama,nomor  va\r\n1,OB-2027-001,Siti,7456012627300120\r\n\r\n2,"OB-2027-002","Budi, S","7456 0126 2730 0121"\r\n'));
    expect(rows).toEqual([
      { line: 2, nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' },
      { line: 4, nomorPendaftaran: 'OB-2027-002', nomorVa: '7456 0126 2730 0121' },
    ]);
  });

  it('reads a semicolon CSV as saved by Excel in Indonesian settings', () => {
    expect(readVaImportFile('va.csv', encode('Nomor Pendaftaran;Nomor VA\nOB-2027-001;7456012627300120\n'))).toEqual([
      { line: 2, nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' },
    ]);
  });

  it('reads the first sheet of an XLSX, including shared strings and a title row above the header', () => {
    const bytes = zip({
      'xl/sharedStrings.xml': '<sst><si><t>Daftar VA Bank</t></si><si><t>Nomor Pendaftaran</t></si><si><r><t>Nomor </t></r><r><t>VA</t></r></si><si><t>OB-2027-001</t></si><si><t>7456012627300120</t></si><si><t>OB-2027-002</t></si></sst>',
      'xl/worksheets/sheet1.xml': '<worksheet><sheetData>'
        + '<row r="1"><c r="A1" t="s"><v>0</v></c></row>'
        + '<row r="2"><c r="B2" t="s"><v>1</v></c><c r="C2" t="s"><v>2</v></c></row>'
        + '<row r="3"><c r="B3" t="s"><v>3</v></c><c r="C3" t="s"><v>4</v></c></row>'
        + '<row r="4"><c r="B4" t="s"><v>5</v></c><c r="C4"><v>7.4560126273001203E+15</v></c></row>'
        + '</sheetData></worksheet>',
    });
    expect(readVaImportFile('va.xlsx', bytes)).toEqual([
      { line: 3, nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' },
      // Sel angka 16 digit sudah kehilangan presisi di Excel.
      { line: 4, nomorPendaftaran: 'OB-2027-002', nomorVa: '7.4560126273001203E+15', numericOverflow: true },
    ]);
  });

  it('explains files it cannot use', () => {
    expect(() => readVaImportFile('va.pdf', encode('x'))).toThrow('File harus berformat Excel (.xlsx) atau CSV.');
    expect(() => readVaImportFile('va.csv', encode('Nama,VA\nSiti,1\n'))).toThrow('Kolom "Nomor Pendaftaran" dan "Nomor VA" tidak ditemukan di file.');
    expect(() => readVaImportFile('va.csv', encode('Nomor Pendaftaran,Nomor VA\n'))).toThrow('File tidak berisi baris data.');
    expect(() => readVaImportFile('va.xlsx', encode('bukan zip'))).toThrow('File Excel tidak dapat dibaca.');
  });
});

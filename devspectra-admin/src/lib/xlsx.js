// Membuat file Excel (.xlsx) langsung di browser, tanpa library tambahan.
//
// File .xlsx sebenarnya arsip zip berisi beberapa file XML (format Office Open XML).
// Di sini isinya dibuat sesederhana mungkin: satu sheet, baris judul tebal yang tetap terlihat
// saat digulir, lebar kolom, dan format tanggal serta rupiah. Bisa dibuka di Excel,
// Google Sheets, dan LibreOffice.

export const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Nomor gaya sel (urutannya sama dengan <cellXfs> di styles.xml di bawah)
export const STYLE = { normal: 0, header: 1, date: 2, rupiah: 3, bold: 4, boldRupiah: 5 };

const encoder = new TextEncoder();

/* ---------------- zip tanpa kompresi ---------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** files: [{ name, text }] -> isi arsip zip (metode "stored", tanpa kompresi). */
function zip(files, date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const parts = [];
  const central = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.text);
    const crc = crc32(data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // nama file UTF-8
    local.setUint16(8, 0, true); // tanpa kompresi
    local.setUint16(10, time, true);
    local.setUint16(12, day, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    local.setUint16(28, 0, true);
    parts.push(new Uint8Array(local.buffer), name, data);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 0x0800, true);
    entry.setUint16(10, 0, true);
    entry.setUint16(12, time, true);
    entry.setUint16(14, day, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, name.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), name);

    offset += 30 + name.length + data.length;
  }

  const centralSize = central.reduce((total, part) => total + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  return [...parts, ...central, new Uint8Array(end.buffer)];
}

/* ---------------- isi XML ---------------- */

// Karakter kontrol tidak boleh ada di XML; tanda <, >, &, dan kutip di-escape.
const xml = (value) =>
  String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** 0 -> A, 25 -> Z, 26 -> AA */
function columnName(index) {
  let name = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

/** "2026-10-31" -> nomor tanggal Excel (jumlah hari sejak 30 Desember 1899). */
export function excelDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86_400_000 + 25_569;
}

/**
 * Satu sel:
 * - teks: 'abc' atau { value: 'abc', style }
 * - angka: 123 atau { value: 123, style }
 * - tanggal: { date: '2026-10-31' }
 * - rumus: { formula: 'SUM(E2:E9)', value: 12345, style }
 */
function cellXml(cell, ref) {
  if (cell === null || cell === undefined || cell === '') return '';
  const c = typeof cell === 'object' ? cell : { value: cell };
  if (c.date !== undefined) {
    const serial = excelDate(c.date);
    if (serial === null) return '';
    return `<c r="${ref}" s="${c.style ?? STYLE.date}"><v>${serial}</v></c>`;
  }
  const style = c.style ? ` s="${c.style}"` : '';
  if (c.formula) {
    const cached = Number.isFinite(c.value) ? `<v>${c.value}</v>` : '';
    return `<c r="${ref}"${style}><f>${xml(c.formula)}</f>${cached}</c>`;
  }
  if (typeof c.value === 'number' && Number.isFinite(c.value)) {
    return `<c r="${ref}"${style}><v>${c.value}</v></c>`;
  }
  // Teks selalu disimpan sebagai teks, jadi isian seperti "=..." tidak pernah dijalankan sebagai rumus
  return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${xml(c.value)}</t></is></c>`;
}

function sheetXml({ columns, rows }) {
  const cols = columns.map((col, i) => `<col min="${i + 1}" max="${i + 1}" width="${col.width || 14}" customWidth="1"/>`).join('');
  const header = columns.map((col, i) => cellXml({ value: col.header, style: STYLE.header }, `${columnName(i)}1`)).join('');
  const body = rows
    .map((row, r) => `<row r="${r + 2}">${row.map((cell, i) => cellXml(cell, `${columnName(i)}${r + 2}`)).join('')}</row>`)
    .join('');
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    `<cols>${cols}</cols>` +
    `<sheetData><row r="1">${header}</row>${body}</sheetData>` +
    '</worksheet>'
  );
}

const STYLES_XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<numFmts count="2"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/><numFmt numFmtId="165" formatCode="&quot;Rp&quot;\\ #,##0"/></numFmts>' +
  '<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>' +
  '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFEDEBFF"/><bgColor indexed="64"/></patternFill></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="6">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
  '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
  '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
  '<xf numFmtId="165" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>' +
  '</cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>';

/** Nama sheet: maksimal 31 karakter, tanpa : \ / ? * [ ] */
const sheetName = (name) => String(name || 'Sheet1').replace(/[:\\/?*[\]]/g, ' ').trim().slice(0, 31) || 'Sheet1';

/**
 * Buat file .xlsx satu sheet.
 * columns: [{ header, width }], rows: [[sel, sel, ...], ...] (lihat cellXml untuk bentuk sel).
 */
export function buildXlsx({ sheet, columns, rows }) {
  const files = [
    {
      name: '[Content_Types].xml',
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '</Types>',
    },
    {
      name: '_rels/.rels',
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>',
    },
    {
      name: 'xl/workbook.xml',
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        `<sheets><sheet name="${xml(sheetName(sheet))}" sheetId="1" r:id="rId1"/></sheets>` +
        '</workbook>',
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      text:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '</Relationships>',
    },
    { name: 'xl/styles.xml', text: STYLES_XML },
    { name: 'xl/worksheets/sheet1.xml', text: sheetXml({ columns, rows }) },
  ];
  return new Blob(zip(files), { type: XLSX_TYPE });
}

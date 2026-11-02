// Export data pemasukan (halaman Keuangan) ke Excel (.xlsx) atau CSV.
import { incomeCategoryLabel } from './status';
import { buildXlsx, STYLE } from './xlsx';

const COLUMNS = [
  { header: 'Tanggal', width: 12 },
  { header: 'Keterangan', width: 44 },
  { header: 'Klien', width: 28 },
  { header: 'Kategori', width: 12 },
  { header: 'Jumlah (Rp)', width: 16 },
  { header: 'Sumber', width: 9 },
  { header: 'ID pesanan', width: 15 },
  { header: 'Dicatat oleh', width: 20 },
];

const dateOnly = (value) => String(value || '').slice(0, 10);

/** Urut dari tanggal paling lama, seperti buku kas. */
export function sortForExport(incomes) {
  return [...incomes].sort((a, b) => dateOnly(a.receivedOn).localeCompare(dateOnly(b.receivedOn)) || (a.id ?? 0) - (b.id ?? 0));
}

function fields(income, nameOf) {
  return {
    date: dateOnly(income.receivedOn),
    description: income.description || '',
    client: income.clientName || '',
    category: incomeCategoryLabel(income.category),
    amount: Math.round(Number(income.amount) || 0),
    source: income.orderId ? 'QRIS' : 'Manual',
    orderId: income.orderId || '',
    recordedBy: income.recordedByName || nameOf?.(income.recordedBy) || '',
  };
}

/** File Excel: baris judul tebal, tanggal dd/mm/yyyy, rupiah, dan baris Total (rumus SUM). */
export function incomesToXlsx(incomes, { sheet, nameOf }) {
  const list = sortForExport(incomes).map((i) => fields(i, nameOf));
  const rows = list.map((f) => [
    { date: f.date },
    f.description,
    f.client,
    f.category,
    { value: f.amount, style: STYLE.rupiah },
    f.source,
    f.orderId,
    f.recordedBy,
  ]);
  if (list.length) {
    const total = list.reduce((t, f) => t + f.amount, 0);
    rows.push([null, null, null, { value: 'Total', style: STYLE.bold }, { formula: `SUM(E2:E${list.length + 1})`, value: total, style: STYLE.boldRupiah }]);
  }
  return buildXlsx({ sheet, columns: COLUMNS, rows });
}

// Isian yang diawali =, +, -, @ bisa dianggap rumus oleh Excel atau Google Sheets saat membuka CSV
// (misalnya nama klien dari formulir kontak website). Diberi tanda petik di depan supaya tetap teks.
function csvText(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** File CSV (UTF-8, dipisah koma), untuk Google Sheets atau aplikasi lain. Jumlah ditulis tanpa titik. */
export function incomesToCsv(incomes, { nameOf } = {}) {
  const lines = [COLUMNS.map((c) => csvText(c.header)).join(',')];
  for (const f of sortForExport(incomes).map((i) => fields(i, nameOf))) {
    lines.push([f.date, f.description, f.client, f.category, String(f.amount), f.source, f.orderId, f.recordedBy].map(csvText).join(','));
  }
  // Tanda BOM di awal supaya Excel membaca huruf non-ASCII dengan benar
  return new Blob(['﻿' + lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
}

/** Simpan Blob sebagai file unduhan. */
export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

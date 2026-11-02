// Arti kode status dari backend, dan warna badge-nya.
// tone: good (hijau), warn (kuning), bad (merah), info (ungu), neutral (abu)

// Status pesan klien. Database asli memberi pesan baru status 'unread' (nilai default
// kolomnya), jadi dashboard memakai keluarga kata yang sama: unread, read, replied.
// Nilai lain yang mungkin ada di data lama (PENDING, READ, REPLIED, huruf besar atau
// kecil, atau kosong) tetap dikenali.
const INQUIRY = {
  unread: { label: 'Baru', tone: 'info' },
  read: { label: 'Dibaca', tone: 'warn' },
  replied: { label: 'Dibalas', tone: 'good' },
};

const INQUIRY_ALIASES = {
  pending: 'unread',
  new: 'unread',
  baru: 'unread',
  dibaca: 'read',
  dibalas: 'replied',
};

export const INQUIRY_STATUS_OPTIONS = Object.entries(INQUIRY).map(([value, { label }]) => ({ value, label }));

/** Ubah status dari backend menjadi 'unread', 'read', atau 'replied'. Kosong dianggap 'unread'. */
export function normalizeInquiryStatus(status) {
  const key = String(status || 'unread').trim().toLowerCase();
  return INQUIRY_ALIASES[key] || key;
}

export function inquiryStatus(status) {
  return INQUIRY[normalizeInquiryStatus(status)] || { label: String(status), tone: 'neutral' };
}

const ATTENDANCE = {
  HADIR: { label: 'Hadir', tone: 'good' },
  IZIN: { label: 'Izin', tone: 'warn' },
  SAKIT: { label: 'Sakit', tone: 'warn' },
  ALPA: { label: 'Alpa', tone: 'bad' },
};

export const ATTENDANCE_STATUS_OPTIONS = Object.entries(ATTENDANCE).map(([value, { label }]) => ({ value, label }));

export function attendanceStatus(row) {
  if (!row) return { label: 'Belum absen', tone: 'neutral' };
  return ATTENDANCE[String(row.status || 'HADIR').toUpperCase()] || { label: row.status, tone: 'neutral' };
}

export const INCOME_CATEGORIES = [
  { value: 'PROYEK', label: 'Proyek' },
  { value: 'PERAWATAN', label: 'Perawatan' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

export const incomeCategoryLabel = (code) =>
  INCOME_CATEGORIES.find((c) => c.value === String(code || '').toUpperCase())?.label || code || 'Lainnya';

/**
 * ID pesanan dari formulir kontak website (DSP-XXXXXXXX), untuk pembayaran QRIS.
 * Backend baru mengirimnya di orderId; pesan lama hanya mencantumkannya di isi pesan.
 */
export function orderIdOf(inquiry) {
  if (inquiry?.orderId) return inquiry.orderId;
  const match = /ID Pesanan:\s*(DSP-[A-Z0-9]{8})/.exec(inquiry?.message || '');
  return match ? match[1] : null;
}

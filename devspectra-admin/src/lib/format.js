// Fungsi format angka, uang, dan tanggal (bahasa Indonesia).

const pad = (n) => String(n).padStart(2, '0');

const numberFmt = new Intl.NumberFormat('id-ID');
const decimalFmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const dayMonthFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });
const longDateFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });
const monthYearFmt = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
const monthFmt = new Intl.DateTimeFormat('id-ID', { month: 'long' });
const monthShortFmt = new Intl.DateTimeFormat('id-ID', { month: 'short' });

export const formatNumber = (n) => numberFmt.format(Number(n) || 0);

/** 18500000 -> "Rp 18.500.000" */
export const formatRupiah = (n) => `Rp ${numberFmt.format(Math.round(Number(n) || 0))}`;

/** 18500000 -> "Rp 18,5 jt" */
export function formatRupiahShort(n, { prefix = true } = {}) {
  const value = Number(n) || 0;
  const abs = Math.abs(value);
  let text;
  if (abs >= 1e9) text = `${decimalFmt.format(value / 1e9)} M`;
  else if (abs >= 1e6) text = `${decimalFmt.format(value / 1e6)} jt`;
  else if (abs >= 1e3) text = `${decimalFmt.format(value / 1e3)} rb`;
  else text = numberFmt.format(value);
  return prefix ? `Rp ${text}` : text;
}

/**
 * Ubah nilai tanggal dari backend menjadi Date.
 * Mendukung "2026-10-17", "2026-10-17T08:05:00", "2026-10-17T08:05:00.123456",
 * dan format larik [2026, 10, 17, 8, 5] dari Jackson.
 * Waktu tanpa zona dianggap waktu lokal (sama seperti LocalDateTime di Java).
 */
export function parseDateTime(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (Array.isArray(value)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = value;
    return new Date(y, mo - 1, d, h, mi, s);
  }
  if (typeof value === 'string') {
    const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (m && !hasZone) {
      return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const withDate = (fmt, fallback = '') => (value) => {
  const d = parseDateTime(value);
  return d ? fmt.format(d) : fallback;
};

/** "17 Okt 2026" */
export const formatDate = withDate(dateFmt, '-');
/** "17 Okt" */
export const formatDayMonth = withDate(dayMonthFmt, '-');
/** "Sabtu, 17 Oktober 2026" */
export const formatLongDate = withDate(longDateFmt, '-');
/** "08.05" */
export const formatTime = withDate(timeFmt, '');
/** "Oktober 2026" */
export const formatMonthYear = withDate(monthYearFmt, '');
/** "Oktober" */
export const formatMonth = withDate(monthFmt, '');
/** "Okt" */
export const formatMonthShort = withDate(monthShortFmt, '');

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Baru saja", "5 menit lalu", "2 jam lalu", "Kemarin", "12 Okt" */
export function formatRelative(value, now = new Date()) {
  const d = parseDateTime(value);
  if (!d) return '';
  const minutes = Math.floor((now - d) / 60_000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (sameDay(d, now)) return `${Math.floor(minutes / 60)} jam lalu`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Kemarin';
  return d.getFullYear() === now.getFullYear() ? dayMonthFmt.format(d) : dateFmt.format(d);
}

/** Teks status kehadiran online: "Online", "Aktif 1 jam lalu", "Offline" */
export function presenceText(member) {
  if (member.online === null || member.online === undefined) return '';
  if (member.online) return 'Online';
  if (!member.lastSeenAt) return 'Offline';
  const rel = formatRelative(member.lastSeenAt);
  return `Aktif ${rel.charAt(0).toLowerCase()}${rel.slice(1)}`;
}

/** "Raka Pratama" -> "RP" */
export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

export const firstName = (name = '') => String(name).trim().split(/\s+/)[0] || String(name);

/** Date -> "2026-10-17" (zona waktu lokal) */
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Date -> "2026-10" */
export const toISOMonth = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
/** Date -> "2026-10-17T08:05:00" (format LocalDateTime) */
export const toLocalDateTime = (d) => `${toISODate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/** Gabungkan "2026-10-17" + "08:05" -> "2026-10-17T08:05:00", atau null kalau jam kosong */
export function combineDateTime(date, time) {
  if (!date || !time) return null;
  return `${date}T${time.length === 5 ? `${time}:00` : time}`;
}

/** Ambil "08:05" dari nilai waktu backend (untuk <input type="time">) */
export function timeInputValue(value) {
  const d = parseDateTime(value);
  return d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : '';
}

/** Persentase perubahan, dibulatkan. null kalau pembandingnya 0. */
export function percentChange(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

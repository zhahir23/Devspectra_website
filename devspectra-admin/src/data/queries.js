// Semua data yang dimuat halaman dashboard, beserta key penyimpanannya (lihat data/queryCache.js).
// Halaman yang memakai key yang sama berbagi satu permintaan dan satu salinan data.
import {
  announcementsApi,
  attendanceApi,
  incomesApi,
  inquiriesApi,
  presenceApi,
  projectsApi,
  servicesApi,
  settingsApi,
  teamMembersApi,
  testimonialsApi,
  usersApi,
} from '../api/endpoints';
import { canSeeFinance } from '../auth/permissions';
import { toISODate, toISOMonth } from '../lib/format';
import { prefetchQuery, refetchQuery, scopedKey } from './queryCache';

export const queries = {
  users: () => ({ key: 'users', load: usersApi.list }),
  presence: () => ({ key: 'presence', load: presenceApi.list }),
  inquiries: () => ({ key: 'inquiries', load: inquiriesApi.list }),
  attendanceByDate: (date) => ({ key: `attendance:${date}`, load: () => attendanceApi.byDate(date) }),
  attendanceSummary: (month) => ({ key: `attendance-summary:${month}`, load: () => attendanceApi.summary(month) }),
  incomes: () => ({ key: 'incomes', load: incomesApi.list }),
  announcement: () => ({ key: 'announcement', load: announcementsApi.latest }),
  settings: () => ({ key: 'settings', load: settingsApi.list }),
  services: () => ({ key: 'services', load: servicesApi.list }),
  testimonials: () => ({ key: 'testimonials', load: testimonialsApi.list }),
  projects: () => ({ key: 'projects', load: projectsApi.list }),
  teamMembers: () => ({ key: 'team-members', load: teamMembersApi.list }),
};

/**
 * Setelah absensi berubah (absen masuk/pulang atau koreksi): muat ulang daftar hari itu dan
 * rekap bulannya, supaya halaman Absensi dan kolom Hadir di Anggota ikut benar.
 * Key yang belum pernah dimuat dilewati.
 */
export function refreshAttendance(email, date) {
  refetchQuery(scopedKey(email, queries.attendanceByDate(date).key)).catch(() => {});
  refetchQuery(scopedKey(email, queries.attendanceSummary(String(date).slice(0, 7)).key)).catch(() => {});
}

/** Data yang dibutuhkan halaman di alamat ini. */
function queriesForPath(path, email) {
  const now = new Date();
  const today = toISODate(now);
  const finance = canSeeFinance(email);
  if (path === '/') {
    return [
      queries.inquiries(),
      queries.attendanceByDate(today),
      queries.announcement(),
      queries.settings(),
      ...(finance ? [queries.incomes()] : []),
    ];
  }
  if (path.startsWith('/anggota')) return [queries.attendanceSummary(toISOMonth(now))];
  if (path.startsWith('/absensi')) return [queries.attendanceByDate(today)];
  if (path.startsWith('/klien')) return [queries.inquiries()];
  if (path.startsWith('/keuangan')) return finance ? [queries.incomes()] : [];
  const content = {
    '/konten/layanan': queries.services,
    '/konten/testimoni': queries.testimonials,
    '/konten/projects': queries.projects,
    '/konten/divisi': queries.teamMembers,
  }[path];
  return content ? [content()] : [];
}

/** Muat data sebuah halaman sebelum dibuka (misalnya saat kursor berada di atas menunya). */
export function prefetchPath(email, path) {
  queriesForPath(path, email).forEach((query) => prefetchQuery(scopedKey(email, query.key), query.load));
}

/** Dipanggil sekali setelah dashboard terbuka: muat data semua menu utama di belakang layar. */
export function prefetchMainMenus(email) {
  ['/', '/anggota', '/absensi', '/klien', '/keuangan'].forEach((path) => prefetchPath(email, path));
}

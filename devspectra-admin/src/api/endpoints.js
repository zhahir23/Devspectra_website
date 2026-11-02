// SEMUA alamat API ada di file ini. Kalau backend mengganti alamat, cukup ubah di sini.
import { api } from './client';
import { ApiError } from './errors';

function query(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  const text = new URLSearchParams(entries).toString();
  return text ? `?${text}` : '';
}

function crud(base) {
  return {
    list: () => api.get(base),
    create: (data) => api.post(base, data),
    update: (id, data) => api.put(`${base}/${id}`, data),
    remove: (id) => api.del(`${base}/${id}`),
  };
}

/* ------------------------------------------------------------------
 * SUDAH ADA di backend teman kamu
 * ------------------------------------------------------------------ */

// Login di halaman masuk dashboard (pages/SignInGate.jsx). Balasan berisi { token, email, name, role, division }.
// auth: false = tanpa token lama, dan balasan 401 (password salah) tidak dianggap sesi berakhir.
export const authApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }, { auth: false }),
};

export const usersApi = {
  list: () => api.get('/api/users'),
  get: (id) => api.get(`/api/users/${id}`),
  // Pemegang keuangan membuat akun anggota baru: { name, email, password, role, division }.
  // Backend menolak (403) kalau yang login bukan pemegang keuangan.
  create: (data) => api.post('/api/users', data),
  // Kirim { name, role, division }. Email tidak bisa diubah.
  // Backend hanya mengizinkan akun sendiri atau pemegang keuangan (lainnya 403).
  update: (id, data) => api.put(`/api/users/${id}`, data),
  /**
   * Atur ulang password memakai PUT /api/users/{id} yang sudah ada: backend mengganti
   * password kalau field `password` diisi. Backend juga selalu menimpa name, role, dan
   * division dari isi permintaan, jadi ketiganya diambil ulang dari server dulu supaya
   * tidak ikut terhapus. Respons backend (berisi hash password) sengaja tidak dikembalikan.
   */
  resetPassword: async (id, password) => {
    const current = await api.get(`/api/users/${id}`);
    if (!current?.name) throw new ApiError('Data anggota dari server tidak lengkap. Muat ulang halaman, lalu coba lagi.');
    await api.put(`/api/users/${id}`, {
      name: current.name,
      role: current.role ?? null,
      division: current.division ?? null,
      password,
    });
  },
  // Hanya pemegang keuangan, dan tidak untuk akunnya sendiri
  remove: (id) => api.del(`/api/users/${id}`),
};

export const inquiriesApi = {
  list: () => api.get('/api/inquiries'),
  // status: unread (Baru), read (Dibaca), replied (Dibalas). Database asli memakai 'unread' untuk pesan baru.
  setStatus: (id, status) => api.put(`/api/inquiries/${id}/status`, { status }),
  remove: (id) => api.del(`/api/inquiries/${id}`),
  // BARU, belum ada di backend: siapa anggota yang menangani pesan ini
  assign: (id, userId) => api.put(`/api/inquiries/${id}/assign`, { userId }),
  // Tandai proyek selesai (completed: true) sambil mengisi tagihan dalam rupiah, supaya QRIS dan tagihannya
  // muncul untuk klien di halaman Contact website. Juga untuk mengubah tagihan. completed: false membatalkannya.
  // Balasan: data pesan dengan orderId, projectCompletedAt, billAmount, dan paidAt.
  setProjectDone: (id, completed, billAmount) =>
    api.put(`/api/inquiries/${id}/project`, completed ? { completed: true, billAmount } : { completed: false }),
  // Khusus pemegang keuangan: konfirmasi pembayaran QRIS setelah uang masuk di GoPay Merchant.
  // { paid: true, amount, receivedOn } membuat pemasukan di Keuangan secara otomatis.
  // { paid: false } membatalkannya, dan pemasukan tadi ikut dihapus.
  setPayment: (id, data) => api.put(`/api/inquiries/${id}/payment`, data),
};

export const servicesApi = crud('/api/services');
export const testimonialsApi = crud('/api/testimonials');
export const settingsApi = crud('/api/settings');

/* ------------------------------------------------------------------
 * BARU. Kode backend-nya sudah disiapkan (CATATAN-BACKEND.md bagian 3), aktif setelah digabung.
 * Selama belum dibuat, halaman terkait menampilkan pesan "menunggu API".
 * ------------------------------------------------------------------ */

export const attendanceApi = {
  byDate: (date) => api.get(`/api/attendance${query({ date })}`),
  checkIn: () => api.post('/api/attendance/check-in'),
  checkOut: () => api.post('/api/attendance/check-out'),
  // Anggota mengisi atau mengoreksi absensinya SENDIRI: { userId, workDate, status, note, checkInAt, checkOutAt }.
  // Backend menolak (403) kalau userId atau baris absensinya milik anggota lain.
  save: (data) => api.post('/api/attendance', data),
  update: (id, data) => api.put(`/api/attendance/${id}`, data),
  summary: (month) => api.get(`/api/attendance/summary${query({ month })}`),
};

export const presenceApi = {
  list: () => api.get('/api/presence'),
  heartbeat: () => api.post('/api/presence/heartbeat'),
};

// Hanya untuk anggota yang boleh melihat keuangan. Backend harus menolak (403) yang lain.
export const incomesApi = crud('/api/incomes');

export const announcementsApi = {
  latest: () => api.get('/api/announcements/latest'),
  create: (message) => api.post('/api/announcements', { message }),
};

// Konten website > Projects dan Divisi (CATATAN-BACKEND.md bagian 9).
// Gambar baru ikut di dalam data sebagai data URL: imageData (project) atau photoData (anggota tim).
// Respons berisi imageUrl / photoUrl, misalnya "/api/media/12".
export const projectsApi = crud('/api/projects');
export const teamMembersApi = crud('/api/team-members');

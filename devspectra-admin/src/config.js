// Pengaturan dasar dashboard. Nilainya diambil dari file .env (lihat .env.example).

const env = import.meta.env;
const list = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** Alamat backend Spring Boot, tanpa garis miring di akhir. */
export const API_URL = (env.VITE_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

/** true = dashboard memakai data contoh dan tidak memanggil backend sama sekali. */
export const DEMO_MODE = String(env.VITE_DEMO_MODE).toLowerCase() === 'true';

function originOf(url) {
  try {
    return url ? new URL(url).origin : '';
  } catch {
    return '';
  }
}

/**
 * Alamat website company, misalnya http://localhost:3000. Dipakai untuk menampilkan gambar
 * project yang masih tersimpan di folder public website (misalnya /projects/braka.png).
 * VITE_LOGIN_URL hanya dibaca untuk file .env lama (dulu halaman login ada di website).
 */
export const WEBSITE_URL = (env.VITE_WEBSITE_URL || originOf(env.VITE_LOGIN_URL) || 'http://localhost:3000').replace(/\/+$/, '');

/** Nama kunci token JWT (hasil login di dashboard) di localStorage. */
export const TOKEN_STORAGE_KEY = env.VITE_TOKEN_KEY || 'token';

/** Hanya email dengan akhiran ini yang boleh membuka dashboard. Pemeriksaan utama tetap di backend. */
export const ALLOWED_EMAIL_DOMAIN = '@devspectra.com';

/**
 * Email anggota yang boleh melihat keuangan (dipisah koma).
 * Kosong = tidak ada yang bisa melihat menu Keuangan.
 */
export const FINANCE_EMAILS = list(env.VITE_FINANCE_EMAILS);

/** Seberapa sering dashboard memberi tahu backend bahwa anggota ini masih aktif. */
export const HEARTBEAT_INTERVAL_MS = 60_000;

/** Anggota dianggap online kalau terakhir aktif kurang dari selang waktu ini. */
export const ONLINE_WINDOW_MS = 2 * 60_000;

/** Kunci di tabel settings untuk menyimpan jumlah followers. */
export const FOLLOWERS_SETTING_KEY = 'followers_instagram';

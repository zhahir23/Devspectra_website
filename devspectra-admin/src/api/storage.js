// Menyimpan token login (JWT) di browser.
// Token didapat dari halaman masuk dashboard (pages/SignInGate.jsx, POST /api/auth/login).
// Dibungkus try/catch karena penyimpanan browser bisa diblokir (mode privat, dll).
import { TOKEN_STORAGE_KEY } from '../config';

export const storage = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  saveToken(token) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Tidak bisa menyimpan: pengguna perlu masuk lagi setelah halaman dimuat ulang.
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // abaikan
    }
  },
};

/** Baca isi token JWT ({ sub, exp, ... }) tanpa memeriksa tanda tangannya. */
export function decodeToken(token) {
  try {
    const part = String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(part)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Waktu kedaluwarsa token dalam milidetik, atau null kalau tidak ada. */
export function tokenExpiry(token) {
  const payload = decodeToken(token);
  return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
}

/** Email pemilik token. Backend menyimpannya di "sub" (lihat JwtTokenProvider). */
export function tokenEmail(token) {
  const payload = decodeToken(token);
  const email = payload?.sub || payload?.email || '';
  return String(email).trim().toLowerCase();
}

/**
 * Ambil token yang dikirim lewat alamat (dipakai untuk pengujian), misalnya
 * https://dashboard.../#token=eyJ... lalu hapus dari alamat supaya tidak tersimpan di riwayat.
 * Mengembalikan true kalau ada token yang diterima.
 */
export function consumeTokenFromUrl() {
  try {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
    const token = hash.get('token') || hash.get('access_token') || url.searchParams.get('token');
    if (!token) return false;
    storage.saveToken(token);
    hash.delete('token');
    hash.delete('access_token');
    url.searchParams.delete('token');
    const rest = hash.toString();
    url.hash = rest ? `#${rest}` : '';
    window.history.replaceState(window.history.state, '', url.toString());
    return true;
  } catch {
    return false;
  }
}

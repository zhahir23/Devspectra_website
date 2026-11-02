import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onUnauthorized } from '../api/client';
import { consumeTokenFromUrl, storage, tokenEmail, tokenExpiry } from '../api/storage';
import { ALLOWED_EMAIL_DOMAIN, TOKEN_STORAGE_KEY } from '../config';
import { clearQueries } from '../data/queryCache';

// Login ada di dashboard ini sendiri (pages/SignInGate.jsx, POST /api/auth/login), terpisah dari
// website company, jadi pengunjung website tidak melihat jalan masuk ke dashboard.
// Token JWT disimpan di localStorage (VITE_TOKEN_KEY). Alamat .../#token=<JWT> juga masih diterima,
// misalnya untuk uji otomatis.

const AuthContext = createContext(null);
const EXPIRED_MESSAGE = 'Sesi kamu sudah berakhir. Silakan masuk lagi.';

function readSession() {
  consumeTokenFromUrl();
  const token = storage.getToken();
  if (!token) return { session: null, notice: '' };
  const exp = tokenExpiry(token);
  if (exp && exp <= Date.now()) {
    storage.clear();
    return { session: null, notice: EXPIRED_MESSAGE };
  }
  const email = tokenEmail(token);
  if (!email) {
    storage.clear();
    return { session: null, notice: 'Token login tidak bisa dibaca. Silakan masuk lagi.' };
  }
  return { session: { email, exp }, notice: '' };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(readSession);
  const { session } = state;

  /**
   * reason: "manual" (tombol Keluar) atau "expired" (token habis / ditolak backend).
   * Setelah keluar, halaman login dashboard langsung tampil di alamat yang sama.
   */
  const signOut = useCallback((reason = 'manual') => {
    storage.clear();
    // Data yang sudah dimuat ikut dilupakan, supaya tidak terbawa ke akun berikutnya
    clearQueries();
    setState({ session: null, notice: reason === 'manual' ? 'Kamu sudah keluar.' : EXPIRED_MESSAGE });
  }, []);

  /** Muat ulang sesi dari penyimpanan (setelah login, memilih akun demo, atau menempel token). */
  const refreshSession = useCallback(() => {
    const next = readSession();
    setState(next);
    return Boolean(next.session);
  }, []);

  // Kalau backend membalas 401, sesi dianggap berakhir.
  useEffect(() => {
    onUnauthorized(() => signOut('expired'));
    return () => onUnauthorized(null);
  }, [signOut]);

  // Keluar otomatis saat token kedaluwarsa (token backend berlaku 24 jam).
  useEffect(() => {
    if (!session?.exp) return undefined;
    const remaining = session.exp - Date.now();
    if (remaining <= 0) {
      signOut('expired');
      return undefined;
    }
    const timer = setTimeout(() => signOut('expired'), Math.min(remaining, 2_000_000_000));
    return () => clearTimeout(timer);
  }, [session, signOut]);

  // Ikut berubah kalau token diganti dari tab lain (login atau keluar di tab lain),
  // atau kalau token baru dikirim lewat #token=... tanpa memuat ulang halaman.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || event.key === TOKEN_STORAGE_KEY) setState(readSession());
    };
    const onHashChange = () => {
      if (/(^|[#&])(token|access_token)=/.test(window.location.hash)) setState(readSession());
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const email = session?.email || '';
  const domainOk = email.endsWith(ALLOWED_EMAIL_DOMAIN);

  const value = useMemo(
    () => ({
      email,
      isLoggedIn: Boolean(session) && domainOk,
      denied: Boolean(session) && !domainOk,
      notice: state.notice,
      signOut,
      refreshSession,
    }),
    [email, session, domainOk, state.notice, signOut, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  return ctx;
}

import { createContext, useContext, useEffect, useMemo } from 'react';
import { asList, useApi } from '../hooks/useApi';
import { normalizeInquiryStatus } from '../lib/status';
import { queries } from './queries';

const InboxContext = createContext(null);
const REFRESH_MS = 2 * 60_000;

/**
 * Jumlah pesan klien yang masih "Baru", untuk angka di menu dan lonceng notifikasi.
 * Memakai data yang sama dengan halaman Ringkasan dan Klien masuk (satu permintaan untuk ketiganya),
 * jadi perubahan status di halaman Klien masuk langsung terlihat di angka menu tanpa memuat ulang.
 */
export function InboxProvider({ children }) {
  const { data, reload } = useApi(queries.inquiries());
  const pendingCount = useMemo(
    () => asList(data).filter((q) => normalizeInquiryStatus(q.status) === 'unread').length,
    [data],
  );

  // Cek pesan baru tiap 2 menit, hanya saat dashboard sedang dilihat.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') reload();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [reload]);

  const value = useMemo(() => ({ pendingCount }), [pendingCount]);
  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error('useInbox harus dipakai di dalam <InboxProvider>.');
  return ctx;
}

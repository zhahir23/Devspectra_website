import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchQuery, readQuery, refetchQuery, scopedKey, setQueryData, subscribeQuery } from '../data/queryCache';

const OFF = Object.freeze({ data: undefined, error: null, loading: false });
const subscribeNothing = () => () => {};

/**
 * Data API untuk sebuah halaman, lewat penyimpanan bersama (data/queryCache.js).
 * query: salah satu dari data/queries.js, atau null kalau belum perlu dimuat.
 * Mengembalikan { data, error, loading, reload, setData }.
 *
 * Kalau data untuk query ini sudah pernah dimuat (oleh halaman ini atau halaman lain),
 * data itu langsung tampil, lalu diperbarui diam-diam kalau sudah lama.
 */
export function useApi(query) {
  const { email } = useAuth();
  const key = query ? scopedKey(email, query.key) : null;
  const load = query?.load;

  const subscribe = useCallback((listener) => (key ? subscribeQuery(key, listener) : subscribeNothing()), [key]);
  const snapshot = useSyncExternalStore(subscribe, () => (key ? readQuery(key) : OFF));

  useEffect(() => {
    if (key) fetchQuery(key, load).catch(() => {});
    // `load` selalu sama untuk key yang sama, karena key sudah memuat semua parameternya.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => (key ? refetchQuery(key).catch(() => {}) : Promise.resolve()), [key]);
  const setData = useCallback(
    (updater) => {
      if (key) setQueryData(key, updater);
    },
    [key],
  );

  // Kalau data lama masih ada, gagal memperbarui di belakang layar tidak menutupi data itu.
  const error = snapshot.data === undefined ? snapshot.error : null;
  return { data: snapshot.data, error, loading: snapshot.loading, reload, setData };
}

/** Pastikan hasil API berupa larik. */
export const asList = (data) => (Array.isArray(data) ? data : []);

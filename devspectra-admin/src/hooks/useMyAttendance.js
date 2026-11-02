import { useCallback, useState } from 'react';
import { attendanceApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { queries, refreshAttendance } from '../data/queries';
import { useTeam } from '../data/TeamContext';
import { toISODate } from '../lib/format';
import { asList, useApi } from './useApi';

/**
 * Absensi pengguna yang sedang login untuk hari ini, plus tombol absen masuk/pulang.
 * available: null (sedang dicek), true, atau false (API absensi belum ada di backend).
 * Datanya sama dengan daftar absensi hari ini di halaman Absensi (satu permintaan untuk keduanya).
 */
export function useMyAttendance() {
  const { email } = useAuth();
  const { me } = useTeam();
  const today = toISODate(new Date());
  const { data, error, loading, reload } = useApi(queries.attendanceByDate(today));
  const [busy, setBusy] = useState(false);

  const available = error?.isMissingEndpoint ? false : error ? null : loading && data === undefined ? null : true;
  const row = me ? asList(data).find((a) => a.userId === me.id) || null : null;

  const run = useCallback(
    async (action) => {
      setBusy(true);
      try {
        await action();
        refreshAttendance(email, today);
      } finally {
        setBusy(false);
      }
    },
    [email, today],
  );

  return {
    available,
    error: error && !error.isMissingEndpoint ? error : null,
    loading,
    row,
    rows: asList(data),
    busy,
    reload,
    checkIn: () => run(() => attendanceApi.checkIn()),
    checkOut: () => run(() => attendanceApi.checkOut()),
  };
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { presenceApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { HEARTBEAT_INTERVAL_MS, ONLINE_WINDOW_MS } from '../config';
import { asList, useApi } from '../hooks/useApi';
import { parseDateTime } from '../lib/format';
import { queries } from './queries';
import { refetchQuery, scopedKey } from './queryCache';

const TeamContext = createContext(null);

// Backend lama ikut mengirim hash password di daftar user. Buang sebelum dipakai.
function stripSecrets(user) {
  const { password: _password, ...rest } = user || {};
  return rest;
}

// Satu heartbeat dalam satu waktu. Di mode pengembangan, React menjalankan efek dua kali,
// jadi tanpa ini setiap heartbeat terkirim ganda.
let heartbeatInFlight = null;
function sendHeartbeat() {
  heartbeatInFlight ??= presenceApi.heartbeat().finally(() => {
    heartbeatInFlight = null;
  });
  return heartbeatInFlight;
}

/**
 * Menyimpan daftar anggota tim dan status online mereka untuk semua halaman.
 * Juga mengirim "heartbeat" tiap 60 detik supaya anggota yang sedang membuka
 * dashboard terlihat online. Status online baru diminta setelah heartbeat pertama,
 * supaya akun sendiri langsung tampil online (tanpa permintaan status kedua).
 */
export function TeamProvider({ children }) {
  const { email } = useAuth();
  const usersQuery = useApi(queries.users());
  const [firstBeatDone, setFirstBeatDone] = useState(false);
  const presenceQuery = useApi(firstBeatDone ? queries.presence() : null);
  const [tick, setTick] = useState(0);
  const presenceKey = scopedKey(email, queries.presence().key);

  useEffect(() => {
    let stopped = false;
    let missing = false;
    const beat = async (first) => {
      // Backend belum punya API status online: berhenti mengirim apa pun
      if (missing) return;
      try {
        await sendHeartbeat();
      } catch (error) {
        if (error.isMissingEndpoint) missing = true;
      }
      if (stopped) return;
      if (first) setFirstBeatDone(true);
      else if (!missing) refetchQuery(presenceKey).catch(() => {});
      setTick((t) => t + 1);
    };
    beat(true);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') beat(false);
    }, HEARTBEAT_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [presenceKey]);

  const users = useMemo(() => asList(usersQuery.data).map(stripSecrets), [usersQuery.data]);
  const presence = useMemo(() => {
    const map = {};
    asList(presenceQuery.data).forEach((p) => {
      if (p && p.userId !== undefined) map[p.userId] = p;
    });
    return map;
  }, [presenceQuery.data]);
  // null = masih dicek, false = fitur belum ada di backend, true = tersedia
  const presenceAvailable = presenceQuery.error?.isMissingEndpoint ? false : presenceQuery.data !== undefined ? true : null;

  const team = useMemo(() => {
    const now = Date.now();
    return users.map((u) => {
      const p = presence[u.id];
      const lastSeenAt = parseDateTime(p?.lastSeenAt);
      // undefined = masih dicek, null = fitur belum ada di backend, true/false = status sebenarnya
      let online = presenceAvailable === false ? null : undefined;
      if (presenceAvailable) {
        online = typeof p?.online === 'boolean' ? p.online : Boolean(lastSeenAt && now - lastSeenAt.getTime() < ONLINE_WINDOW_MS);
      }
      return { ...u, lastSeenAt, online };
    });
    // tick ikut dihitung supaya status online diperbarui setiap heartbeat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, presence, presenceAvailable, tick]);

  // Token hanya berisi email, jadi nama/peran/divisi diambil dari daftar anggota.
  const me = useMemo(
    () => team.find((m) => String(m.email || '').toLowerCase() === String(email || '').toLowerCase()) || null,
    [team, email],
  );

  const reloadTeam = usersQuery.reload;
  // Ubah daftar anggota di layar begitu server menyatakan berhasil, tanpa menunggu daftar baru dimuat
  const patchTeam = usersQuery.setData;
  const reloadPresence = useCallback(() => refetchQuery(presenceKey).catch(() => {}), [presenceKey]);
  const loading = usersQuery.loading && usersQuery.data === undefined;

  const value = useMemo(
    () => ({
      team,
      me,
      loading,
      error: usersQuery.error,
      presenceAvailable,
      reloadTeam,
      patchTeam,
      reloadPresence,
      nameOf: (id) => team.find((m) => m.id === id)?.name || null,
    }),
    [team, me, loading, usersQuery.error, presenceAvailable, reloadTeam, patchTeam, reloadPresence],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam harus dipakai di dalam <TeamProvider>.');
  return ctx;
}

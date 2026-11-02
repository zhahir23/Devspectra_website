// Penyimpanan data API bersama untuk semua halaman dashboard.
//
// - Data dengan key yang sama hanya diminta sekali, walaupun dipakai beberapa halaman atau
//   komponen sekaligus (misalnya daftar klien untuk angka di menu dan untuk halaman Klien masuk).
// - Saat kembali ke sebuah halaman, data terakhir langsung tampil tanpa tulisan "Memuat data".
//   Kalau data itu sudah lebih lama dari STALE_MS, dashboard memperbaruinya diam-diam.
// File ini tidak memakai React, supaya bisa dipakai juga untuk memuat data lebih dulu (prefetch).

export const STALE_MS = 30_000;

const IDLE = Object.freeze({ data: undefined, error: null, loading: true });
const entries = new Map();

/** Key penyimpanan per akun, supaya data akun sebelumnya tidak pernah ikut tampil. */
export const scopedKey = (email, key) => `${String(email || '').trim().toLowerCase()}|${key}`;

function entryFor(key) {
  let entry = entries.get(key);
  if (!entry) {
    entry = { key, snapshot: IDLE, load: null, updatedAt: 0, promise: null, seq: 0, listeners: new Set() };
    entries.set(key, entry);
  }
  return entry;
}

function update(entry, patch) {
  entry.snapshot = Object.freeze({ ...entry.snapshot, ...patch });
  entry.listeners.forEach((listener) => listener());
}

/**
 * Ambil data untuk key ini.
 * - Kalau permintaan yang sama sedang berjalan, permintaan itu yang dipakai (tidak dikirim dua kali).
 * - Kalau data masih baru (belum lewat STALE_MS), tidak ada permintaan sama sekali.
 * - force: tetap minta data terbaru, misalnya setelah menyimpan perubahan.
 */
export function fetchQuery(key, load, { force = false } = {}) {
  const entry = entryFor(key);
  if (load) entry.load = load;
  const loader = entry.load;
  if (!loader) return Promise.resolve(entry.snapshot.data);
  if (entry.promise && !force) return entry.promise;
  const fresh = entry.updatedAt > 0 && !entry.snapshot.error && Date.now() - entry.updatedAt < STALE_MS;
  if (fresh && !force) return Promise.resolve(entry.snapshot.data);

  const seq = ++entry.seq;
  const promise = Promise.resolve()
    .then(() => loader())
    .then(
      (data) => {
        // Jawaban yang sudah digantikan permintaan lebih baru diabaikan
        if (seq === entry.seq) {
          entry.promise = null;
          entry.updatedAt = Date.now();
          update(entry, { data, error: null, loading: false });
        }
        return data;
      },
      (error) => {
        if (seq === entry.seq) {
          entry.promise = null;
          update(entry, { error, loading: false });
        }
        throw error;
      },
    );
  entry.promise = promise;
  if (!entry.snapshot.loading) update(entry, { loading: true });
  return promise;
}

/** Muat data di belakang layar, misalnya sebelum halamannya dibuka. Kesalahan diabaikan. */
export function prefetchQuery(key, load) {
  fetchQuery(key, load).catch(() => {});
}

/** Minta ulang data memakai cara memuat yang terakhir dipakai untuk key ini. */
export function refetchQuery(key) {
  return fetchQuery(key, null, { force: true });
}

/** Ubah data tersimpan tanpa bertanya ke server, setelah perubahannya berhasil disimpan di server. */
export function setQueryData(key, updater) {
  const entry = entryFor(key);
  // Jawaban lama yang masih di jalan tidak boleh menimpa perubahan ini
  entry.seq += 1;
  entry.promise = null;
  const data = typeof updater === 'function' ? updater(entry.snapshot.data) : updater;
  update(entry, { data, error: null, loading: false });
}

export function readQuery(key) {
  return entries.get(key)?.snapshot ?? IDLE;
}

export function subscribeQuery(key, listener) {
  const entry = entryFor(key);
  entry.listeners.add(listener);
  return () => entry.listeners.delete(listener);
}

/** Perbarui data yang sedang tampil kalau sudah lama, misalnya saat tab dashboard dibuka lagi. */
export function revalidateVisibleQueries() {
  entries.forEach((entry) => {
    if (entry.listeners.size > 0 && entry.load) fetchQuery(entry.key).catch(() => {});
  });
}

/** Lupakan semua data, misalnya saat keluar. */
export function clearQueries() {
  entries.forEach((entry) => {
    entry.seq += 1;
  });
  entries.clear();
}

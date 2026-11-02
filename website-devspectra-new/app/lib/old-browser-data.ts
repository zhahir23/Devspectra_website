// Data lama yang dulu disimpan website di browser pengunjung, dari fitur yang sekarang
// dipindah ke dashboard admin dan backend:
// - devspectra_session: token login admin (login sekarang hanya di dashboard admin)
// - devspectra_reviews: penilaian dari halaman Contact (sekarang masuk Testimoni di dashboard)
// - devspectra-orders: status pesanan QRIS (sekarang disimpan di backend)
const OLD_KEYS = ["devspectra_session", "devspectra_reviews", "devspectra-orders"];

/** Hapus data lama itu sekali saat halaman dibuka. Aman dipanggil berulang. */
export function clearOldBrowserData() {
  try {
    for (const key of OLD_KEYS) localStorage.removeItem(key);
  } catch {
    // Penyimpanan browser diblokir: tidak ada yang perlu dihapus
  }
}

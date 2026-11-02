export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  /** Alamat API-nya belum ada di backend (biasanya fitur baru yang belum dibuat). */
  get isMissingEndpoint() {
    return this.status === 404 || this.status === 405 || this.status === 501;
  }

  /** Backend tidak bisa dihubungi sama sekali. */
  get isNetworkError() {
    return this.status === 0;
  }
}

const GENERIC_REASONS = new Set([
  'Bad Request',
  'Unauthorized',
  'Forbidden',
  'Not Found',
  'Method Not Allowed',
  'Conflict',
  'Internal Server Error',
]);

/** Ambil pesan yang bisa dibaca manusia dari respons gagal. */
export function messageFromResponse(status, data) {
  if (data && typeof data === 'object') {
    const raw = data.error || data.message;
    if (typeof raw === 'string' && raw.trim() && !GENERIC_REASONS.has(raw.trim())) {
      return raw.trim();
    }
  }
  if (typeof data === 'string') {
    const text = data.trim();
    if (text && text.length < 200 && !text.startsWith('<')) return text;
  }
  switch (status) {
    case 400:
      return 'Data yang dikirim belum benar. Periksa lagi isian formulirnya.';
    case 401:
      return 'Sesi kamu sudah berakhir. Silakan masuk lagi.';
    case 403:
      return 'Akses ditolak. Coba keluar lalu masuk lagi.';
    case 404:
      return 'Data atau alamat API tidak ditemukan.';
    case 409:
      return 'Data ini bentrok dengan data yang sudah ada.';
    default:
      return status >= 500
        ? 'Terjadi kesalahan di server. Coba lagi, atau cek log backend.'
        : `Permintaan gagal (kode ${status}).`;
  }
}

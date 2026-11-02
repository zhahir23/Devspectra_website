// Aturan password yang sama untuk akun baru dan untuk atur ulang password.

const MIN_LENGTH = 8;
// BCrypt (dipakai backend) hanya membaca 72 byte pertama, jadi sisanya tidak berguna.
const MAX_BYTES = 72;

export const PASSWORD_HINT = 'Minimal 8 karakter.';

/** Kembalikan pesan kesalahan, atau null kalau password sudah memenuhi aturan. */
export function passwordProblem(password, emptyMessage = 'Password wajib diisi.') {
  if (!password) return emptyMessage;
  if (password.length < MIN_LENGTH) return `Password minimal ${MIN_LENGTH} karakter.`;
  if (new TextEncoder().encode(password).length > MAX_BYTES) return 'Password terlalu panjang. Maksimal 72 karakter.';
  // Spasi di ujung tidak terlihat saat password dikirim lewat chat, jadi mudah salah ketik.
  if (password.trim() !== password) return 'Hapus spasi di awal atau akhir password.';
  return null;
}

// Tanpa karakter yang mirip satu sama lain (0 O o, 1 l I), supaya mudah dibaca dan diketik ulang.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

function randomChar() {
  // Nilai acak di atas batas ini dibuang, supaya setiap karakter punya peluang yang sama.
  const limit = 256 - (256 % ALPHABET.length);
  const byte = new Uint8Array(1);
  do {
    crypto.getRandomValues(byte);
  } while (byte[0] >= limit);
  return ALPHABET[byte[0] % ALPHABET.length];
}

/** Password acak 12 karakter yang dikelompokkan per 4, misalnya "Kp7m-Qx4t-Rz9w". */
export function randomPassword() {
  for (;;) {
    const chars = Array.from({ length: 12 }, randomChar).join('');
    if (/[A-Z]/.test(chars) && /[a-z]/.test(chars) && /\d/.test(chars)) {
      return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8)}`;
    }
  }
}

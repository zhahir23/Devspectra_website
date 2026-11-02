// Siapa boleh melihat dan melakukan apa.
// PENTING: aturan di sini hanya menyembunyikan tampilan. Pengaman yang sebenarnya
// ada di backend (lihat CATATAN-BACKEND.md bagian 5 dan 7).
import { FINANCE_EMAILS } from '../config';

const normalize = (email) => String(email ?? '').trim().toLowerCase();

/** Hanya email yang tercantum di VITE_FINANCE_EMAILS yang boleh melihat keuangan. */
export function canSeeFinance(email) {
  return Boolean(email) && FINANCE_EMAILS.includes(normalize(email));
}

/**
 * Pemegang keuangan juga pengelola anggota. Hanya mereka yang melihat tombol
 * Tambah anggota dan yang bisa menghapus anggota.
 */
export const canManageMembers = canSeeFinance;

function isSameAccount(actorEmail, targetEmail) {
  return Boolean(normalize(actorEmail)) && normalize(actorEmail) === normalize(targetEmail);
}

/** Ubah data dan ganti password: pemilik akun sendiri, atau pemegang keuangan. */
export function canEditAccount(actorEmail, targetEmail) {
  return isSameAccount(actorEmail, targetEmail) || canManageMembers(actorEmail);
}

/** Hapus anggota: hanya pemegang keuangan, dan tidak untuk akunnya sendiri. */
export function canDeleteAccount(actorEmail, targetEmail) {
  return canManageMembers(actorEmail) && !isSameAccount(actorEmail, targetEmail);
}

/** Pesan penolakan. Sama persis dengan pesan backend (service/MemberAccess.java). */
export const MEMBER_RULES = {
  create: 'Hanya pemegang keuangan yang bisa menambah anggota.',
  edit: 'Kamu hanya bisa mengubah data dan password akunmu sendiri.',
  remove: 'Hanya pemegang keuangan yang bisa menghapus anggota.',
  removeSelf: 'Akun sendiri tidak bisa dihapus.',
};

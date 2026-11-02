// Pilihan untuk tab Projects dan Divisi di Konten website.
// Harus sama dengan backend (ProjectService, TeamMemberService) dan menu Projects/Divisi di website.

export const PROJECT_CATEGORIES = ['IT', 'Media'];

export const PROJECT_STATUSES = [
  { value: 'active', label: 'Aktif' },
  { value: 'archived', label: 'Arsip' },
];

export const projectStatusLabel = (value) => PROJECT_STATUSES.find((s) => s.value === value)?.label || 'Aktif';

export const DIVISIONS = ['IT', 'Media', 'Marketing'];

/** "UI/UX, Mobile, Figma" -> ["UI/UX", "Mobile", "Figma"] */
export const splitTags = (tags) =>
  String(tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

/**
 * Inisial di avatar website kalau belum ada foto. Sama dengan backend (TeamMemberService.initialsOf):
 * "Bagus Wibowo" -> "BW", "Rasya" -> "RA".
 */
export function websiteInitials(name = '') {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const text = words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[words.length - 1][0]}`;
  return text.toUpperCase();
}

/** Urutan di website: Urutan tampil kecil dulu (yang kosong di akhir), lalu yang dibuat lebih dulu. */
export const byWebsiteOrder = (a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity) || a.id - b.id;

/** Tempat anggota tim tampil di website, untuk kolom tabel. */
export function memberPlaces(member) {
  return [
    member.showOnHome !== false && 'Beranda',
    member.showInDivision !== false && 'Divisi',
    member.showInContact !== false && 'Contact',
  ].filter(Boolean);
}

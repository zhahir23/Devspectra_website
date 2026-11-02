// Pilihan ikon untuk layanan (Konten website > Layanan).
// Nama-nama ini dikenali website company di app/lib/service-icons.ts. Kalau menambah nama di sini,
// tambahkan juga di sana. Kosong = website menebak ikon dari nama layanan.

export const SERVICE_ICON_OPTIONS = [
  { value: '', label: 'Otomatis (ditebak dari nama layanan)' },
  { value: 'web', label: 'Website' },
  { value: 'mobile', label: 'Aplikasi mobile' },
  { value: 'desain', label: 'Desain' },
  { value: 'video', label: 'Video dan editing' },
  { value: 'foto', label: 'Foto' },
  { value: 'drone', label: 'Drone' },
  { value: 'cloud', label: 'Cloud dan server' },
  { value: 'tulisan', label: 'Tulisan dan dokumentasi' },
  { value: 'kode', label: 'Pemrograman' },
  { value: 'animasi', label: 'Animasi' },
  { value: 'iot', label: 'IoT' },
  { value: 'pembicara', label: 'Pembicara dan acara' },
  { value: 'umum', label: 'Umum' },
];

/** Pilihan untuk satu layanan. Nilai lama yang tidak dikenal tetap muncul supaya tidak hilang saat disimpan. */
export function serviceIconOptions(current) {
  const value = String(current || '').trim();
  if (!value || SERVICE_ICON_OPTIONS.some((o) => o.value === value)) return SERVICE_ICON_OPTIONS;
  return [...SERVICE_ICON_OPTIONS, { value, label: `${value} (tidak dikenal website, ikon ditebak otomatis)` }];
}

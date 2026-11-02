// Ikon dan warna untuk kartu layanan di beranda (app/components/ServicesSection.tsx).
//
// Di dashboard (Konten website > Layanan > "Ikon"), tim bisa memilih salah satu nama di bawah.
// Kalau dibiarkan "Otomatis" atau namanya tidak dikenal, ikon ditebak dari nama layanan.
// Daftar nama yang sama ada di dashboard: src/lib/serviceIcons.js. Kalau menambah nama di sini,
// tambahkan juga di sana.

export const SERVICE_ICON_KEYS = [
  "web",
  "mobile",
  "desain",
  "video",
  "foto",
  "drone",
  "cloud",
  "tulisan",
  "kode",
  "animasi",
  "iot",
  "pembicara",
  "umum",
] as const;

export type ServiceIconKey = (typeof SERVICE_ICON_KEYS)[number];

/** Warna latar ikon (kelas Tailwind), disamakan dengan kartu Skills di halaman Tools. */
export const SERVICE_ICON_GRADIENT: Record<ServiceIconKey, string> = {
  web: "from-blue-500 to-cyan-500",
  mobile: "from-indigo-500 to-blue-600",
  desain: "from-violet-500 to-purple-600",
  video: "from-red-500 to-rose-600",
  foto: "from-zinc-600 to-zinc-800",
  drone: "from-sky-500 to-blue-600",
  cloud: "from-emerald-500 to-teal-600",
  tulisan: "from-amber-500 to-orange-500",
  kode: "from-rose-500 to-pink-500",
  animasi: "from-fuchsia-500 to-pink-500",
  iot: "from-lime-500 to-green-600",
  pembicara: "from-orange-500 to-amber-600",
  umum: "from-blue-600 to-indigo-600",
};

// Kata kunci untuk menebak ikon dari nama layanan. Diperiksa berurutan, yang pertama cocok dipakai.
const GUESSES: [ServiceIconKey, RegExp][] = [
  ["animasi", /\b(animasi|animation|motion|3d|karakter)/],
  ["mobile", /\b(mobile|android|ios|apk)\b/],
  ["cloud", /\b(cloud|deploy|devops|server|hosting|infrastruktur)/],
  ["pembicara", /\b(speaker|pembicara|moderator|seminar|webinar|workshop|sharing)/],
  ["web", /\b(web|website|situs|landing|e-learning|toko online)/],
  ["iot", /\b(iot|arduino|sensor)\b/],
  ["drone", /\b(drone|aerial)/],
  ["video", /\b(video|editing|editor|film|reels)/],
  ["foto", /\b(foto|photo)/],
  ["desain", /\b(desain|design|ui|ux|grafis|logo|brand)/],
  ["tulisan", /\b(writer|penulis|menulis|dokumentasi|artikel|konten|copywrit)/],
  ["kode", /\b(kode|coding|joki|program|software|sistem|aplikasi)/],
];

function isKey(value: string): value is ServiceIconKey {
  return (SERVICE_ICON_KEYS as readonly string[]).includes(value);
}

/** Nama ikon untuk sebuah layanan: pilihan di dashboard kalau dikenal, kalau tidak ditebak dari namanya. */
export function serviceIconKey(icon: string | null | undefined, name: string): ServiceIconKey {
  const chosen = (icon ?? "").trim().toLowerCase();
  if (isKey(chosen)) return chosen;
  const text = name.toLowerCase();
  return GUESSES.find(([, pattern]) => pattern.test(text))?.[0] ?? "umum";
}

/**
 * Penanda kartu di beranda, supaya tiap layanan punya tautan langsung, misalnya /#web-development.
 * Aturannya sama dengan pembuat slug di dashboard (src/lib/slug.js).
 */
export function serviceAnchor(slug: string | null | undefined): string {
  return String(slug ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

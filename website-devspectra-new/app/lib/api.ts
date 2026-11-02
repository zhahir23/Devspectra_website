const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081").replace(/\/+$/, "");

// Website ini hanya untuk pengunjung. Login admin ada di dashboard admin (aplikasi terpisah
// dengan alamat sendiri), jadi di sini tidak ada login, token, atau tautan ke dashboard.

// ── Helper ────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** fetch yang memberi pesan jelas kalau server tidak bisa dihubungi. */
async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server Devspectra. Coba lagi sebentar lagi.", 0);
  }
}

/** Baca isi respons sebagai JSON tanpa error walaupun isinya kosong atau teks biasa. */
async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string" && message.trim() && message !== "Forbidden") return message;
  }
  return fallback;
}

// ── Inquiries ─────────────────────────────────────────────
// Pesan dari formulir kontak. Masuk ke menu "Klien masuk" di dashboard.
// orderId (DSP-XXXXXXXX) dipakai klien untuk mengecek pembayaran QRIS (fetchOrderStatus).
export async function createInquiry(payload: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  orderId?: string;
}) {
  const res = await safeFetch(`${BASE}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new ApiError(errorMessage(data, "Gagal mengirim pesan"), res.status);
  return data;
}

// ── Layanan ───────────────────────────────────────────────
// Dikelola di dashboard (menu Konten website > Layanan). Tampil di beranda, bagian Layanan.
export type BackendService = {
  id: number;
  title: string | null;
  name: string | null;
  slug: string | null;
  description: string | null;
  icon: string | null;
  isActive: boolean | null;
};

/**
 * Ambil layanan dari backend (dipakai di server). Disimpan 60 detik, jadi backend ditanya
 * paling banyak sekali per menit berapa pun jumlah pengunjungnya. Perubahan di dashboard
 * terlihat di website paling lama 1 menit. Kalau backend tidak bisa dihubungi, hasilnya kosong.
 */
export async function getServices(): Promise<BackendService[]> {
  try {
    const res = await fetch(`${BASE}/api/services`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000), // jangan tahan halaman kalau backend lambat
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as BackendService[]) : [];
  } catch {
    return [];
  }
}

// ── Testimonials ──────────────────────────────────────────
// Dikelola di dashboard (menu Konten website > Testimoni).
export type BackendTestimonial = {
  id: number;
  clientName: string | null;
  company: string | null;
  content: string | null;
  rating: number | null;
  isActive: boolean | null;
  fromWebsite?: boolean | null; // true = penilaian dari halaman Contact
  createdAt?: string | null;
};

/**
 * Ambil testimoni dari backend (dipakai di server), disimpan 60 detik.
 * null = backend tidak bisa dihubungi; beranda lalu memakai daftar bawaan di kode website.
 */
export async function getTestimonials(): Promise<BackendTestimonial[] | null> {
  try {
    const res = await fetch(`${BASE}/api/testimonials`, {
      next: { revalidate: 60 }, // cache 60 detik
      signal: AbortSignal.timeout(3000), // jangan tahan halaman kalau backend lambat
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as BackendTestimonial[]) : null;
  } catch {
    return null;
  }
}

/**
 * Kirim penilaian pengunjung dari halaman Contact ("Penilaian & Kritik Saran").
 * Masuk ke dashboard (Konten website > Testimoni), tempat tim bisa mengubah, menampilkan,
 * atau menyembunyikannya. Backend yang menentukan tampil atau tidaknya:
 * bintang 3-5 yang berisi ulasan langsung tampil di "Apa Kata Mereka",
 * bintang 1-2 atau tanpa ulasan disembunyikan.
 * Balasan berisi isActive: true kalau penilaian ini langsung tampil.
 */
export async function createReview(payload: { clientName: string; content: string; rating: number }) {
  const res = await safeFetch(`${BASE}/api/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new ApiError(errorMessage(data, "Penilaian belum terkirim. Coba lagi sebentar lagi."), res.status);
  return data as BackendTestimonial | null;
}

// ── Pembayaran QRIS ───────────────────────────────────────
// Status pesanan disimpan di backend. Tim menandai "Proyek selesai" di dashboard (Klien masuk) sambil
// mengisi tagihan, lalu klien yang mengecek ID pesanannya di halaman Contact melihat QRIS dan tagihannya,
// dari perangkat mana pun. Setelah uang masuk, pemegang keuangan menandai "Sudah dibayar" di dashboard
// (status "paid"), dan pemasukannya tercatat otomatis di menu Keuangan.
export type OrderStatus = {
  orderId: string;
  status: "pending" | "completed" | "paid";
  completedAt: string | null;
  billAmount: number | null; // tagihan dalam rupiah, hanya dikirim setelah proyek selesai
  paidAt: string | null;
};

/** Format ID pesanan dari formulir kontak: DSP- lalu 8 huruf besar atau angka. */
export const ORDER_ID_PATTERN = /^DSP-[A-Z0-9]{8}$/;

/** null = ID pesanan tidak ditemukan. Server tidak bisa dihubungi atau menolak = ApiError. */
export async function fetchOrderStatus(orderId: string): Promise<OrderStatus | null> {
  const res = await safeFetch(`${BASE}/api/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  const data = await readJson(res);
  if (!res.ok) throw new ApiError(errorMessage(data, "Status pesanan belum bisa dicek. Coba lagi sebentar lagi."), res.status);
  const order = data as Partial<OrderStatus> | null;
  const bill = Number(order?.billAmount);
  return {
    orderId: String(order?.orderId ?? orderId),
    status: order?.status === "paid" || order?.status === "completed" ? order.status : "pending",
    completedAt: typeof order?.completedAt === "string" ? order.completedAt : null,
    billAmount: Number.isFinite(bill) && bill > 0 ? bill : null,
    paidAt: typeof order?.paidAt === "string" ? order.paidAt : null,
  };
}

// ── Projects dan anggota tim ──────────────────────────────
// Dikelola di dashboard (Konten website > Projects dan Divisi).
export type BackendProject = {
  id: number;
  title: string | null;
  description: string | null;
  category: string | null; // "IT" atau "Media"
  status: string | null; // "active" atau "archived"
  tags: string | null; // "UI/UX, Mobile, Figma"
  imageUrl: string | null; // "/projects/braka.png" (file di website) atau "/api/media/12" (di backend)
  canvaUrl: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
};

export type BackendTeamMember = {
  id: number;
  name: string | null;
  role: string | null;
  division: string | null; // "IT", "Media", atau "Marketing"
  email: string | null;
  initials: string | null;
  photoUrl: string | null; // kosong = memakai inisial
  sortOrder: number | null;
  showOnHome: boolean | null;
  showInDivision: boolean | null;
  showInContact: boolean | null;
};

/**
 * Ambil daftar dari backend (dipakai di server), disimpan 60 detik seperti layanan.
 * null = backend tidak bisa dihubungi atau belum punya endpoint ini; halaman lalu memakai
 * daftar bawaan di kode website. Daftar kosong dari backend tetap dipakai apa adanya.
 */
async function getContentList<T>(path: string): Promise<T[] | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000), // jangan tahan halaman kalau backend lambat
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as T[]) : null;
  } catch {
    return null;
  }
}

export const getProjects = () => getContentList<BackendProject>("/api/projects");
export const getTeamMembers = () => getContentList<BackendTeamMember>("/api/team-members");

/** Anggota tim untuk komponen di browser (formulir Contact). null = backend tidak bisa dihubungi. */
export async function fetchTeamMembersInBrowser(): Promise<BackendTeamMember[] | null> {
  try {
    const res = await fetch(`${BASE}/api/team-members`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? (data as BackendTeamMember[]) : null;
  } catch {
    return null;
  }
}

/**
 * Alamat gambar untuk ditampilkan: gambar yang diunggah dari dashboard ("/api/media/12")
 * dibuka langsung dari backend; file di folder public website ("/projects/braka.png") tetap.
 */
export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/api/")) return `${BASE}${url}`;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return null;
}

/** true kalau gambar ini dibuka dari luar website (backend), jadi tidak lewat pengoptimal gambar Next.js. */
export const isExternalImage = (src: string) => /^https?:\/\//i.test(src);

/** Hanya tautan http(s) yang boleh dipasang di tombol (bukan "javascript:" dan sejenisnya). */
export function safeLink(url: string | null | undefined): string | null {
  const text = url?.trim();
  return text && /^https?:\/\/[^\s"'<>`]+$/i.test(text) ? text : null;
}

// Project di halaman Projects. Sumber utamanya dashboard admin (Konten website > Projects);
// daftar di bawah ini hanya dipakai kalau backend tidak bisa dihubungi.
// Isinya sama dengan data awal yang dimasukkan backend (WebsiteContentSeeder.java).

export type ProjectCategory = "Media" | "IT";

export type Project = {
  id: string;
  title: string;
  description: string;
  /** "/projects/braka.png" (folder public) atau alamat lengkap gambar di backend. null = belum ada gambar */
  image: string | null;
  status: "active" | "archived";
  category: ProjectCategory;
  tags: string[];
  /** Tujuan tombol "Lihat di Canva". null = tombol tidak ditampilkan */
  canvaUrl: string | null;
};

const CANVA_URL = "https://canva.link/bn3xmd31bc6rlxe";

export const projects: Project[] = [
  // ── IT ──────────────────────────────────────────────────────────────
  {
    id: "tiket-bus",
    title: "Pemesanan Tiket Bus Online",
    description: "Design aplikasi Mobile pemesanan tiket bus pada tugas Akhir kampus.",
    image: "/projects/tiket-bus.png",
    status: "archived",
    category: "IT",
    tags: ["UI/UX", "Mobile", "Figma"],
    canvaUrl: CANVA_URL,
  },
  {
    id: "braka",
    title: "BRAKA",
    description: "Design aplikasi Mobile pemesanan tiket bus (BRAKA) pada tugas Akhir kampus.",
    image: "/projects/braka.png",
    status: "archived",
    category: "IT",
    tags: ["UI/UX", "Mobile", "Figma"],
    canvaUrl: CANVA_URL,
  },
  {
    id: "xayara",
    title: "Xayara Indonesia",
    description: "Sistem fitur website layanan jasa servis AC — instalasi, perawatan, dan perbaikan berbagai AC Split, Cassette, Window, dan lainnya.",
    image: "/projects/xayara.png",
    status: "active",
    category: "IT",
    tags: ["Web Developer", "Next.js", "Full Stack"],
    canvaUrl: CANVA_URL,
  },
  {
    id: "stok-umkm",
    title: "Stok Produk UMKM",
    description: "Website UMKM stock barang — request dari mahasiswa Sistem Informasi Universitas Komputer Indonesia.",
    image: "/projects/stok-umkm.png",
    status: "archived",
    category: "IT",
    tags: ["Web Developer", "UNIKOM", "Laravel"],
    canvaUrl: CANVA_URL,
  },
  {
    id: "myanature",
    title: "Myanature",
    description: "Website pengelola limbah rumah tangga — membantu masyarakat dalam mengelola dan mendaur ulang limbah secara mandiri.",
    image: "/projects/myanature.png",
    status: "active",
    category: "IT",
    tags: ["Web Developer", "Lingkungan", "UMKM"],
    canvaUrl: CANVA_URL,
  },
  {
    id: "promosi-umkm",
    title: "Website Promosi UMKM",
    description: "Website UMKM untuk membantu mempromosikan produk dan jualannya.",
    image: "/projects/indihome-umkm.png",
    status: "active",
    category: "IT",
    tags: ["Client UMKM", "Web Developer", "Promosi"],
    canvaUrl: CANVA_URL,
  },
  {
    id: "sipka",
    title: "SIPKA",
    description: "Sistem pelaporan kepolisian atasan dan anggota dari Kepolisian Jawa Tengah.",
    image: "/projects/sipka.png",
    status: "active",
    category: "IT",
    tags: ["Android Developer", "Mobile", "Kepolisian"],
    canvaUrl: CANVA_URL,
  },
];

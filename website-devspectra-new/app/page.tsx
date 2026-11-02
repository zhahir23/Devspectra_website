import { homePageStyles as h } from "@/public/dummyStyles";
import { TypingAnimation } from "@/app/components/ui/typing-animation-demo-3";
import ClientsCarousel, { type Client } from "@/app/components/ClientsCarousel";
import TestimonialsCarousel, { type Testimonial } from "@/app/components/TestimonialsCarousel";
import TeamSection from "@/app/components/TeamSection";
import Reveal from "@/app/components/Reveal";
import ServicesSection, { toShownServices } from "@/app/components/ServicesSection";
import { getServices, getTeamMembers, getTestimonials } from "@/app/lib/api";
import { toWebsiteTeam } from "@/app/lib/website-content";

// Re-render tiap request supaya review baru langsung muncul
export const revalidate = 0;type HistoryItem = {
  name: string;
  period: string;
  description: string;
  initials: string;
  gradient: string;
  instagram?: string;
  image?: string;
};

const history: HistoryItem[] = [
  {
    name: "satu.satu Production",
    period: "2021 - 2022",
    description: "Awal perjalanan kami di dunia produksi perfilman.",
    initials: "1.1",
    gradient: "from-orange-400 to-rose-500",
    instagram: "https://www.instagram.com/satu.satu_production?stkn=eTcwZWVhdWV5aGl1",
    image: "/satu-satu.jpg",
  },
  {
    name: "M.T.S.K.M Project",
    period: "2023 - 2024",
    description: "Berkembang ke proyek-proyek kolaboratif lintas bidang perfilman.",
    initials: "MT",
    gradient: "from-violet-500 to-indigo-600",
    instagram: "https://www.instagram.com/mtskmproject?stkn=MWlhbDB5Y3d6cmRnMg==",
    image: "/mtskm.jpg",
  },
  {
    name: "Devspectra",
    period: "2025 - now",
    image: "/logo-devspectra.jpeg",
    description: "Berdiri resmi sebagai badan hukum PT Devspectra Digital Kreasi.",
    initials: "DS",
    gradient: "from-blue-500 to-cyan-400",
  },
];

// 23 client dengan logo asli
const clients: Client[] = [
  { name: "Kawah Transformasional",  image: "/clients/portofilio-devspectra-1.png" },
  { name: "VTV",                     image: "/clients/portofilio-devspectra-2.png" },
  { name: "KMK UNIKOM",              image: "/clients/portofilio-devspectra-3.png" },
  { name: "Smansa Filmaker",         image: "/clients/portofilio-devspectra-5.png" },
  { name: "Drive In",                image: "/clients/portofilio-devspectra-6.png" },
  { name: "JokiiT.com",              image: "/clients/portofilio-devspectra-7.png" },
  { name: "Ayena Studio",            image: "/clients/portofilio-devspectra-8.png" },
  { name: "Forkey",                  image: "/clients/portofilio-devspectra-9.png" },
  { name: "CK Production",           image: "/clients/portofilio-devspectra-10.png" },
  { name: "HIMATRO Universitas Bina Bangsa", image: "/clients/portofilio-devspectra-11.png" },
  { name: "Company CP",              image: "/clients/portofilio-devspectra-12.png" },
  { name: "Code Company",            image: "/clients/portofilio-devspectra-13.png" },
  { name: "InsideOut Ruang Muda",    image: "/clients/portofilio-devspectra-14.png" },
  { name: "Xayara Indonesia Group",  image: "/clients/portofilio-devspectra-15.png" },
  { name: "IndiHome by Telkomsel",   image: "/clients/portofilio-devspectra-16.png" },
  { name: "BNI",                     image: "/clients/portofilio-devspectra-17.png" },
  { name: "Google Developer Group Bandung", image: "/clients/portofilio-devspectra-18.png" },
  { name: "Polda Jawa Tengah",       image: "/clients/portofilio-devspectra-19.png" },
  { name: "Humas Polri",             image: "/clients/portofilio-devspectra-20.png" },
  { name: "PT. Mandiri Sumber Kemakmuran", image: "/clients/portofilio-devspectra-21.png" },
  { name: "Joki Tugas By Cipung",    image: "/clients/portofilio-devspectra.png" },
  { name: "Smansa Voice",            image: "/clients/img_6096-removebg-preview.png" },
];

const testimonials = [
  {
    name: "Andi Firmansyah",
    role: "CEO, StartupKita",
    avatar: "AF",
    rating: 5,
    message: "Devspectra membangun website e-commerce kami dalam waktu sangat singkat. Hasilnya luar biasa, desain bersih dan performa cepat. Sangat rekomendasikan!",
  },
  {
    name: "Siti Nurhaliza",
    role: "Marketing Manager, BrandMax",
    avatar: "SN",
    rating: 5,
    message: "Jasa editing konten mereka top banget. Video acara peluncuran produk kami jadi sangat profesional. Tim responsif dan cepat tanggap.",
  },
  {
    name: "Budi Santoso",
    role: "Founder, TechMedis",
    avatar: "BS",
    rating: 5,
    message: "Website kesehatan yang mereka buat sangat user-friendly. Pasien kami mudah menggunakan sistem booking online-nya. Tim sangat kooperatif.",
  },
  {
    name: "Rina Kusuma",
    role: "Dosen, Universitas Nusantara",
    avatar: "RK",
    rating: 4,
    message: "Platform e-learning yang dikembangkan Devspectra membantu proses belajar-mengajar kami jadi lebih efektif. Fitur lengkap dan mudah digunakan.",
  },
  {
    name: "Hendra Wijaya",
    role: "Product Manager, GoDigital",
    avatar: "HW",
    rating: 5,
    message: "Deploy aplikasi kami berjalan mulus berkat bantuan Devspectra. Setup infrastruktur mereka solid dan aman. Tidak ada downtime sama sekali.",
  },
  {
    name: "Maya Putri",
    role: "Creative Director, PixelHouse",
    avatar: "MP",
    rating: 5,
    message: "Logo dan identitas brand kami sekarang jauh lebih modern. Devspectra paham visi kami dan eksekusinya tepat sasaran. Hasil memuaskan!",
  },
  {
    name: "Doni Prasetyo",
    role: "Owner, CafeMocha",
    avatar: "DP",
    rating: 4,
    message: "Lanyard dan PDH untuk event kami hasilnya bagus sekali. Proses cepat, komunikasi lancar, harga bersahabat. Pasti balik lagi!",
  },
  {
    name: "Laila Amani",
    role: "HRD, KerjaBersama",
    avatar: "LA",
    rating: 5,
    message: "Tim Devspectra sangat profesional dan deadline-conscious. Sistem HR online kami selesai tepat waktu dan sesuai spesifikasi yang kami minta.",
  },
  {
    name: "Reza Adhitama",
    role: "CTO, CloudNine",
    avatar: "RA",
    rating: 5,
    message: "Kolaborasi yang menyenangkan. Devspectra tidak hanya coding tapi juga memberikan saran teknis yang sangat berguna. Kode yang dihasilkan bersih dan terdokumentasi.",
  },
  {
    name: "Fitri Handayani",
    role: "Event Organizer, FestivalIn",
    avatar: "FH",
    rating: 5,
    message: "Editing video dokumentasi festival kami hasilnya sinematik banget! Devspectra benar-benar mengerti storytelling visual. Klien dan sponsor kami sangat terkesan.",
  },
];

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AN";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

// Testimoni dari dashboard admin (menu Konten website > Testimoni) yang berstatus Tampil,
// termasuk penilaian dari halaman Contact (bintang 3-5 berisi ulasan otomatis Tampil).
// Kalau backend tidak bisa dihubungi, daftar `testimonials` di atas yang ditampilkan.
// Kalau semuanya disembunyikan di dashboard, bagian "Apa Kata Mereka" tidak tampil.
async function getShownTestimonials(): Promise<Testimonial[]> {
  const rows = await getTestimonials();
  if (rows === null) return testimonials;
  return rows
    .filter((t) => t.isActive !== false && t.content?.trim())
    .map((t) => {
      const name = t.clientName?.trim() || "Anonim";
      return {
        name,
        role: t.company?.trim() || "Client",
        message: (t.content ?? "").trim(),
        rating: Math.min(5, Math.max(1, Math.round(Number(t.rating) || 5))),
        avatar: initialsOf(name),
      };
    });
}

export default async function Home() {
  // Testimoni, layanan, dan anggota tim dari dashboard, diambil bersamaan.
  const [shownTestimonials, services, teamRows] = await Promise.all([
    getShownTestimonials(),
    getServices(),
    getTeamMembers(),
  ]);
  const shownServices = toShownServices(services);
  // Anggota tim dari dashboard (Konten website > Divisi). undefined = daftar bawaan di data/team.ts
  const team = teamRows ? toWebsiteTeam(teamRows) : undefined;

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-6 pt-20 pb-24 md:p-16 md:pt-16 md:pb-16 transition-colors duration-300">
      {/* Background grid + gradient */}
      <div className={`${h.backgroundGrid.wrapper} ${h.backgroundGrid.pattern}`} />
      <div className={h.gradientOverlay} />

      <section className="relative z-10 mx-auto w-full max-w-4xl">
        {/* Biodata / Intro */}
        <Reveal as="h1" className="mb-4 text-[26px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 dark:text-zinc-100 [overflow-wrap:anywhere] sm:text-[38px] md:text-[52px] lg:text-[60px]">
          Hallo semuanya, perkenalkan kami{" "}
          <span className="mt-1 inline-block rounded-md bg-zinc-900 dark:bg-zinc-100 px-2 align-middle text-zinc-100 dark:text-zinc-900">
            <TypingAnimation
              words={["Devspectra"]}
              loop={true}
              showCursor={true}
              pauseDelay={1500}
              typeSpeed={100}
              deleteSpeed={60}
              className="leading-none"
            />
          </span>
        </Reveal>

        <Reveal as="p" delay={120} className="max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300 sm:text-base sm:leading-8">
          Devspectra berdiri pada tahun 2025 sampai sekarang, bertempat di
          Antapani, Bandung, Jawa Barat. Kami melayani jasa media dan teknologi
          seperti pembuatan website (E-Learning, Kesehatan, dll), design, dan
          joki per-kodingan. Selain itu, kami juga membuka jasa editing untuk
          acara-acara, serta membuka usaha di bidang IoT dan Deploy. Kami juga
          open untuk <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">speaker atau moderator sharing session</strong> seputar
          dunia IT maupun media.
        </Reveal>

        {/* Berbadan Hukum Badge */}
        <Reveal delay={200} className="mt-6">
          <a
            href="/berbadan-hukum.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-2xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-900/20 px-5 py-3 transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/30 hover:-translate-y-0.5"
          >
            {/* Shield Check Icon */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-300/40 dark:shadow-emerald-900/40 transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} aria-hidden="true" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  ✓ Berbadan Hukum Resmi
                </span>
                <span className="rounded-full bg-emerald-200 dark:bg-emerald-800/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Verified
                </span>
              </div>
              <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400/70">
                AHU-A127434.AH.01.30 · Kemenkumham RI · 1 Oktober 2026
              </p>
            </div>

            {/* Arrow icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-emerald-500 dark:text-emerald-400 transition-transform duration-200 group-hover:translate-x-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </Reveal>

        {/* Layanan (dari dashboard: Konten website > Layanan) */}
        <ServicesSection services={shownServices} />

        {/* Sejarah */}
        <div className="mt-14 md:mt-20">
          <Reveal as="h2" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl md:text-3xl">Sejarah</Reveal>
          <Reveal as="p" delay={100} className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">Perjalanan kami dari waktu ke waktu.</Reveal>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {history.map((item, i) => (
              <Reveal
                key={item.name}
                as="article"
                variant="scale"
                delay={i * 120}
                className="group overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-900/70 hover:shadow-lg"
              >
                {/* Logo area */}
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-zinc-100/60 dark:bg-zinc-800/40 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg shadow-zinc-300/30 dark:shadow-black/40 transition-transform duration-300 group-hover:scale-110`}>
                      <span className="text-2xl font-black text-white tracking-tight">{item.initials}</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{item.name}</h3>
                    {item.instagram && (
                      <a
                        href={item.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Instagram ${item.name}`}
                        className="flex-shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-500"
                      >
                        {/* Instagram icon */}
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                  <span className="mt-1 inline-block rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {item.period}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Lokasi / Google Maps */}
        <div className="mt-14 md:mt-20">
          <Reveal as="h2" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl md:text-3xl">
            Lokasi Kami
          </Reveal>
          <Reveal as="p" delay={100} className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Antapani, Bandung, Jawa Barat — datang langsung atau hubungi kami dulu.
          </Reveal>

          <Reveal variant="scale" delay={150} className="mt-6 group/map overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-zinc-200/30 dark:shadow-black/30 transition-all duration-500 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/30">
            {/* Map container */}
            <div className="relative w-full overflow-hidden" style={{ paddingBottom: "50%" }}>
              {/* Overlay shimmer saat hover */}
              <div className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover/map:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent" />
              <iframe
                title="Lokasi Devspectra Digital Kreasi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126.72!2d107.6575036!3d-6.9077399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e7f29c8586e1%3A0x7c70e1729a8fe7f3!2sRumah%20Kita%20Kost!5e0!3m2!1sid!2sid!4v1696000000000"
                className="absolute inset-0 h-full w-full border-0 transition-transform duration-700 group-hover/map:scale-[1.02]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Info bar di bawah map */}
            <div className="flex flex-col gap-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-5 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors duration-300 group-hover/map:bg-blue-50/80 dark:group-hover/map:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-md transition-transform duration-300 group-hover/map:scale-110 group-hover/map:shadow-blue-400/40">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white" aria-hidden="true">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.043-4.803 3.043-7.653C19.333 6.953 16.022 4 12 4S4.667 6.953 4.667 11.674c0 2.85 1.1 5.574 3.043 7.653a19.58 19.58 0 002.685 2.282 16.975 16.975 0 001.144.742zM12 13.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors group-hover/map:text-blue-700 dark:group-hover/map:text-blue-400">Devspectra Digital Kreasi</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Antapani, Kota Bandung, Jawa Barat</p>
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/gzFpUSrrdYhjHndH9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 transition-transform duration-300 group-hover/map:translate-x-0.5" aria-hidden="true">
                  <path d="M15.5 5H11L6.5 12H10l-2 7 9.5-9.5H14l1.5-4.5z" />
                </svg>
                Buka di Google Maps
              </a>
            </div>
          </Reveal>
        </div>

        {/* Tim Kami */}
        <TeamSection className="mt-14 md:mt-20" team={team} />

        {/* Clients */}
        <div className="mt-14 md:mt-20">
          <Reveal as="h2" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl md:text-3xl">
            Client yang sudah percaya kami
          </Reveal>
          <Reveal as="p" delay={100} className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Lebih dari 23 client telah bekerja sama dengan Devspectra.
          </Reveal>

          <Reveal variant="fade" delay={150}>
            <ClientsCarousel clients={clients} />
          </Reveal>
        </div>

        {/* Testimoni (dari dashboard: Konten website > Testimoni) */}
        {shownTestimonials.length > 0 && (
          <div className="mt-14 md:mt-20">
            <Reveal as="h2" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl md:text-3xl">
              Apa Kata Mereka
            </Reveal>
            <Reveal as="p" delay={100} className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
              Testimoni dari client yang sudah bekerja sama dengan Devspectra.
            </Reveal>
            <Reveal variant="fade" delay={150}>
              <TestimonialsCarousel testimonials={shownTestimonials} />
            </Reveal>
          </div>
        )}
      </section>
    </div>
  );
}

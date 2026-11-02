// MODE DEMO: backend tiruan di dalam browser, aktif kalau VITE_DEMO_MODE=true.
// Bentuk datanya sama dengan backend Spring Boot (dan rancangan API baru di
// CATATAN-BACKEND.md), jadi file ini juga bisa dipakai sebagai contoh respons.
// Data kembali seperti semula setiap kali halaman dimuat ulang.
import { canManageMembers, canSeeFinance, MEMBER_RULES } from '../auth/permissions';
import { passwordProblem } from '../lib/password';
import { splitTags, websiteInitials } from '../lib/websiteContent';
import { ApiError } from './errors';
import { storage, tokenEmail } from './storage';

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isoDateTime = (d) => `${isoDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

function daysAgo(days, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}
const hoursAgo = (h) => new Date(Date.now() - h * 3_600_000);
const secondsAgo = (s) => new Date(Date.now() - s * 1000);

function monthDay(monthsBack, day) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1, 10, 0, 0);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const limit = monthsBack === 0 ? now.getDate() : lastDay;
  d.setDate(Math.min(day, limit));
  return d;
}

/** Gambar contoh untuk project di mode demo: gradasi warna dengan judul project. */
function demoArt(title, hue) {
  const words = String(title).split(' ');
  const lines = [words.slice(0, 3).join(' '), words.slice(3).join(' ')].filter(Boolean);
  const text = lines
    .map((line, i) => `<text x="64" y="${300 + i * 64}" font-family="sans-serif" font-size="52" font-weight="700" fill="#fff">${line}</text>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 46%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 70% 30%)"/></linearGradient></defs><rect width="960" height="600" fill="url(#g)"/><circle cx="820" cy="120" r="150" fill="#fff" fill-opacity="0.12"/>${text}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

let db = null;
let nextId = 1000;
const newId = () => ++nextId;

function seed() {
  const created = isoDateTime(daysAgo(120));
  const users = [
    [1, 'Raka Pratama', 'raka@devspectra.com', 'Backend Developer', 'Engineering'],
    [2, 'Nadia Putri', 'nadia@devspectra.com', 'UI/UX Designer', 'Design'],
    [3, 'Fajar Nugroho', 'fajar@devspectra.com', 'Frontend Developer', 'Engineering'],
    [4, 'Intan Maharani', 'intan@devspectra.com', 'Project Manager', 'Manajemen'],
    [5, 'Bima Saputra', 'bima@devspectra.com', 'Mobile Developer', 'Engineering'],
    [6, 'Citra Anggraini', 'citra@devspectra.com', 'Content Creator', 'Marketing'],
    [7, 'Dimas Ardiansyah', 'dimas@devspectra.com', 'Backend Developer', 'Engineering'],
    [8, 'Laras Wulandari', 'laras@devspectra.com', 'QA Tester', 'Engineering'],
  ].map(([id, name, email, role, division]) => ({ id, name, email, role, division, createdAt: created, updatedAt: created }));

  // Absensi bulan ini, hari kerja sebelum hari ini.
  const attendances = [];
  const now = new Date();
  for (let day = 1; day < now.getDate(); day += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    users.forEach((u) => {
      const roll = (u.id * 31 + day * 17) % 23;
      let status = 'HADIR';
      if (roll === 0) status = 'IZIN';
      else if (roll === 1) status = 'SAKIT';
      else if (roll === 2 && u.id === 7) status = 'ALPA';
      const row = { id: newId(), userId: u.id, workDate: isoDate(date), status, note: null, checkInAt: null, checkOutAt: null };
      if (status === 'HADIR') {
        const inMin = 470 + ((u.id * 13 + day * 7) % 70);
        const outMin = 1020 + ((u.id * 11 + day * 5) % 60);
        const cin = new Date(date); cin.setHours(0, inMin, 0, 0);
        const cout = new Date(date); cout.setHours(0, outMin, 0, 0);
        row.checkInAt = isoDateTime(cin);
        row.checkOutAt = isoDateTime(cout);
      }
      if (status === 'IZIN') row.note = 'Keperluan keluarga';
      if (status === 'SAKIT') row.note = 'Demam';
      attendances.push(row);
    });
  }
  // Hari ini
  const today = isoDate(now);
  const todayAt = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return isoDateTime(d); };
  [
    [1, 'HADIR', todayAt(8, 5), null, null],
    [2, 'HADIR', todayAt(8, 20), null, null],
    [3, 'HADIR', todayAt(8, 47), null, null],
    [4, 'HADIR', todayAt(7, 58), null, null],
    [5, 'IZIN', null, null, 'Ujian di kampus'],
    [6, 'HADIR', todayAt(9, 10), null, null],
    [8, 'HADIR', todayAt(8, 30), todayAt(12, 15), 'Pulang lebih awal'],
  ].forEach(([userId, status, checkInAt, checkOutAt, note]) => {
    attendances.push({ id: newId(), userId, workDate: today, status, checkInAt, checkOutAt, note });
  });

  // Status memakai kata yang sama dengan database asli: unread, read, replied.
  const inquiries = [
    ['Dina Ayu', 'dina.ayu@contoh.co.id', '+62 812 0000 0001', 'Website untuk kedai kopi', 'Halo DevSpectra, kami punya kedai kopi kecil di Bandung dan ingin dibuatkan website yang menampilkan menu, lokasi, dan tombol pesan lewat WhatsApp. Kira-kira berapa lama pengerjaannya dan berapa biayanya?\n\n---\nID Pesanan: DSP-7KQ2M9XA\nJasa: Web\nJadwal Pertemuan: Senin, 26 Oktober 2026', 'unread', hoursAgo(2), null],
    ['Sari Lestari', 'sari.lestari@contoh.co.id', '+62 812 0000 0002', 'Sistem reservasi kelas yoga', 'Kami studio yoga dengan 3 instruktur. Kami butuh sistem supaya peserta bisa memesan kelas dan membayar dari HP.\n\n---\nID Pesanan: DSP-R4T8WZ2C\nJasa: Mobile', 'unread', hoursAgo(5), null],
    ['Hendra Wijaya', 'hendra.w@contoh.co.id', '0812 0000 0003', 'Aplikasi kasir untuk toko', 'Toko kami punya 2 cabang. Apakah bisa dibuatkan aplikasi kasir yang stoknya tersambung antar cabang?', 'read', daysAgo(1, 19, 45), 3],
    ['Rina Marlina', 'rina.marlina@contoh.co.id', '0812 0000 0004', 'Redesign aplikasi koperasi', 'Aplikasi koperasi kami sudah ada, tapi anggota sering bingung memakainya. Kami ingin tampilannya diperbaiki.', 'read', daysAgo(2, 9, 30), 2],
    ['Teguh Prasetyo', 'teguh.p@contoh.co.id', '0812 0000 0005', 'Perawatan website sekolah', 'Website sekolah kami sering lambat. Apakah DevSpectra menerima kontrak perawatan bulanan?', 'read', daysAgo(3, 14, 20), 7],
    ['Yoga Firmansyah', 'yoga.f@contoh.co.id', '0812 0000 0006', 'Landing page lomba lari', 'Kami butuh landing page untuk pendaftaran lomba lari 10K bulan depan.\n\n---\nID Pesanan: DSP-L4R1K10X\nJasa: Web', 'replied', daysAgo(5, 11, 5), 4],
    ['Maya Sari', 'maya.sari@contoh.co.id', '0812 0000 0007', 'Company profile perusahaan logistik', 'Kami perusahaan logistik dan ingin punya website company profile yang profesional.', 'replied', daysAgo(7, 15, 40), 1],
    ['Andi Kurniawan', 'andi.k@contoh.co.id', '0812 0000 0008', 'Toko online batik', 'Saya ingin membuat toko online untuk produk batik tulis.\n\n---\nID Pesanan: DSP-B4T1K7OK\nJasa: Web', 'replied', daysAgo(12, 10, 10), 6],
    ['Lestari Wulan', 'lestari.w@contoh.co.id', '0812 0000 0009', 'Desain ulang logo', 'Kami ingin memperbarui logo dan warna brand usaha katering kami.', 'replied', daysAgo(18, 13, 0), 2],
    ['Bayu Ramadhan', 'bayu.r@contoh.co.id', '0812 0000 0010', 'Aplikasi absensi sekolah', 'Sekolah kami butuh aplikasi absensi siswa berbasis QR code.', 'replied', daysAgo(25, 8, 45), 3],
  ].map(([name, email, phone, subject, message, status, at, assignedTo]) => {
    const orderId = /ID Pesanan:\s*(DSP-[A-Z0-9]{8})/.exec(message)?.[1] ?? null;
    // Contoh pembayaran QRIS:
    // - landing page lomba lari: proyek selesai, klien sudah melihat QRIS dan tagihan, menunggu pembayaran
    // - toko online batik: sudah dibayar, pemasukannya tercatat di Keuangan (lihat qrisIncome di bawah)
    const qris = {
      'DSP-L4R1K10X': { projectCompletedAt: isoDateTime(daysAgo(1, 16, 0)), billAmount: 3_500_000, paidAt: null },
      'DSP-B4T1K7OK': { projectCompletedAt: isoDateTime(daysAgo(6, 15, 0)), billAmount: 4_000_000, paidAt: isoDateTime(daysAgo(5, 11, 30)) },
    }[orderId] || { projectCompletedAt: null, billAmount: null, paidAt: null };
    return { id: newId(), name, email, phone, subject, message, status, createdAt: isoDateTime(at), assignedTo, orderId, ...qris, incomeId: null };
  });

  const incomeRows = [
    [0, 3, 'DP website pemesanan tur', 'PT Arunika Travel', 'PROYEK', 5_000_000, 4],
    [0, 8, 'Pelunasan website company profile', 'Maya Sari', 'PROYEK', 3_500_000, 4],
    [0, 12, 'Perawatan bulanan website', 'Klinik Sehat Sentosa', 'PERAWATAN', 1_500_000, 1],
    [0, 15, 'Termin 2 aplikasi inventaris', 'Toko Buku Pelita', 'PROYEK', 6_000_000, 4],
    [0, 16, 'Desain feed Instagram', 'Batik Sekar', 'PROYEK', 2_500_000, 4],
    [1, 5, 'Pelunasan website company profile', 'CV Sinar Logistik', 'PROYEK', 9_000_000, 4],
    [1, 12, 'Perawatan bulanan website', 'Klinik Sehat Sentosa', 'PERAWATAN', 1_500_000, 1],
    [1, 20, 'DP toko online', 'Batik Sekar', 'PROYEK', 6_000_000, 4],
    [2, 4, 'Termin 1 aplikasi inventaris', 'Toko Buku Pelita', 'PROYEK', 6_000_000, 4],
    [2, 12, 'Perawatan bulanan website', 'Klinik Sehat Sentosa', 'PERAWATAN', 1_500_000, 1],
    [2, 22, 'Website sekolah', 'SMA Harapan Bangsa', 'PROYEK', 7_500_000, 4],
    [3, 12, 'Perawatan bulanan website', 'Klinik Sehat Sentosa', 'PERAWATAN', 1_500_000, 1],
    [3, 18, 'Desain logo dan brand kit', 'Kedai Rasa', 'PROYEK', 3_300_000, 4],
    [3, 25, 'Landing page promo', 'Batik Sekar', 'PROYEK', 5_000_000, 4],
    [4, 6, 'Pelunasan aplikasi reservasi', 'Klinik Sehat Sentosa', 'PROYEK', 10_200_000, 4],
    [4, 20, 'Redesign website', 'Koperasi Maju Bersama', 'PROYEK', 4_000_000, 4],
    [5, 10, 'DP aplikasi reservasi', 'Klinik Sehat Sentosa', 'PROYEK', 7_000_000, 4],
    [5, 21, 'Website katalog produk', 'Batik Sekar', 'PROYEK', 5_000_000, 4],
    [6, 9, 'Website profil desa', 'Desa Sukamaju', 'PROYEK', 6_500_000, 4],
    [6, 23, 'Konsultasi IT', 'CV Sinar Logistik', 'LAINNYA', 4_000_000, 1],
    [7, 14, 'Aplikasi pemesanan katering', 'Dapur Bunda', 'PROYEK', 11_000_000, 4],
    [8, 11, 'Website portofolio', 'Studio Foto Lensa', 'PROYEK', 5_000_000, 4],
    [8, 26, 'Perbaikan bug aplikasi', 'Koperasi Maju Bersama', 'LAINNYA', 4_000_000, 1],
    [9, 15, 'Landing page produk', 'Kedai Rasa', 'PROYEK', 8_500_000, 4],
  ];
  const nameOf = (id) => users.find((u) => u.id === id)?.name || null;
  const incomes = incomeRows.map(([back, day, description, clientName, category, amount, recordedBy]) => ({
    id: newId(), receivedOn: isoDate(monthDay(back, day)), description, clientName, category, amount, recordedBy, recordedByName: nameOf(recordedBy), orderId: null,
  }));
  // Pemasukan yang tercatat otomatis saat pembayaran QRIS dikonfirmasi di Klien masuk
  inquiries.filter((q) => q.paidAt).forEach((q) => {
    const income = {
      id: newId(), receivedOn: q.paidAt.slice(0, 10), description: qrisIncomeDescription(q), clientName: q.name, category: 'PROYEK',
      amount: q.billAmount, recordedBy: 1, recordedByName: nameOf(1), orderId: q.orderId,
    };
    incomes.push(income);
    q.incomeId = income.id;
  });

  // Ikon memakai nama yang dikenali website (src/lib/serviceIcons.js); kosong = ditebak dari nama layanan
  const services = [
    ['Pembuatan website', 'Website company profile, toko online, dan landing page yang cepat dan mudah dikelola.', 'web', true],
    ['Aplikasi mobile', 'Aplikasi Android dan iOS untuk usaha, dari rancangan sampai rilis di Play Store dan App Store.', 'mobile', true],
    ['Desain UI/UX', 'Riset pengguna, wireframe, dan desain tampilan aplikasi yang nyaman dipakai.', 'desain', true],
    ['Sistem informasi bisnis', 'Sistem kasir, inventaris, reservasi, dan administrasi sesuai alur kerja usaha kamu.', 'kode', true],
    ['Perawatan website', 'Pembaruan rutin, cadangan data, dan pemantauan keamanan setiap bulan.', '', true],
    ['Konsultasi IT', 'Bantuan memilih teknologi dan merencanakan proyek digital.', 'umum', false],
  ].map(([title, description, icon, isActive]) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    return { id: newId(), title, name: title, slug, description, icon, iconClass: null, isActive, createdAt: created, updatedAt: created };
  });

  const testimonials = [
    ['Rudi Hartono', 'Klinik Sehat Sentosa', 'Sistem reservasinya membuat antrean pasien jauh lebih rapi. Timnya responsif saat ada kendala.', 5, true],
    ['Sinta Dewi', 'Batik Sekar', 'Penjualan online kami naik setelah toko onlinenya jadi. Tampilannya cantik dan mudah dipakai.', 5, true],
    ['Agung Wibisono', 'Toko Buku Pelita', 'Aplikasi inventarisnya membantu kami tahu stok di dua cabang tanpa harus menelepon.', 4, true],
    ['Fitri Handayani', 'Kedai Rasa', 'Logo dan brand kit-nya sesuai karakter usaha kami.', 4, false],
  ].map(([clientName, company, content, rating, isActive]) => ({
    id: newId(), clientName, company, content, rating, isActive, fromWebsite: false, createdAt: created, updatedAt: created,
  }));
  // Penilaian pengunjung dari halaman Contact website: bintang 1-2, atau tanpa ulasan, otomatis disembunyikan
  testimonials.push(
    { id: newId(), clientName: 'Anonim', company: null, content: 'Respons awalnya agak lama.', rating: 2, isActive: false, fromWebsite: true, createdAt: isoDateTime(hoursAgo(20)), updatedAt: isoDateTime(hoursAgo(20)) },
    { id: newId(), clientName: 'Bayu Saputra', company: null, content: null, rating: 4, isActive: false, fromWebsite: true, createdAt: isoDateTime(hoursAgo(9)), updatedAt: isoDateTime(hoursAgo(9)) },
    { id: newId(), clientName: 'Putri Amelia', company: null, content: 'Websitenya rapi dan cepat jadi. Terima kasih!', rating: 5, isActive: true, fromWebsite: true, createdAt: isoDateTime(hoursAgo(3)), updatedAt: isoDateTime(hoursAgo(3)) },
  );

  // Konten website > Projects. Gambar contoh dibuat langsung di sini (di backend asli: /api/media/{id}
  // atau file di folder public website, misalnya /projects/braka.png).
  const projects = [
    ['Toko Online Batik Sekar', 'Toko online dengan katalog, keranjang, dan pembayaran transfer untuk usaha batik.', 'IT', 'active', 'Web Developer, Next.js, UMKM', 248],
    ['Sistem Antrean Klinik Sehat', 'Pendaftaran pasien dan nomor antrean yang bisa dipantau dari HP.', 'IT', 'active', 'Web Developer, Laravel, Kesehatan', 200],
    ['Aplikasi Inventaris Toko Buku Pelita', 'Stok buku di dua cabang dalam satu aplikasi Android.', 'IT', 'archived', 'Android Developer, Mobile', 162],
    ['Video Profil Kedai Rasa', 'Video profil 90 detik untuk media sosial, dari naskah sampai penyuntingan.', 'Media', 'active', 'Videografer, Editing', 22],
    ['Foto Produk Batik Sekar', 'Foto katalog 40 produk dengan latar studio.', 'Media', 'archived', 'Fotografer, Desain', 318],
  ].map(([title, description, category, status, tags, hue], i) => ({
    id: newId(), title, description, category, status, tags, imageUrl: demoArt(title, hue),
    canvaUrl: 'https://www.canva.com/', sortOrder: i + 1, isActive: i !== 4, createdAt: created, updatedAt: created,
  }));

  // Konten website > Divisi: anggota tim yang tampil di website (terpisah dari akun di menu Anggota)
  const teamMembers = [
    ['Intan Maharani', 'Project Manager', 'IT', 'intan@devspectra.com', true, false, true],
    ['Raka Pratama', 'Backend Developer', 'IT', 'raka@devspectra.com', true, true, true],
    ['Fajar Nugroho', 'Frontend Developer', 'IT', 'fajar@devspectra.com', true, true, true],
    ['Nadia Putri', 'UI/UX Designer', 'Media', 'nadia@devspectra.com', true, true, true],
    ['Citra Anggraini', 'Content Creator', 'Marketing', 'citra@devspectra.com', true, true, true],
    ['Bima Saputra', 'Mobile Developer', 'IT', 'bima@devspectra.com', false, false, false],
  ].map(([name, role, division, email, showOnHome, showInDivision, showInContact], i) => ({
    id: newId(), name, role, division, email, initials: websiteInitials(name), photoUrl: null, sortOrder: i + 1,
    showOnHome, showInDivision, showInContact, createdAt: created, updatedAt: created,
  }));

  const settings = [
    { id: newId(), settingKey: 'followers_instagram', settingValue: '1284', updatedAt: isoDateTime(daysAgo(2)) },
  ];

  const announcements = [
    {
      id: newId(),
      message: 'Rapat mingguan pindah ke hari Jumat pukul 19.00 lewat Discord. Jangan lupa absen masuk sebelum pukul 09.00, ya.',
      createdBy: 4,
      createdByName: 'Intan Maharani',
      createdAt: isoDateTime(daysAgo(2, 9, 15)),
      isActive: true,
    },
  ];

  return {
    users,
    attendances,
    inquiries,
    incomes,
    services,
    testimonials,
    settings,
    announcements,
    projects,
    teamMembers,
    // anggota yang "sedang online" di data contoh, selain pengguna yang login
    onlineIds: new Set([1, 2, 3, 4, 6]),
    lastSeen: { 5: 1, 7: 26, 8: 3 }, // jam yang lalu
    heartbeats: {},
  };
}

function getDb() {
  if (!db) db = seed();
  return db;
}

/** Sama dengan OrderService.paymentDescription di backend. */
function qrisIncomeDescription(inquiry) {
  const subject = String(inquiry.subject || '').trim();
  return `Pembayaran QRIS ${inquiry.orderId}${subject ? `: ${subject}` : ''}`.slice(0, 200);
}

const MAX_AMOUNT = 9_999_999_999_999;
function checkAmount(value, emptyMessage, label) {
  if (value === undefined || value === null || value === '') fail(400, emptyMessage);
  const n = Number(value);
  if (!(n > 0)) fail(400, `${label} harus lebih dari 0.`);
  if (n > MAX_AMOUNT) fail(400, `${label} terlalu besar. Periksa lagi angkanya.`);
  return Math.round(n);
}

function fail(status, message) {
  throw new ApiError(message, status);
}

function currentUser() {
  const email = tokenEmail(storage.getToken());
  const user = getDb().users.find((u) => u.email.toLowerCase() === email);
  if (!user) fail(401, 'Sesi demo berakhir. Silakan pilih akun demo lagi.');
  return user;
}

function fakeToken(email) {
  const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const now = Math.floor(Date.now() / 1000);
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: email, iat: now, exp: now + 86_400 })}.demo`;
}

/** Daftar akun contoh untuk dipilih di layar masuk mode demo. */
export function demoAccounts() {
  return getDb().users.map(({ id, name, email, role, division }) => ({ id, name, email, role, division }));
}

/** Pengganti halaman login di mode demo: buat token contoh untuk akun yang dipilih. */
export function demoSignIn(email) {
  storage.saveToken(fakeToken(email));
}

// Sama dengan service/MemberAccess.java di backend (CATATAN-BACKEND.md bagian 7):
// tambah dan hapus anggota hanya untuk pemegang keuangan; ubah data dan password
// untuk pemilik akun sendiri atau pemegang keuangan.
function requireMemberManager(message) {
  if (!canManageMembers(currentUser().email)) fail(403, message);
}

function requireOwnerOrManager(target) {
  const me = currentUser();
  if (me.id !== target.id && !canManageMembers(me.email)) fail(403, MEMBER_RULES.edit);
}

function requireValidPassword(password) {
  const problem = passwordProblem(password);
  if (problem) fail(400, problem);
}

// Sama seperti yang diharapkan dari backend: hanya anggota keuangan yang boleh mengakses.
function financeOnly(handler) {
  return (...args) => {
    if (!canSeeFinance(currentUser().email)) fail(403, 'Kamu tidak punya akses ke data keuangan.');
    return handler(...args);
  };
}

function genericCrud(key, { required = [], prepare = (x) => x, onUpdate, onRemove } = {}) {
  return {
    list: () => getDb()[key],
    create: (body) => {
      required.forEach((field) => {
        if (!body?.[field]) fail(400, `Kolom ${field} wajib diisi.`);
      });
      const now = isoDateTime(new Date());
      const item = prepare({ ...body, id: newId(), createdAt: now, updatedAt: now });
      getDb()[key].push(item);
      return item;
    },
    update: (id, body) => {
      const list = getDb()[key];
      const index = list.findIndex((x) => x.id === id);
      if (index < 0) fail(404, 'Data tidak ditemukan.');
      const merged = onUpdate ? onUpdate(list[index], body) : { ...list[index], ...body };
      list[index] = { ...merged, id, updatedAt: isoDateTime(new Date()) };
      return list[index];
    },
    remove: (id) => {
      const list = getDb()[key];
      const index = list.findIndex((x) => x.id === id);
      if (index < 0) fail(404, 'Data tidak ditemukan.');
      onRemove?.(list[index]);
      list.splice(index, 1);
      return 'Berhasil dihapus.';
    },
  };
}

const slugOf = (text) => String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');

const services = genericCrud('services', {
  required: ['title'],
  prepare: (s) => ({ ...s, name: s.title, slug: s.slug || slugOf(s.title), isActive: s.isActive ?? true }),
  onUpdate: (old, body) => ({ ...old, ...body, name: body.title ?? old.title, slug: body.slug || old.slug }),
});
// Isi boleh kosong (penilaian dari website tanpa ulasan); yang tampil di website dicek di formulir dashboard
const testimonials = genericCrud('testimonials', { required: ['clientName'] });

// Projects dan Divisi: aturan yang sama dengan backend (ProjectService, TeamMemberService).
// Di mode demo, gambar baru (data URL) langsung dipakai sebagai alamat gambarnya.
const nextOrder = (key) => Math.max(0, ...getDb()[key].map((x) => x.sortOrder).filter((n) => n != null)) + 1;
function imageAddress(old, url, data) {
  if (data) return data;
  if (url === undefined || url === null) return old ?? null;
  return url === '' ? null : url;
}
function pickOne(value, choices, message) {
  const hit = choices.find((c) => c.toLowerCase() === String(value || '').trim().toLowerCase());
  if (!hit) fail(400, message);
  return hit;
}
function projectFrom(body, old) {
  const { imageData, ...rest } = body;
  if (!String(body.title || '').trim()) fail(400, 'Judul project wajib diisi.');
  const canvaUrl = String(body.canvaUrl || '').trim() || null;
  if (canvaUrl && !/^https?:\/\/\S+$/i.test(canvaUrl)) fail(400, 'Link Canva harus berupa alamat lengkap yang diawali https://');
  return {
    ...rest,
    title: String(body.title || '').trim(),
    category: pickOne(body.category, ['IT', 'Media'], 'Kategori harus IT atau Media.'),
    status: body.status === 'archived' ? 'archived' : 'active',
    tags: splitTags(body.tags).join(', ') || null,
    canvaUrl,
    sortOrder: body.sortOrder ?? old?.sortOrder ?? nextOrder('projects'),
    isActive: body.isActive ?? true,
    imageUrl: imageAddress(old?.imageUrl, body.imageUrl, imageData),
  };
}
function memberFrom(body, old) {
  const { photoData, ...rest } = body;
  const name = String(body.name || '').trim();
  if (!name) fail(400, 'Nama wajib diisi.');
  const email = String(body.email || '').trim().toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Format email belum benar, contoh: nama@devspectra.com');
  const initials = String(body.initials || '').trim().toUpperCase();
  if (initials.length > 3) fail(400, 'Inisial maksimal 3 huruf.');
  return {
    ...rest,
    name,
    email,
    division: pickOne(body.division, ['IT', 'Media', 'Marketing'], 'Divisi harus IT, Media, atau Marketing.'),
    initials: initials || websiteInitials(name),
    sortOrder: body.sortOrder ?? old?.sortOrder ?? nextOrder('teamMembers'),
    showOnHome: body.showOnHome ?? true,
    showInDivision: body.showInDivision ?? true,
    showInContact: body.showInContact ?? true,
    photoUrl: imageAddress(old?.photoUrl, body.photoUrl, photoData),
  };
}
const projects = genericCrud('projects', {
  required: ['title'],
  prepare: (p) => projectFrom(p, null),
  onUpdate: (old, body) => ({ ...old, ...projectFrom(body, old) }),
});
const teamMembers = genericCrud('teamMembers', {
  required: ['name'],
  prepare: (m) => memberFrom(m, null),
  onUpdate: (old, body) => ({ ...old, ...memberFrom(body, old) }),
});
const settings = genericCrud('settings', { required: ['settingKey'] });
const incomes = genericCrud('incomes', {
  required: ['receivedOn', 'description', 'amount'],
  prepare: (row) => {
    const me = currentUser();
    if (!(Number(row.amount) > 0)) fail(400, 'Jumlah harus lebih dari 0.');
    return { ...row, amount: Number(row.amount), category: row.category || 'PROYEK', recordedBy: me.id, recordedByName: me.name };
  },
  onUpdate: (old, body) => ({ ...old, ...body, amount: Number(body.amount ?? old.amount), orderId: old.orderId ?? null }),
  // Sama dengan backend: menghapus pemasukan dari QRIS membuat pesanannya kembali menunggu pembayaran
  onRemove: (income) => {
    getDb().inquiries.forEach((q) => {
      if (q.incomeId === income.id) Object.assign(q, { paidAt: null, incomeId: null });
    });
  },
});

function presenceList() {
  const { users, onlineIds, lastSeen, heartbeats } = getDb();
  return users.map((u, i) => {
    let seen;
    if (heartbeats[u.id] && Date.now() - heartbeats[u.id] < 120_000) seen = new Date(heartbeats[u.id]);
    else if (onlineIds.has(u.id)) seen = secondsAgo(10 + i * 7);
    else seen = hoursAgo(lastSeen[u.id] ?? 30);
    return { userId: u.id, lastSeenAt: isoDateTime(seen), online: Date.now() - seen.getTime() < 120_000 };
  });
}

function attendanceForDate(date) {
  const { attendances, users } = getDb();
  return attendances
    .filter((a) => a.workDate === date)
    .map((a) => ({ ...a, userName: users.find((u) => u.id === a.userId)?.name || null }));
}

function attendanceSummary(month) {
  const { attendances, users } = getDb();
  return users.map((u) => {
    const rows = attendances.filter((a) => a.userId === u.id && a.workDate.startsWith(month));
    const count = (s) => rows.filter((a) => a.status === s).length;
    return { userId: u.id, hadir: count('HADIR'), izin: count('IZIN'), sakit: count('SAKIT'), alpa: count('ALPA') };
  });
}

const routes = [
  ['GET', /^\/api\/users$/, () => getDb().users],
  ['GET', /^\/api\/users\/(\d+)$/, (m) => {
    const user = getDb().users.find((u) => u.id === Number(m[1]));
    if (!user) fail(404, `Anggota tim dengan ID ${m[1]} tidak ditemukan`);
    return user;
  }],
  ['POST', /^\/api\/users$/, (m, body) => {
    const data = getDb();
    requireMemberManager(MEMBER_RULES.create);
    requireValidPassword(body?.password);
    const email = String(body?.email || '').trim().toLowerCase();
    if (data.users.some((u) => u.email.toLowerCase() === email)) {
      fail(409, 'Email ini sudah terdaftar. Kalau anggotanya lupa password, pakai Atur ulang password.');
    }
    if (!email.endsWith('@devspectra.com')) fail(400, 'Registrasi ditolak: Email harus menggunakan domain @devspectra.com');
    const now = isoDateTime(new Date());
    const user = { id: newId(), name: body.name, email, role: body.role || '', division: body.division || '', createdAt: now, updatedAt: now };
    data.users.push(user);
    return user;
  }],
  // Sama seperti updateUser di backend: name, role, dan division selalu ditimpa,
  // password hanya diganti kalau diisi. Mode demo tidak memakai password, jadi
  // password yang lolos pemeriksaan tidak perlu disimpan.
  ['PUT', /^\/api\/users\/(\d+)$/, (m, body) => {
    const user = getDb().users.find((u) => u.id === Number(m[1]));
    // Seperti backend: anggota biasa ditolak dulu (403) sebelum tahu apakah id-nya ada
    if (!user) {
      requireMemberManager(MEMBER_RULES.edit);
      fail(404, `Anggota tim dengan ID ${m[1]} tidak ditemukan`);
    }
    requireOwnerOrManager(user);
    if (body?.password) requireValidPassword(body.password);
    Object.assign(user, { name: body.name, role: body.role, division: body.division, updatedAt: isoDateTime(new Date()) });
    return user;
  }],
  ['DELETE', /^\/api\/users\/(\d+)$/, (m) => {
    const data = getDb();
    const id = Number(m[1]);
    requireMemberManager(MEMBER_RULES.remove);
    if (currentUser().id === id) fail(400, MEMBER_RULES.removeSelf);
    const target = data.users.find((u) => u.id === id);
    if (!target) fail(404, `Anggota tim dengan ID ${id} tidak ditemukan`);
    data.users = data.users.filter((u) => u.id !== id);
    data.attendances = data.attendances.filter((a) => a.userId !== id);
    data.inquiries.forEach((q) => { if (q.assignedTo === id) q.assignedTo = null; });
    return { message: `Akun anggota tim dengan ID ${id} berhasil dihapus.` };
  }],

  ['GET', /^\/api\/inquiries$/, () => getDb().inquiries],
  ['PUT', /^\/api\/inquiries\/(\d+)\/status$/, (m, body) => {
    const item = getDb().inquiries.find((q) => q.id === Number(m[1]));
    if (!item) fail(404, `Pesan inquiry dengan ID ${m[1]} tidak ditemukan`);
    item.status = body.status;
    return item;
  }],
  ['PUT', /^\/api\/inquiries\/(\d+)\/assign$/, (m, body) => {
    const item = getDb().inquiries.find((q) => q.id === Number(m[1]));
    if (!item) fail(404, `Pesan inquiry dengan ID ${m[1]} tidak ditemukan`);
    item.assignedTo = body.userId ?? null;
    return item;
  }],
  // Sama dengan OrderService.setProjectCompleted di backend
  ['PUT', /^\/api\/inquiries\/(\d+)\/project$/, (m, body) => {
    const item = getDb().inquiries.find((q) => q.id === Number(m[1]));
    if (!item) fail(404, 'Pesan inquiry tidak ditemukan.');
    if (!item.orderId) fail(400, 'Pesan ini tidak punya ID pesanan (DSP-...), jadi QRIS tidak bisa ditampilkan untuk klien.');
    if (item.paidAt) {
      fail(400, 'Pembayaran pesanan ini sudah tercatat, jadi tagihan dan status proyeknya tidak bisa diubah. Pemegang keuangan bisa membatalkan pembayarannya dulu.');
    }
    if (!body?.completed) {
      item.projectCompletedAt = null;
      return item;
    }
    item.billAmount = checkAmount(body.billAmount, 'Isi tagihan proyek dulu (dalam rupiah).', 'Tagihan');
    item.projectCompletedAt = item.projectCompletedAt || isoDateTime(new Date());
    return item;
  }],
  // Sama dengan OrderService.setPayment di backend: khusus pemegang keuangan
  ['PUT', /^\/api\/inquiries\/(\d+)\/payment$/, financeOnly((m, body) => {
    const data = getDb();
    const item = data.inquiries.find((q) => q.id === Number(m[1]));
    if (!item) fail(404, 'Pesan inquiry tidak ditemukan.');
    if (!body?.paid) {
      data.incomes = data.incomes.filter((i) => i.id !== item.incomeId);
      Object.assign(item, { paidAt: null, incomeId: null });
      return item;
    }
    if (item.paidAt) fail(409, 'Pembayaran pesanan ini sudah tercatat di Keuangan.');
    if (!item.projectCompletedAt) fail(400, 'Tandai proyek selesai dulu (sekaligus mengisi tagihan), baru catat pembayarannya.');
    const amount = checkAmount(body.amount ?? item.billAmount, 'Isi jumlah yang diterima (dalam rupiah).', 'Jumlah');
    const today = isoDate(new Date());
    const receivedOn = body.receivedOn || today;
    if (receivedOn > today) fail(400, 'Tanggal diterima tidak boleh setelah hari ini.');
    const me = currentUser();
    const income = {
      id: newId(), receivedOn, description: qrisIncomeDescription(item), clientName: item.name || null, category: 'PROYEK',
      amount, recordedBy: me.id, recordedByName: me.name, orderId: item.orderId,
    };
    data.incomes.push(income);
    Object.assign(item, { paidAt: isoDateTime(new Date()), incomeId: income.id });
    return item;
  })],
  ['DELETE', /^\/api\/inquiries\/(\d+)$/, (m) => {
    const data = getDb();
    data.inquiries = data.inquiries.filter((q) => q.id !== Number(m[1]));
    return { message: 'Pesan inquiry berhasil dihapus.' };
  }],

  ...[['services', services], ['testimonials', testimonials], ['settings', settings], ['incomes', incomes],
    ['projects', projects], ['team-members', teamMembers]]
    .flatMap(([name, handler]) => {
      const guard = name === 'incomes' ? financeOnly : (fn) => fn;
      return [
        ['GET', new RegExp(`^/api/${name}$`), guard(() => handler.list())],
        ['POST', new RegExp(`^/api/${name}$`), guard((m, body) => handler.create(body))],
        ['PUT', new RegExp(`^/api/${name}/(\\d+)$`), guard((m, body) => handler.update(Number(m[1]), body))],
        ['DELETE', new RegExp(`^/api/${name}/(\\d+)$`), guard((m) => handler.remove(Number(m[1])))],
      ];
    }),

  ['GET', /^\/api\/attendance\/summary$/, (m, body, params) => attendanceSummary(params.get('month') || isoDate(new Date()).slice(0, 7))],
  ['GET', /^\/api\/attendance$/, (m, body, params) => attendanceForDate(params.get('date') || isoDate(new Date()))],
  ['POST', /^\/api\/attendance\/check-in$/, () => {
    const me = currentUser();
    const today = isoDate(new Date());
    const data = getDb();
    const existing = data.attendances.find((a) => a.userId === me.id && a.workDate === today);
    if (existing?.checkInAt) fail(409, 'Kamu sudah absen masuk hari ini.');
    if (existing) {
      Object.assign(existing, { status: 'HADIR', checkInAt: isoDateTime(new Date()) });
      return existing;
    }
    const row = { id: newId(), userId: me.id, workDate: today, status: 'HADIR', checkInAt: isoDateTime(new Date()), checkOutAt: null, note: null };
    data.attendances.push(row);
    return row;
  }],
  ['POST', /^\/api\/attendance\/check-out$/, () => {
    const me = currentUser();
    const today = isoDate(new Date());
    const row = getDb().attendances.find((a) => a.userId === me.id && a.workDate === today);
    if (!row?.checkInAt) fail(409, 'Kamu belum absen masuk hari ini.');
    if (row.checkOutAt) fail(409, 'Kamu sudah absen pulang hari ini.');
    row.checkOutAt = isoDateTime(new Date());
    return row;
  }],
  ['POST', /^\/api\/attendance$/, (m, body) => {
    const data = getDb();
    if (!body?.userId || !body?.workDate) fail(400, 'userId dan workDate wajib diisi.');
    if (body.userId !== currentUser().id) fail(403, 'Kamu hanya bisa mengubah absensi milikmu sendiri.');
    let row = data.attendances.find((a) => a.userId === body.userId && a.workDate === body.workDate);
    if (!row) {
      row = { id: newId(), userId: body.userId, workDate: body.workDate };
      data.attendances.push(row);
    }
    Object.assign(row, { status: body.status || 'HADIR', note: body.note || null, checkInAt: body.checkInAt || null, checkOutAt: body.checkOutAt || null });
    return row;
  }],
  ['PUT', /^\/api\/attendance\/(\d+)$/, (m, body) => {
    const row = getDb().attendances.find((a) => a.id === Number(m[1]));
    if (!row) fail(404, 'Data absensi tidak ditemukan.');
    if (row.userId !== currentUser().id) fail(403, 'Kamu hanya bisa mengubah absensi milikmu sendiri.');
    Object.assign(row, { status: body.status, note: body.note || null, checkInAt: body.checkInAt || null, checkOutAt: body.checkOutAt || null });
    return row;
  }],

  ['GET', /^\/api\/presence$/, () => presenceList()],
  ['POST', /^\/api\/presence\/heartbeat$/, () => {
    const me = currentUser();
    getDb().heartbeats[me.id] = Date.now();
    return null;
  }],

  ['GET', /^\/api\/announcements\/latest$/, () => {
    const active = getDb().announcements.filter((a) => a.isActive);
    return active.length ? active[active.length - 1] : null;
  }],
  ['POST', /^\/api\/announcements$/, (m, body) => {
    const me = currentUser();
    if (!String(body?.message || '').trim()) fail(400, 'Isi pengumuman tidak boleh kosong.');
    const data = getDb();
    data.announcements.forEach((a) => { a.isActive = false; });
    const item = { id: newId(), message: body.message.trim(), createdBy: me.id, createdByName: me.name, createdAt: isoDateTime(new Date()), isActive: true };
    data.announcements.push(item);
    return item;
  }],
];

export async function mockRequest(method, path, body) {
  await wait(180 + Math.random() * 220);
  const [pathname, search = ''] = path.split('?');
  const params = new URLSearchParams(search);
  if (!storage.getToken()) fail(401, 'Silakan pilih akun demo dulu.');
  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const match = pathname.match(pattern);
    if (match) return clone(handler(match, clone(body), params));
  }
  return fail(404, 'Alamat API tidak ditemukan (mode demo).');
}

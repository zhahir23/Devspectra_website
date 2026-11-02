## Sambungan ke backend dan dashboard admin

Website ini memakai backend Spring Boot (`backend-website-company`) yang sama dengan dashboard admin (`devspectra-admin`).

Website ini hanya untuk pengunjung: **tidak ada login admin, halaman admin, atau tautan ke dashboard**. Anggota tim login di dashboard admin, yang punya alamat sendiri (saat dicoba di laptop: `http://localhost:5173`). Semua yang diubah di dashboard tetap tampil di website.

| Bagian website | Tersambung ke |
|---|---|
| Formulir kontak (`/contact`) | Pesan masuk ke menu **Klien masuk** di dashboard, lengkap dengan ID pesanan, jasa, anggota, dan jadwal. Email notifikasi tetap dikirim. |
| Pembayaran QRIS (`/contact`, bagian bawah) | Klien memasukkan ID pesanan, lalu website menanyakan statusnya ke backend (`GET /api/orders/{id}`). Setelah tim menekan **Tandai proyek selesai** di dashboard (**Klien masuk**, buka pesannya) dan mengisi tagihan, klien melihat QRIS beserta **Total pembayaran**. Setelah pemegang keuangan menekan **Sudah dibayar**, klien melihat bahwa pembayarannya sudah diterima (QRIS tidak tampil lagi), dan pemasukannya tercatat otomatis di menu Keuangan dashboard. Statusnya disimpan di backend, jadi bisa dicek dari HP atau laptop mana pun. |
| Testimoni di beranda ("Apa Kata Mereka") | Diambil dari dashboard (**Konten website > Testimoni**, yang berstatus Tampil). Kalau semua disembunyikan, bagian ini tidak muncul. Kalau backend tidak bisa dihubungi, daftar bawaan di `app/page.tsx` yang tampil. |
| Bagian **Layanan** di beranda (di bawah perkenalan) | Diambil dari dashboard (**Konten website > Layanan**, yang dicentang "Tampilkan di website"), urutannya sama dengan di dashboard. Kalau belum ada yang tampil, bagian ini tidak muncul. Tiap layanan punya tautan langsung `/#slug`. Ikon dipilih di dashboard atau ditebak dari nama layanan (`app/lib/service-icons.ts`). |
| Penilaian & Kritik Saran (`/contact`) | Masuk ke dashboard (**Konten website > Testimoni**, keterangan "Penilaian dari website"). Bintang 3 sampai 5 yang berisi ulasan langsung tampil di "Apa Kata Mereka"; bintang 1 dan 2, atau tanpa ulasan, disembunyikan. Tim bisa mengubah, menampilkan, menyembunyikan, atau menghapusnya. Penilaian tidak lagi disimpan di browser pengunjung. |
| `/projects` | Diambil dari dashboard (**Konten website > Projects**): gambar, judul, kategori IT/Media, status (label hijau atau abu-abu), deskripsi, tag, link Canva, dan urutan. Gambar yang diunggah dari dashboard dibuka langsung dari backend (`/api/media/{id}`); gambar lama tetap di `public/projects/`. |
| `/divisi`, bagian "Tim Kami" (beranda dan About), pilihan "Anggota Tim" di `/contact` | Diambil dari dashboard (**Konten website > Divisi**). Tiap anggota bisa diatur tampil di beranda, di halaman Divisi, dan di pilihan Contact. Foto opsional; tanpa foto, avatar memakai inisial. |

Testimoni, layanan, project, dan anggota tim disimpan 60 detik di server website, jadi backend ditanya paling banyak sekali per menit berapa pun jumlah pengunjungnya. Perubahan di dashboard terlihat di website paling lama 1 menit.

Kalau backend tidak bisa dihubungi (atau belum diperbarui), halaman Projects dan anggota tim memakai daftar bawaan di `data/projects.ts` dan `data/team.ts`. Isinya sama dengan data awal yang dimasukkan backend ke database saat pertama kali dinyalakan.

### Pengaturan

Salin `.env.example` menjadi `.env.local`, lalu isi:

| Variabel | Isi |
|---|---|
| `NEXT_PUBLIC_API_URL` | Alamat backend, misalnya `http://localhost:8081` |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `GMAIL_TO` | Untuk email notifikasi formulir kontak. Rahasia, jangan di-commit |

`NEXT_PUBLIC_DASHBOARD_URL` tidak dipakai lagi dan boleh dihapus dari `.env.local`.

### Logo dan ikon tab

Semua dibuat dari logo asli `public/logo-devspectra.jpeg` (1080x1080), dan sama dengan yang dipakai dashboard admin:

| File | Dipakai di |
|---|---|
| `public/logo-devspectra-emblem.webp` | Avatar bulat di sidebar. Emblem dipotong rapat dan tepat di tengah supaya tetap jelas di ukuran kecil |
| `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` | Ikon tab browser dan ikon di layar utama HP. Next.js memasangnya otomatis, tidak perlu ditulis di `layout.tsx` |
| `public/logo-devspectra.jpeg` | Logo utuh di kartu Sejarah di beranda |

Tombol bulat "N" (Next.js Dev Tools) di pojok kiri bawah saat `npm run dev` dimatikan lewat `devIndicators: false` di `next.config.ts`. Tombol itu memang tidak pernah tampil di website online.

### Tulisan pembuka dan klik logo

- **"Welcome"** tampil untuk pengunjung yang belum pernah membuka situs ini, **"Welcome Back"** untuk yang sudah pernah. Tandanya disimpan di browser pengunjung.
- Tampil sekali per tab. Refresh atau pindah halaman di tab yang sama tidak memunculkannya lagi. Aturannya ada di `app/lib/welcome-intro.ts`.
- **Klik logo** di sidebar pindah ke Home tanpa memuat ulang halaman, seperti mengeklik menu Home. Kalau sudah di Home, halaman hanya kembali ke atas.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

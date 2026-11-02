# Dashboard Admin DevSpectra

Dashboard internal untuk anggota tim DevSpectra: ringkasan (pengumuman, statistik, status online), anggota, absensi, klien masuk (termasuk tanda proyek selesai untuk QRIS), keuangan, dan konten website (layanan, testimoni, projects, dan divisi).

Dibuat dengan React + Vite. Terhubung ke backend Spring Boot `backend-website-company` lewat API dan token JWT.

```
Anggota tim:  Dashboard (halaman masuk sendiri)  ->  token JWT  ->  API Spring Boot  ->  PostgreSQL di Neon
Pengunjung:   Website company (tanpa login)      ->  API Spring Boot (data publik saja)
```

- **Login ada di dashboard ini**, di alamatnya sendiri (saat dicoba di laptop: `http://localhost:5173`). Website company tidak punya tombol atau halaman login, jadi klien tidak tahu letak dashboard. Simpan alamat dashboard sebagai bookmark (lihat bagian "Masuk ke dashboard").
- **Akun anggota baru dibuat pemegang keuangan** lewat tombol **Tambah anggota** di halaman Anggota. Setelah itu anggota bisa login di dashboard.
- **Lupa password?** Pemegang keuangan mengatur ulang password anggota di halaman Anggota (ikon kunci). Setiap anggota juga bisa mengganti password-nya sendiri di sana.
- Dashboard **tidak** tersambung langsung ke database, jadi password database tidak pernah ada di kode ini.
- **Dua pemegang keuangan** (email di `VITE_FINANCE_EMAILS`) adalah satu-satunya yang bisa membuka Keuangan serta menambah dan menghapus anggota. Anggota lain hanya bisa mengubah data dan password akunnya sendiri.

---

## Isi folder

| Folder / file | Isi |
|---|---|
| `src/pages/` | Satu file per halaman (Ringkasan, Anggota, Absensi, Klien, Keuangan, Konten) dan halaman masuk (`SignInGate.jsx`) |
| `src/components/` | Bagian tampilan yang dipakai berulang (menu, tabel, dialog, grafik, dll.) |
| `src/api/endpoints.js` | **Semua alamat API.** Kalau backend mengganti alamat, ubah di sini saja |
| `src/data/` | Data yang dipakai bersama semua halaman (lihat bagian "Kecepatan pindah menu") |
| `src/auth/` | Sesi login (token JWT), dan aturan siapa boleh membuka keuangan dan mengelola anggota |
| `src/api/mock.js` | Backend tiruan untuk mode demo |
| `src/styles.css` | Semua gaya tampilan. Warna mode terang di `:root` paling atas, warna mode gelap tepat di bawahnya |
| `public/` | Logo DevSpectra dan ikon tab browser |
| `database/devspectra-fitur-baru.sql` | SQL tabel baru (absensi, status online, keuangan, pengumuman) |
| `CATATAN-BACKEND.md` | Perbaikan keamanan, API baru, cara kerja login, sambungan dengan website, dan aturan akses keuangan |

---

## Cara menjalankan

Yang dibutuhkan: **Node.js versi 22 LTS** (atau minimal 20.19). Unduh dari nodejs.org, lalu buka terminal di folder ini.

### 1. Pasang dependensi (sekali saja)

```bash
npm install
```

### 2. Coba dulu dengan mode demo (tanpa backend)

```bash
npm run demo
```

Buka http://localhost:5173, lalu pilih salah satu akun contoh. **Raka Pratama** dan **Intan Maharani** adalah pemegang keuangan: mereka bisa membuka Keuangan serta menambah dan menghapus anggota. Akun lain hanya bisa mengubah data dan password-nya sendiri. Pakai tombol **Keluar** untuk berganti akun. Data di mode demo hanya contoh dan kembali seperti semula saat halaman dimuat ulang.

### 3. Sambungkan ke backend sungguhan

1. Jalankan backend Spring Boot (di `application.properties`, port-nya `8081`).
2. Salin `.env.example` menjadi `.env`, lalu isi:

   | Variabel | Isi |
   |---|---|
   | `VITE_API_URL` | Alamat backend, misalnya `http://localhost:8081` |
   | `VITE_WEBSITE_URL` | Alamat website company, misalnya `http://localhost:3000`. Hanya untuk menampilkan gambar project lama yang masih ada di folder public website |
   | `VITE_TOKEN_KEY` | Nama kunci token di localStorage (bawaannya `token`) |
   | `VITE_FINANCE_EMAILS` | **Email dua pemegang keuangan**, dipisah koma. Hanya mereka yang bisa membuka Keuangan dan mengelola anggota |
   | `VITE_DEMO_MODE` | `false` |

3. Jalankan:
   ```bash
   npm run dev
   ```

> File `.env` tidak ikut di-commit (sudah ada di `.gitignore`). Isinya ikut terkirim ke browser, jadi jangan pernah menaruh password database atau kunci JWT di sana.

---

## Masuk ke dashboard

Login ada di dashboard ini sendiri, tidak di website company:

1. Buka alamat dashboard (saat dicoba di laptop: `http://localhost:5173`; versi online: alamat tempat dashboard diunggah). Simpan sebagai bookmark.
2. Masukkan email `@devspectra.com` dan password, lalu klik **Masuk**. Halaman yang tadi dibuka langsung tampil.
3. **Keluar** di menu samping mengembalikan ke halaman masuk.

- Kalau email atau password salah, pesannya selalu "Email atau password salah.", supaya orang luar tidak bisa menebak email mana yang terdaftar.
- **Lupa password?** di halaman masuk menjelaskan cara meminta pemegang keuangan mengatur ulang password.
- Sesi berlaku sampai token login habis (paling lama 24 jam), lalu dashboard meminta masuk lagi.
- Website company tidak lagi punya tombol Login Admin, tombol Dashboard, halaman `/login`, dan halaman `/admin`. Semua yang diubah di dashboard (Klien masuk, Layanan, Testimoni, Projects, Divisi) tetap tampil di website. Rinciannya ada di `CATATAN-BACKEND.md` bagian 4 dan 6.

### Menjalankan website dan dashboard bersamaan

Buka dua terminal:

```bash
# Terminal 1, di folder website-devspectra-new (port 3000)
npm run dev

# Terminal 2, di folder devspectra-admin (port 5173)
npm run dev
```

Di website, buat file `.env.local` dari `.env.example` (cukup `NEXT_PUBLIC_API_URL`). Di dashboard, isi `VITE_WEBSITE_URL=http://localhost:3000` di `.env`. Backend Spring Boot juga harus berjalan.

Saat `npm run dev`, halaman masuk juga punya bagian **Untuk pengembang: pakai token dari Postman** (tempel nilai `token` dari `POST http://localhost:8081/api/auth/login`). Bagian ini tidak ikut di versi online.

---

## Pembayaran QRIS dan Keuangan

QRIS di halaman Contact website adalah gambar QRIS statis GoPay Merchant, jadi sistem tidak tahu kapan klien membayar. Alurnya:

1. **Proyek selesai:** buka pesannya di **Klien masuk**, klik **Tandai proyek selesai**, lalu isi tagihan. Klien yang mengecek ID pesanannya di website melihat QRIS dan "Total pembayaran".
2. **Uang masuk di aplikasi GoPay Merchant:** pemegang keuangan membuka pesan yang sama dan klik **Sudah dibayar**. Jumlah (tagihan) dan tanggal (hari ini) sudah terisi, tinggal klik **Catat pembayaran**. Pemasukan langsung tercatat di **Keuangan** dengan tanda ID pesanannya.
3. Klien yang mengecek lagi melihat "Pembayaran sudah kami terima", dan QRIS tidak tampil lagi.

- Salah klik? Klik **Batalkan pembayaran** di pesan itu, atau hapus pemasukannya di Keuangan. Keduanya membuat pesanan kembali menunggu pembayaran.
- **Export** di Keuangan: pilih periode (bulan yang sedang dilihat, setahun, atau semua) dan format. Excel (.xlsx) untuk Microsoft Excel, lengkap dengan baris Total. CSV untuk Google Sheets atau aplikasi lain.
- **Tambah manual** untuk pembayaran di luar QRIS, misalnya DP lewat transfer atau tunai.

---

## Pemegang keuangan dan pengelolaan anggota

Dua email di `VITE_FINANCE_EMAILS` adalah **pemegang keuangan**. Mereka juga pengelola anggota.

| Fitur | Siapa yang bisa |
|---|---|
| Menu dan halaman **Keuangan**, kotak **Pemasukan** di Ringkasan | Hanya pemegang keuangan |
| Tombol **Tambah anggota** | Hanya pemegang keuangan. Anggota lain tidak melihat tombolnya |
| **Edit** data dan **ganti password** (ikon pensil dan kunci) | Pemilik akun sendiri, atau pemegang keuangan |
| **Hapus anggota** | Hanya pemegang keuangan, dan tidak untuk akunnya sendiri |

- Anggota lain hanya melihat ikon pensil dan kunci di baris namanya sendiri (bertanda **Kamu**). Kalau mereka membuka `/keuangan` langsung, yang muncul pesan "Keuangan hanya untuk anggota yang ditunjuk".
- Menyembunyikan tombol saja tidak cukup. **Backend juga menolak** (403) permintaan dari anggota lain, dengan daftar email dari environment variable `FINANCE_EMAILS` (lihat `CATATAN-BACKEND.md` bagian 5 dan 7). Isi daftar email yang sama di kedua tempat.
- Pastikan akun kedua pemegang keuangan sudah ada di halaman Anggota sebelum aturan ini dipasang. Setelah aktif, hanya mereka yang bisa menambah anggota.

---

## Atur ulang password

Untuk anggota yang lupa password. Di halaman masuk dashboard ada tombol **Lupa password?** yang meminta mereka menghubungi pemegang keuangan. Password anggota lain hanya bisa diatur ulang oleh **pemegang keuangan**.

1. Buka **Anggota**, lalu klik ikon kunci di baris anggota itu. Bisa juga lewat **Edit**, lalu **Atur ulang password**.
2. Ketik password baru, atau klik **Buat password acak**.
3. Klik **Simpan password**, lalu **Salin password** dan kirim ke anggotanya lewat pesan pribadi. Password hanya tampil sekali.

- Password lama langsung tidak bisa dipakai login. Sesi yang sedang terbuka tetap berjalan sampai token login-nya habis (paling lama 24 jam).
- Setiap anggota bisa mengganti password-nya sendiri lewat ikon kunci di baris namanya (bertanda **Kamu**). Sarankan anggota baru melakukannya setelah login pertama, supaya password-nya tidak lagi diketahui pemegang keuangan.
- Fitur ini memakai `PUT /api/users/{id}` yang sudah ada di backend. Pembatasan siapa boleh memakainya ada di `CATATAN-BACKEND.md` bagian 7.

---

## Fitur dan kesiapan backend

| Fitur | Status saat ini |
|---|---|
| Masuk dan keluar di halaman masuk dashboard (website company tidak punya login) | Jalan (`POST /api/auth/login`). Pesan "Email atau password salah." untuk semua login gagal aktif setelah kode backend digabung |
| Anggota: lihat semua anggota, ubah data dan password sendiri. Pemegang keuangan: tambah, ubah, atur ulang password, hapus | Jalan (`/api/users`). Penolakan dari server aktif setelah kode backend digabung |
| Klien masuk dari formulir kontak website, termasuk ID pesanan `DSP-...` | Jalan (`/api/inquiries`) |
| Pembayaran QRIS: **Tandai proyek selesai** sambil mengisi tagihan di detail pesan (klien melihat QRIS dan tagihannya di halaman Contact website, dari perangkat mana pun), lalu **Sudah dibayar** oleh pemegang keuangan, dan pemasukannya tercatat otomatis di Keuangan | Kode backend sudah disiapkan (`CATATAN-BACKEND.md` bagian 6.3), aktif setelah digabung ke backend |
| Konten website: layanan dan testimoni | Jalan. Di beranda website: layanan berstatus Tampil muncul di bagian Layanan (di bawah perkenalan), testimoni berstatus Tampil di bagian Apa Kata Mereka. Tiap tab menjelaskan hal ini di bawah judul tab |
| Konten website: Projects (dengan gambar dan link Canva) dan Divisi (anggota tim di website, foto opsional) | Kode backend sudah disiapkan (`CATATAN-BACKEND.md` bagian 9), aktif setelah digabung ke backend. Gambar diperkecil di browser sebelum diunggah |
| "Penilaian & Kritik Saran" dari halaman Contact website masuk ke Testimoni (keterangan "Penilaian dari website"). Bintang 3-5 berisi ulasan langsung Tampil, bintang 1-2 atau tanpa ulasan Disembunyikan | Kode backend sudah disiapkan (`CATATAN-BACKEND.md` bagian 6.1), aktif setelah digabung ke backend |
| Jumlah followers (diisi manual) | Jalan, memakai tabel `settings` |
| Statistik jumlah klien dan anggota | Jalan |
| Absensi (absen masuk/pulang, koreksi absensi sendiri, rekap bulanan) | Kode backend sudah disiapkan, aktif setelah digabung ke backend |
| Status online/offline anggota | Kode backend sudah disiapkan, aktif setelah digabung ke backend |
| Keuangan (khusus dua anggota): pemasukan dari QRIS tercatat otomatis, **Export** ke Excel (.xlsx) atau CSV, dan **Tambah manual** untuk pembayaran di luar QRIS | Kode backend sudah disiapkan, aktif setelah digabung ke backend. Export dibuat di browser, tanpa endpoint tambahan |
| Pengumuman di kartu sambutan | Kode backend sudah disiapkan, aktif setelah digabung ke backend |
| "Ditangani oleh" pada pesan klien | Kode backend sudah disiapkan, aktif setelah digabung ke backend |

Selama API-nya belum ada, halaman terkait menampilkan kotak kuning "menunggu API backend" beserta daftar endpoint yang dibutuhkan. Begitu backend menambahkannya, fitur langsung aktif tanpa mengubah kode dashboard.

---

## Kecepatan pindah menu

Data dari backend disimpan bersama untuk semua halaman (`src/data/queryCache.js`), dan daftar data yang dimuat tiap halaman ada di `src/data/queries.js`.

- **Satu data, satu permintaan.** Contohnya, daftar klien untuk angka di menu, Ringkasan, dan Klien masuk diambil sekali saja. Absensi hari ini juga sama untuk kartu "Absensi kamu" dan tabel di halaman Absensi.
- **Langsung tampil saat kembali ke halaman.** Data terakhir langsung ditampilkan. Kalau sudah lebih dari 30 detik, data diperbarui diam-diam tanpa tulisan "Memuat data".
- **Dimuat lebih dulu.** Sekitar 1,5 detik setelah dashboard terbuka, data menu utama (Ringkasan, Anggota, Absensi, Klien masuk, Keuangan) dimuat di belakang layar. Data menu Konten website dimuat saat kursor berada di atas menunya.
- Setelah menyimpan perubahan, data yang berkaitan dimuat ulang (misalnya absen masuk ikut memperbarui rekap bulanan di Anggota). Di halaman Anggota, tabel langsung berubah bersamaan dengan pemberitahuan "disimpan" atau "dihapus", lalu dicocokkan lagi dengan server. Saat keluar, semua data yang tersimpan dihapus.
- **Klik logo DevSpectra** di menu samping membuka Ringkasan tanpa memuat ulang halaman, sama seperti mengeklik menu Ringkasan. Kalau sudah di Ringkasan, halaman hanya kembali ke atas tanpa permintaan baru ke backend.
- Kalau menambah halaman baru, daftarkan datanya di `src/data/queries.js`, lalu pakai `useApi(queries.namaData())` di halamannya.

---

## Menjalankan SQL di DBeaver

1. Klik kanan koneksi Neon, pilih **SQL Editor > Open SQL script**.
2. Tempel isi `database/devspectra-fitur-baru.sql`.
3. Klik **Execute SQL Script** (Alt+X).
4. Klik kanan **Tables > Refresh**.

SQL-nya aman dijalankan lebih dari sekali dan tidak menghapus data lama.

---

## Mengubah tampilan

- **Mode terang dan gelap:** tombol bulan/matahari di samping lonceng. Pilihan disimpan di browser masing-masing anggota. Selama belum pernah memilih, dashboard mengikuti pengaturan mode gelap di laptop/HP.
- **Warna:** warna mode terang ada di bagian `:root` di `src/styles.css` (misalnya `--accent` untuk warna tombol utama). Warna mode gelap ada tepat di bawahnya, di `:root[data-theme='dark']`. Kalau mengubah satu warna, cek juga pasangannya di mode gelap.
- **Logo:** file logo ada di folder `public/`, dibuat dari logo asli 1080 px di website (`public/logo-devspectra.jpeg` di `website-devspectra-new`):
  - `logo-devspectra.webp` untuk menu samping dan layar masuk
  - `favicon.ico`, `icon-192.png`, dan `apple-touch-icon.png` untuk ikon tab browser dan ikon di layar utama HP
  - Ikon kecil memakai potongan yang lebih rapat di sekitar emblem supaya tetap jelas di ukuran 16 px.
  - Kalau logonya berganti, timpa file-file itu dengan nama yang sama, lalu muat ulang dengan Ctrl+F5.
- **Menu:** daftar menu ada di bagian `MAIN_NAV` dan `CONTENT_NAV` di `src/components/Layout.jsx`.

---

## Membuat versi online

```bash
npm run build
```

Hasilnya ada di folder `dist/` dan bisa diunggah ke Netlify, Vercel, atau hosting statis lain.

- Isi semua variabel `VITE_...` untuk versi online **sebelum** menjalankan `npm run build`.
- File `public/_redirects` (Netlify) dan `vercel.json` (Vercel) sudah disiapkan, supaya alamat seperti `/anggota` tetap bisa dibuka langsung.
- Di backend, batasi CORS hanya untuk alamat dashboard ini (lihat `CATATAN-BACKEND.md`).

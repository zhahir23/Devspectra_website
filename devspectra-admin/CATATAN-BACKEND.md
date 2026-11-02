# Catatan untuk backend (Spring Boot)

Dokumen ini untuk pengelola backend `backend-website-company` dan website company. Isinya:

1. **Perbaikan keamanan yang mendesak** (temuan saat membaca kode di GitHub).
2. **Perbaikan pada fitur yang sudah ada.**
3. **API baru yang dibutuhkan dashboard** untuk absensi, status online, keuangan, pengumuman, dan "ditangani oleh".
4. **Login di dashboard** (halaman masuk ada di dashboard; website company tidak punya login).
5. **Pembatasan akses keuangan** (hanya dua anggota).
6. **Sambungan dengan website company** (penilaian pengunjung, pembayaran QRIS, dan CORS).
7. **Pengelolaan anggota dan atur ulang password** (siapa boleh menambah, mengubah, dan menghapus anggota).
8. **Kecepatan** (yang sudah dipangkas, dan region database).
9. **Projects dan Divisi untuk website** (isi halaman Projects dan anggota tim, termasuk gambar).

Semua alamat API yang dipanggil dashboard ada di `src/api/endpoints.js`. Login ada di halaman masuk dashboard (`POST /api/auth/login`); website company tidak punya login. Akun anggota baru dibuat pemegang keuangan lewat tombol **Tambah anggota** di dashboard (`POST /api/users`, dikirim bersama token login). Password anggota diatur ulang lewat `PUT /api/users/{id}` yang sudah ada (bagian 7). Selama sebuah endpoint baru belum ada (backend membalas 404), halaman terkait menampilkan pesan "menunggu API". Begitu endpoint-nya dibuat, dashboard langsung memakainya tanpa perlu diubah.

---

## 1. Perbaikan keamanan (kerjakan dulu)

Repo-nya publik, jadi poin 1.1 dan 1.2 harus dianggap sudah bocor.

### 1.1 Password database ada di `application.properties`

Siapa pun yang membuka repo bisa masuk ke database Neon sebagai `neondb_owner`.

- Reset password `neondb_owner` di console Neon.
- Pindahkan semua rahasia ke environment variable:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
```

- Menghapus baris dari file saja tidak cukup, karena riwayat git tetap menyimpan password lama. Yang penting password-nya sudah diganti.

### 1.2 Kunci JWT tertulis di `JwtTokenProvider.java`

Dengan kunci itu, orang luar bisa membuat token sendiri untuk email `@devspectra.com` mana pun, dan `JwtAuthenticationFilter` langsung menerimanya sebagai login yang sah. Artinya mereka bisa masuk sebagai pemegang keuangan, jadi pembatasan keuangan dan pengelolaan anggota ikut tembus.

Buat kunci baru yang acak (minimal 32 karakter, misalnya hasil `openssl rand -base64 48`), simpan di `JWT_SECRET`, lalu baca dari konfigurasi:

```java
public JwtTokenProvider(@Value("${jwt.secret}") String secret) {
    this.jwtSecret = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
}
```

Setelah kunci diganti, semua token lama otomatis tidak berlaku.

### 1.3 `POST /api/users` terbuka untuk umum dan menimpa akun yang sudah ada

Sekarang `POST /api/users` boleh diakses tanpa login, dan `UserServiceImpl.createUser` **memperbarui password** kalau emailnya sudah terdaftar. Artinya siapa pun bisa "mendaftar ulang" memakai email anggota lain, mengganti password-nya, lalu login sebagai orang itu.

Akun baru sekarang hanya dibuat pemegang keuangan lewat dashboard (tab Register di website hanya berisi info "hubungi admin"), jadi endpoint ini tidak perlu terbuka.

> **Sudah diperbaiki di kode yang disiapkan** (bagian 3 dan 7):
>
> - `SecurityConfig` tidak lagi membuka `POST /api/users` untuk umum.
> - `service/MemberAccess` hanya mengizinkan pemegang keuangan menambah anggota, dan menolak email yang sudah terdaftar (409) sebelum `createUser` sempat menimpa akun lama.

### 1.4 Hash password ikut terkirim, dan login menerima hash itu

`GET /api/users/**` terbuka untuk umum dan mengembalikan entity `User` lengkap dengan field `password` (hash BCrypt). Di `AuthController`, login juga menerima `password.equals(u.getPassword())`. Gabungan keduanya membuat orang luar bisa login hanya dengan menyalin hash dari daftar user.

Celah ini membuat semua pembatasan akses (keuangan, pengelolaan anggota) bisa ditembus, karena orang bisa masuk sebagai pemegang keuangan.

> **Sudah diperbaiki di kode yang disiapkan:**
>
> - Entity `User` menyembunyikan password dari respons JSON dengan `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)`. Password tetap diterima dari permintaan (tambah anggota, ganti password).
> - `AuthController` mencocokkan hash BCrypt hanya lewat `passwordEncoder.matches(...)` (method `passwordMatches`). Akun lama yang password-nya masih tersimpan sebagai teks biasa tetap bisa login, lalu password-nya langsung diubah menjadi hash BCrypt.

Masih disarankan: jadikan `GET /api/users/**` wajib login. Kalau website publik perlu menampilkan tim, buat endpoint terpisah yang hanya mengirim nama, peran, dan divisi.

### 1.5 Perbaikan kecil lainnya

- **Pesan login:** pesan "email tidak ditemukan" dan "password salah" disamakan menjadi "Email atau password salah." supaya orang luar tidak bisa menebak email mana yang terdaftar. **Sudah diperbaiki di kode yang disiapkan** (`AuthController`). `AuthController` belum memeriksa domain `@devspectra.com` (yang memeriksa justru `AuthServiceImpl`, padahal tidak dipakai). Dashboard memeriksanya sebelum login, tapi backend sebaiknya ikut memeriksa.
- **Log debug:** `JwtAuthenticationFilter` mencetak header `Authorization` (berisi token) ke log di setiap permintaan. **Sudah dihapus di kode yang disiapkan**, sekaligus mempercepat setiap permintaan.
- **Log SQL:** `spring.jpa.show-sql=true` di `application.properties` mencetak setiap query ke konsol. Untuk pemakaian sehari-hari, ubah menjadi `false`.
- **CORS:** `setAllowedOriginPatterns(List.of("*"))` boleh untuk pengembangan. Saat sudah online, ganti dengan alamat dashboard yang sebenarnya.
- **Hak akses:** keuangan dan pengelolaan anggota sudah dibatasi (bagian 5 dan 7). Endpoint lain, misalnya konten website dan pesan klien, masih boleh diubah oleh semua anggota yang login.
- **Zona waktu:** supaya `LocalDateTime.now()` selalu WIB walaupun server berada di luar negeri, jalankan aplikasi dengan `-Duser.timezone=Asia/Jakarta`.

---

## 2. Perbaikan pada fitur yang sudah ada

| Hal | Masalah | Saran |
|---|---|---|
| Status pesan klien | Pesan baru mendapat status `'unread'` dari nilai default kolom di database (entity memakai `insertable = false`). Komentar di `InquiryController` justru menyebut `PENDING / READ / REPLIED`, jadi belum seragam. | Dashboard mengikuti database: menulis `unread`, `read`, dan `replied`, tapi tetap mengenali `PENDING`/`READ`/`REPLIED`. Sebaiknya komentar di controller disamakan. |

> **Artikel dan Halaman** sudah dihapus dari dashboard karena tidak dipakai website. Di backend, `/api/articles`, `/api/pages`, dan tabel `articles` serta `pages` tidak diubah dan datanya masih ada. Kalau tim setuju, bagian itu boleh dihapus dari backend.

---

## 3. API baru untuk dashboard

> **Kodenya sudah disiapkan** di `backend-devspectra-fitur-dashboard.patch` (isinya sama dengan zip bernama sama). Isinya entity, repository, service, dan controller untuk absensi, status online, pemasukan, pengumuman, serta "ditangani oleh", ditambah aturan pengelolaan anggota dan perbaikan login (bagian 1.3, 1.4, dan 7). Semuanya mengikuti gaya kode yang sudah ada (Lombok, `@Autowired`). Tinggal diperiksa, dicoba, lalu digabung. Pasang dengan `git apply backend-devspectra-fitur-dashboard.patch` di folder backend. Jam absensi dan status online selalu memakai WIB (`support/JakartaTime`), dan pesan error dikirim sebagai `{"error": "..."}` lewat `support/ApiExceptionHandler`.

Tabelnya sudah disiapkan di `database/devspectra-fitur-baru.sql`. Nama field JSON memakai camelCase (bawaan Jackson). Semua endpoint di bawah wajib login (token JWT). "Pengguna yang login" diambil dari email di token.

Tanggal memakai format `YYYY-MM-DD`, waktu memakai format `LocalDateTime` (`2026-10-17T08:05:00`).

### 3.1 Absensi (tabel `attendances`)

Bentuk data:

```json
{ "id": 1, "userId": 3, "workDate": "2026-10-17", "checkInAt": "2026-10-17T08:05:00",
  "checkOutAt": null, "status": "HADIR", "note": null }
```

`status`: `HADIR`, `IZIN`, `SAKIT`, `ALPA`. Anggota yang belum punya baris di tanggal itu dianggap "Belum absen".

| Endpoint | Fungsi |
|---|---|
| `GET /api/attendance?date=2026-10-17` | Semua baris absensi di tanggal itu. Balas `[]` kalau belum ada. |
| `POST /api/attendance/check-in` | Absen masuk untuk pengguna yang login. Jam diisi server. Balas 409 kalau sudah absen masuk. |
| `POST /api/attendance/check-out` | Absen pulang. Balas 409 kalau belum absen masuk atau sudah absen pulang. |
| `POST /api/attendance` | Anggota mengisi/mengoreksi absensinya **sendiri**. Body: `userId, workDate, status, note, checkInAt, checkOutAt`. Kalau baris untuk `userId + workDate` sudah ada, perbarui. `userId` milik anggota lain ditolak **403**. |
| `PUT /api/attendance/{id}` | Ubah baris milik sendiri. Body: `status, note, checkInAt, checkOutAt`. Baris milik anggota lain ditolak **403**. |
| `GET /api/attendance/summary?month=2026-10` | Rekap per anggota: `[{ "userId": 3, "hadir": 12, "izin": 1, "sakit": 0, "alpa": 0 }]`. |

### 3.2 Status online (tabel `user_presence`)

| Endpoint | Fungsi |
|---|---|
| `POST /api/presence/heartbeat` | Dikirim dashboard tiap 60 detik. Simpan `last_seen_at = sekarang` untuk pengguna yang login (insert atau update). |
| `GET /api/presence` | `[{ "userId": 3, "lastSeenAt": "2026-10-17T15:02:10", "online": true }]`. `online` = terakhir aktif kurang dari 2 menit lalu. Hitung di Java, bukan dengan `NOW()` PostgreSQL, supaya zona waktunya sama. |

### 3.3 Pemasukan (tabel `incomes`)

```json
{ "id": 7, "receivedOn": "2026-10-03", "description": "DP website pemesanan tur",
  "clientName": "PT Arunika Travel", "category": "PROYEK", "amount": 5000000,
  "recordedBy": 4, "recordedByName": "Intan Maharani", "orderId": null }
```

`category`: `PROYEK`, `PERAWATAN`, `LAINNYA`. `amount` dalam rupiah penuh. `orderId` terisi (`DSP-...`) untuk pemasukan yang tercatat otomatis dari konfirmasi pembayaran QRIS (bagian 6.3), dan kosong untuk pemasukan yang ditambahkan manual. Kolom `incomes.order_id` dibuat otomatis oleh Hibernate.

Semua endpoint pemasukan hanya untuk dua pengelola keuangan. Anggota lain harus mendapat **403** (lihat bagian 5).

| Endpoint | Fungsi |
|---|---|
| `GET /api/incomes` | Semua pemasukan. Dashboard menyaring per bulan sendiri. |
| `POST /api/incomes` | Body: `receivedOn, description, clientName, category, amount`. `recordedBy` diisi dari pengguna yang login. |
| `PUT /api/incomes/{id}` | Body sama dengan POST. |
| `DELETE /api/incomes/{id}` | Hapus. Kalau pemasukan itu dari pembayaran QRIS, pesanannya kembali "menunggu pembayaran" (QRIS tampil lagi untuk klien). |

Di dashboard, tombol utama halaman Keuangan adalah **Export** (Excel .xlsx atau CSV, dibuat di browser dari data `GET /api/incomes`, tanpa endpoint tambahan). **Tambah manual** tetap ada untuk pembayaran di luar QRIS, misalnya DP lewat transfer.

### 3.4 Pengumuman (tabel `announcements`)

| Endpoint | Fungsi |
|---|---|
| `GET /api/announcements/latest` | Pengumuman aktif terbaru: `{ "id", "message", "createdBy", "createdByName", "createdAt" }`. Kalau belum ada, balas **200 dengan body kosong**, jangan 404 (bagi dashboard, 404 artinya endpoint-nya belum dibuat). |
| `POST /api/announcements` | Body: `{ "message": "..." }`. Buat pengumuman baru dan tandai pengumuman lama tidak aktif. |

### 3.5 Klien masuk: "ditangani oleh"

- Tambahkan field di entity `Inquiry`:

```java
@Column(name = "assigned_to")
private Long assignedTo;
```

- `PUT /api/inquiries/{id}/assign` dengan body `{ "userId": 3 }` (atau `null` untuk mengosongkan). Balas data inquiry terbaru.
- Selama field `assignedTo` belum ikut terkirim di `GET /api/inquiries`, pilihan "Ditangani oleh" di dashboard terkunci dengan keterangan. Begitu field dan endpoint-nya ada, pilihan itu langsung aktif.

### 3.6 Followers

Tidak perlu endpoint baru. Dashboard menyimpan angkanya di tabel `settings` yang sudah ada, dengan `settingKey = "followers_instagram"`, lewat `GET/POST/PUT /api/settings`.

---

## 4. Login di dashboard

Login hanya ada di dashboard, di halaman masuknya sendiri. Alamat dashboard terpisah dari website company, dan website **tidak lagi punya** tombol Login Admin, tombol Dashboard, halaman `/login`, atau halaman `/admin`. Jadi klien dan orang luar tidak tahu letak dashboard. Semua yang diubah di dashboard tetap tampil di website.

| Kejadian | Yang terjadi |
|---|---|
| Dashboard dibuka tanpa token | Halaman masuk tampil di alamat yang sama (misalnya `/klien`). |
| Login | Dashboard memeriksa akhiran `@devspectra.com`, lalu memanggil `POST /api/auth/login`. Token disimpan di `localStorage` (kunci `VITE_TOKEN_KEY`, bawaannya `token`), lalu halaman yang tadi dibuka langsung tampil. |
| Email atau password salah | Backend membalas 401 dengan pesan yang sama untuk keduanya: "Email atau password salah." (bagian 1.5). Dashboard menampilkannya apa adanya. |
| Klik "Keluar" | Token dan data yang tersimpan dihapus, lalu halaman masuk tampil lagi dengan pesan "Kamu sudah keluar." |
| Token kedaluwarsa (24 jam) atau ditolak backend (401) | Token dihapus dan halaman masuk tampil dengan pesan bahwa sesi sudah berakhir. |

Catatan:

- Dashboard membaca email pemilik token dari isi token (`sub`, sesuai `JwtTokenProvider` sekarang). Nama, peran, dan divisi diambil dari `GET /api/users`.
- Dashboard masih menerima token lewat alamat `#token=<JWT>` (dipakai untuk pengujian). Token langsung dihapus dari alamat.
- "Lupa password?" di halaman masuk meminta anggota menghubungi pemegang keuangan, yang mengatur ulang password-nya di menu Anggota (bagian 7).
- Disarankan setelah online: batasi percobaan login di backend (misalnya 10 kali per menit per alamat IP), karena halaman masuk bisa dicoba siapa saja yang tahu alamatnya.

## 5. Pembatasan akses keuangan

Menu Keuangan, halaman Keuangan, dan angka pemasukan di Ringkasan hanya tampil untuk email yang tercantum di `VITE_FINANCE_EMAILS` (dua orang). Itu baru **menyembunyikan tampilan**. Siapa pun yang punya token masih bisa memanggil API secara langsung, jadi backend wajib ikut memeriksa.

Kode yang disiapkan (bagian 3) sudah memeriksanya lewat `service/FinanceAccess`. Setiap method di `IncomeService` memanggil pemeriksaan ini lebih dulu, dan email lain mendapat **403** "Kamu tidak punya akses ke data keuangan.".

Daftar emailnya dibaca dari environment variable `FINANCE_EMAILS` (dipisah koma), atau dari properti `finance.allowed-emails` kalau diisi. Isinya harus sama dengan `VITE_FINANCE_EMAILS` di dashboard. Kalau dikosongkan, tidak ada yang bisa membuka keuangan, menambah anggota, atau menghapus anggota. Daftar yang sama dipakai untuk pengelolaan anggota (bagian 7).

```powershell
# Windows, cukup sekali; buka PowerShell baru sesudahnya
[Environment]::SetEnvironmentVariable("FINANCE_EMAILS", "nama1@devspectra.com,nama2@devspectra.com", "User")
```

Kalau daftar di backend dan di dashboard tidak sama, anggota yang dashboard-nya menampilkan Keuangan akan melihat pesan "Akses keuangan ditolak oleh server".

## 6. Sambungan dengan website company

Website company (`website-devspectra-new`) memakai backend yang sama dengan dashboard:

| Bagian website | Endpoint | Muncul di dashboard |
|---|---|---|
| Formulir kontak | `POST /api/inquiries` (sudah publik) | Klien masuk. ID pesanan `DSP-...`, jasa, anggota pilihan, dan jadwal pertemuan ada di bagian bawah isi pesan, dan bisa dicari. |
| Testimoni di beranda ("Apa Kata Mereka") | `GET /api/testimonials` (sudah publik) | Konten website > Testimoni. Hanya yang berstatus Tampil. Kalau semuanya disembunyikan, bagian ini tidak tampil di website. |
| Bagian Layanan di beranda | `GET /api/services` (sudah publik) | Konten website > Layanan. Hanya yang berstatus Tampil, urutannya sama. |
| Halaman Projects | `GET /api/projects` (baru, publik, lihat bagian 9) | Konten website > Projects. |
| Halaman Divisi, "Tim Kami" di beranda dan About, pilihan anggota di Contact | `GET /api/team-members` (baru, publik, lihat bagian 9) | Konten website > Divisi. |
| "Penilaian & Kritik Saran" di halaman Contact | `POST /api/testimonials` **tanpa login** (lihat 6.1) | Konten website > Testimoni, dengan keterangan "Penilaian dari website". Bintang 3-5 yang berisi ulasan langsung Tampil. |
| Pembayaran QRIS ("Cek Status" di halaman Contact) | `orderId` di `POST /api/inquiries`, dan `GET /api/orders/{orderId}` (baru, publik, lihat 6.3) | Klien masuk > buka pesan > Pembayaran QRIS: **Tandai proyek selesai** (dengan tagihan), lalu **Sudah dibayar** (pemegang keuangan). Pemasukannya tercatat otomatis di Keuangan. |

### 6.1 Penilaian pengunjung ("Penilaian & Kritik Saran" di halaman Contact)

> **Sudah dibuat di kode yang disiapkan.**

- `SecurityConfig` membuka `POST /api/testimonials` tanpa login, di samping `POST /api/inquiries`.
- `TestimonialController`: kalau pengirimnya tidak login, datanya dibuat ulang oleh `service/VisitorReviewService`. Hanya nama (maksimal 100 karakter, kosong menjadi "Anonim"), ulasan (maksimal 1000 karakter), dan bintang (wajib 1 sampai 5) yang dipakai. Perusahaan dikosongkan, dan `isActive` kiriman pengunjung diabaikan.
- **Aturan tampil otomatis:** bintang 3 sampai 5 yang berisi ulasan langsung **Tampil** di bagian "Apa Kata Mereka". Bintang 1 dan 2, atau tanpa ulasan, **Disembunyikan**. Tim tetap bisa mengubah, menampilkan, menyembunyikan, atau menghapusnya di dashboard.
- Kolom baru `testimonials.from_website` (true untuk penilaian dari website) dibuat otomatis oleh Hibernate (`ddl-auto=update`). Kolom ini hanya bisa dibaca, tidak bisa diisi dari luar. Dashboard memakainya untuk keterangan "Penilaian dari website".
- `GET /api/testimonials` dan `GET /api/testimonials/{id}` tanpa login hanya mengembalikan testimoni yang Tampil. Dengan token (dashboard), semuanya.
- `POST` dengan token (dari dashboard) tetap seperti sebelumnya.

Website tidak lagi menyimpan penilaian di browser pengunjung. Dulu backend menolak penilaian tanpa login (403), jadi website menyimpannya di browser pengirim, lalu ikut menampilkannya di "Apa Kata Mereka", berapa pun bintangnya. Itu sebabnya ulasan bintang 1 bisa terlihat di website (hanya di browser pengirimnya) padahal tidak ada di dashboard.

Karena bintang 3-5 langsung tampil, orang bisa saja mengirim ulasan iseng. Kalau terjadi, sembunyikan atau hapus di dashboard. Kalau sering terjadi, aturannya bisa diubah di `VisitorReviewService` (misalnya semua penilaian disembunyikan dulu).

### 6.2 CORS saat online

Sekarang CORS mengizinkan semua alamat (`*`). Saat sudah online, batasi ke alamat website dan dashboard saja, misalnya:

```java
configuration.setAllowedOriginPatterns(List.of(
        "https://ALAMAT-WEBSITE",     // website company, ganti dengan domain asli
        "https://ALAMAT-DASHBOARD"    // dashboard admin
));
```

### 6.3 Pembayaran QRIS (status pesanan di backend)

> **Sudah dibuat di kode yang disiapkan.**

Sebelumnya status pesanan disimpan di browser (`app/lib/orders.ts` di website) dan ditandai selesai di halaman `/admin` website, jadi klien hanya bisa melihat QRIS di browser yang sama dengan yang dipakai admin. Sekarang:

1. Website membuat ID pesanan (`DSP-` lalu 8 huruf/angka) dan mengirimnya bersama formulir kontak di field `orderId`. ID yang sama tetap tertulis di isi pesan, email notifikasi, dan pesan WhatsApp.
2. Setelah proyek selesai, tim membuka pesan itu di dashboard (Klien masuk), menekan **Tandai proyek selesai**, dan mengisi tagihan: `PUT /api/inquiries/{id}/project` dengan body `{ "completed": true, "billAmount": 2500000 }`. Body yang sama dipakai untuk mengubah tagihan, dan `{ "completed": false }` membatalkan tanda selesai. Semua anggota yang login boleh.
3. Klien memasukkan ID pesanan di halaman Contact website ("Cek Status"): `GET /api/orders/{orderId}` (publik). Balasannya hanya `{ "orderId", "status", "completedAt", "billAmount", "paidAt" }`, tanpa nama, email, atau isi pesan. `status`: `pending`, `completed` (QRIS dan "Total pembayaran" tampil), atau `paid` (website menampilkan "Pembayaran sudah kami terima"). `billAmount` hanya dikirim setelah proyek selesai. ID yang tidak ada dibalas 404 `{ "error": "ID pesanan tidak ditemukan." }`.
4. QRIS di website **statis** (gambar QRIS GoPay Merchant), jadi backend tidak tahu kapan klien membayar atau berapa nominalnya. Setelah uang masuk di aplikasi GoPay Merchant, pemegang keuangan menekan **Sudah dibayar**: `PUT /api/inquiries/{id}/payment` dengan body `{ "paid": true, "amount": 2500000, "receivedOn": "2026-10-31" }` (`amount` kosong = tagihan, `receivedOn` kosong = hari ini). Pemasukan langsung tercatat di tabel `incomes`: keterangan "Pembayaran QRIS DSP-...: subjek pesan", nama klien, kategori Proyek, dan `order_id`. Body `{ "paid": false }` membatalkannya dan menghapus pemasukan itu.

Aturan di `OrderService`:

- `PUT .../payment` hanya untuk pemegang keuangan (`FinanceAccess`, sama seperti `/api/incomes`). Anggota lain mendapat **403**.
- Konfirmasi hanya bisa setelah proyek ditandai selesai. Konfirmasi kedua untuk pesanan yang sama ditolak (**409** "Pembayaran pesanan ini sudah tercatat di Keuangan."), jadi pemasukan tidak pernah dobel.
- Setelah dibayar, tagihan dan tanda selesai tidak bisa diubah sampai pembayarannya dibatalkan.
- Tagihan dan jumlah: lebih dari 0, paling banyak 13 digit. Tanggal diterima tidak boleh setelah hari ini (WIB).

| File | Isi |
|---|---|
| `model/Inquiry.java` | Kolom baru `order_id`, `project_completed_at`, `bill_amount`, `paid_at`, dan `income_id` (dibuat otomatis oleh Hibernate). Selain `order_id`, kolom ini tidak bisa diisi dari formulir kontak. |
| `model/Income.java` | Kolom baru `order_id` |
| `service/OrderService.java`, `controller/OrderController.java` | Status pesanan, tandai selesai dengan tagihan, konfirmasi pembayaran, dan `GET /api/orders/{orderId}` |
| `controller/InquiryController.java`, `service/InquiryServiceImpl.java` | `PUT /api/inquiries/{id}/project` dan `PUT /api/inquiries/{id}/payment`. ID pesanan diisi saat pesan masuk |
| `service/IncomeService.java`, `repository/InquiryRepository.java` | `orderId` di daftar pemasukan. Menghapus pemasukan dari QRIS membuat pesanannya kembali menunggu pembayaran |
| `security/SecurityConfig.java` | `GET /api/orders/**` dibuka untuk umum |

Catatan:

- Pesan lama yang masuk sebelum fitur ini: saat backend menyala, `OrderService` mengisi `order_id` dari tulisan "ID Pesanan: DSP-..." di isi pesan, jadi klien lama juga bisa mengecek.
- Pesan tanpa ID pesanan (misalnya dikirim lewat Postman) tidak menampilkan bagian Pembayaran QRIS di dashboard.
- ID pesanan berisi 8 huruf/angka acak (sekitar 2,8 triliun kemungkinan), jadi sulit ditebak. Yang terlihat pun hanya status dan tagihan.
- Tagihan terlihat oleh semua anggota yang membuka Klien masuk (yang menandai selesai juga yang mengisinya). Total pemasukan tetap hanya untuk pemegang keuangan.
- Supaya pemasukan tercatat **tanpa ada yang menekan tombol**, perlu payment gateway (misalnya Midtrans atau Xendit) yang membuat QRIS dengan nominal pas untuk tiap pesanan dan mengirim notifikasi ke backend saat dibayar. Itu butuh akun merchant dengan dokumen perusahaan, ada biaya per transaksi, dan backend harus sudah online.
- Kalau formulir kontak gagal tersimpan di backend tetapi email notifikasinya terkirim, pesanannya tidak ada di Klien masuk dan tidak bisa ditandai selesai. Klien tetap bisa menghubungi lewat WhatsApp dengan ID pesanannya.

## 7. Pengelolaan anggota dan atur ulang password

Pemegang keuangan (email di `FINANCE_EMAILS`, bagian 5) juga pengelola anggota.

| Endpoint | Siapa yang boleh | Yang lain mendapat |
|---|---|---|
| `POST /api/users` (tambah anggota) | Hanya pemegang keuangan | **403** "Hanya pemegang keuangan yang bisa menambah anggota." |
| `PUT /api/users/{id}` (ubah data, ganti password) | Pemilik akun sendiri, atau pemegang keuangan | **403** "Kamu hanya bisa mengubah data dan password akunmu sendiri." |
| `DELETE /api/users/{id}` (hapus anggota) | Hanya pemegang keuangan, dan tidak untuk akunnya sendiri | **403** "Hanya pemegang keuangan yang bisa menghapus anggota.", atau **400** "Akun sendiri tidak bisa dihapus." |

`GET /api/users` dan `GET /api/users/{id}` tetap terbuka seperti sekarang. Password tidak lagi ikut di responsnya (bagian 1.4).

**Sudah ada di kode yang disiapkan:**

- `service/MemberAccess` memeriksa aturan di atas, ditambah aturan password yang sama dengan dashboard (minimal 8 karakter, maksimal 72 byte, tanpa spasi di awal atau akhir) dan penolakan email ganda (**409**).
- `UserController` memanggil `memberAccess.checkCreate`, `checkUpdate`, dan `checkDelete` **sebelum** blok `try` yang sudah ada. Blok itu menangkap semua `RuntimeException` dan mengubahnya menjadi 400 atau 404, jadi kalau pemeriksaannya ditaruh di dalam, penolakan 403 tidak sampai ke dashboard.
- Pesan dikirim sebagai `{"error": "..."}` lewat `support/ApiExceptionHandler`, sama seperti respons lain, supaya dashboard bisa menampilkannya apa adanya.

Dashboard memakai aturan yang sama (`src/auth/permissions.js`): tombol Tambah anggota hanya muncul untuk pemegang keuangan, dan anggota lain hanya melihat tombol edit dan ganti password di baris akunnya sendiri.

> Setelah aturan ini aktif, hanya pemegang keuangan yang bisa menambah anggota. Pastikan akun kedua pemegang keuangan **sudah ada** sebelum memasangnya.

### 7.1 Cara dashboard mengatur ulang password

Di halaman login website ada tombol "Lupa password?" yang meminta anggota menghubungi admin. Dashboard memakai endpoint yang sudah ada:

1. `GET /api/users/{id}` untuk mengambil nama, peran, dan divisi terbaru.
2. `PUT /api/users/{id}` dengan body:

```json
{ "name": "Nadia Putri", "role": "UI/UX Designer", "division": "Design", "password": "Kp7m-Qx4t-Rz9w" }
```

Nama, peran, dan divisi ikut dikirim karena `updateUser` selalu menimpa ketiganya. Kalau tidak dikirim, datanya ikut kosong.

Yang perlu dijaga:

- Jangan hapus kemampuan `updateUser` mengganti password. Kalau nanti dibuat endpoint khusus (misalnya `PUT /api/users/{id}/password`), ubah juga fungsi `usersApi.resetPassword` di `src/api/endpoints.js`. Kalau tidak, dashboard melaporkan berhasil padahal password-nya tidak berubah.
- `WRITE_ONLY` pada password (bagian 1.4) hanya menyembunyikan password dari respons, tidak dari permintaan, jadi cara ini tetap jalan.
- Batas 72 byte: BCrypt hanya memakai 72 byte pertama dari password.

### 7.2 Sesi lama (opsional)

Token login lama tetap berlaku sampai habis (24 jam), karena `JwtAuthenticationFilter` hanya memeriksa tanda tangan token, tidak memeriksa database. Hal yang sama berlaku untuk anggota yang dihapus. Kalau password diatur ulang karena akunnya dicurigai dipakai orang lain, sebaiknya sesi lama ikut berakhir. Caranya: tambahkan kolom `password_changed_at` di tabel `users` dan isi saat password diganti. Lalu di `JwtAuthenticationFilter`, tolak token yang `iat`-nya lebih lama dari kolom itu, atau yang email-nya sudah tidak ada di tabel `users`.

## 8. Kecepatan

Yang paling menentukan lama memuat data adalah **jarak ke database**. Project Neon sekarang ada di region `us-east-2` (Ohio, Amerika Serikat). Dari Indonesia, satu kali bolak-balik ke sana sekitar 0,2 sampai 0,3 detik, dan satu permintaan API biasanya butuh 2 sampai 3 kali bolak-balik (cek koneksi, query, commit).

Yang sudah dikerjakan di kode yang disiapkan:

- `JwtAuthenticationFilter` tidak lagi mencetak 6 sampai 8 baris ke konsol di setiap permintaan.
- Method baca yang memakai beberapa query sekaligus berjalan dalam satu transaksi (`@Transactional(readOnly = true)` di rekap absensi, daftar pemasukan, dan pengumuman, serta `@Transactional` di heartbeat). Satu commit untuk semuanya, bukan satu commit per query.
- CORS memakai `setMaxAge(3600L)`, jadi browser cukup menanyakan izin CORS (permintaan `OPTIONS`) sekali per jam per alamat. Bawaan Chrome hanya mengingatnya 5 detik, sehingga hampir setiap permintaan didahului `OPTIONS`. Ini terasa saat backend sudah online.

Di dashboard, data yang sama hanya diminta sekali dan disimpan bersama untuk semua halaman, jadi pindah menu langsung tampil (lihat README dashboard, bagian "Kecepatan pindah menu").

Kalau masih terasa lambat, pindahkan database ke region Singapura (AWS `ap-southeast-1`). Region project Neon tidak bisa diganti langsung: buat project baru di region itu, pindahkan datanya (misalnya dengan `pg_dump` dan `pg_restore`), lalu ganti alamat database di konfigurasi backend.

## 9. Projects dan Divisi untuk website

Isi halaman Projects dan anggota tim di website (halaman Divisi, "Tim Kami", pilihan anggota di Contact) sekarang dikelola dari dashboard: **Konten website > Projects** dan **Konten website > Divisi**. Sebelumnya isinya tertulis langsung di kode website. Kode backend-nya sudah disiapkan:

| File | Isi |
|---|---|
| `model/Project.java`, `repository/ProjectRepository.java`, `service/ProjectService.java`, `controller/ProjectController.java` | Tabel `website_projects`, endpoint `/api/projects` |
| `model/TeamMember.java`, `repository/TeamMemberRepository.java`, `service/TeamMemberService.java`, `controller/TeamMemberController.java` | Tabel `website_team_members`, endpoint `/api/team-members` |
| `model/MediaFile.java`, `repository/MediaFileRepository.java`, `service/MediaService.java`, `controller/MediaController.java` | Tabel `website_media` (gambar project dan foto anggota), endpoint `GET /api/media/{id}` |
| `support/WebsiteContentSeeder.java` | Isi awal: 7 project dan 10 anggota tim yang sebelumnya tertulis di kode website |
| `support/InputRules.java` | Pemeriksaan isian, pesannya tampil apa adanya di dashboard |
| `security/SecurityConfig.java` | `GET /api/projects/**`, `/api/team-members/**`, dan `/api/media/**` dibuka untuk umum. Tambah, ubah, dan hapus tetap wajib login |
| `service/CurrentUserService.java` | Tambahan `isLoggedIn()` |

| Endpoint | Login | Keterangan |
|---|---|---|
| `GET /api/projects` | Tidak | Pengunjung hanya mendapat project berstatus Tampil. Dengan token login (dashboard), semua project. Urut `sort_order`, lalu yang dibuat lebih dulu. |
| `POST /api/projects`, `PUT /api/projects/{id}` | Ya | `title`, `description`, `category` (`IT`/`Media`), `status` (`active`/`archived`), `tags` (dipisah koma), `canvaUrl`, `sortOrder`, `isActive`. Gambar baru dikirim di `imageData` (data URL). `imageUrl` null artinya gambar tidak berubah. |
| `DELETE /api/projects/{id}` | Ya | Gambarnya ikut dihapus kalau tidak dipakai di tempat lain. |
| `GET /api/team-members` | Tidak | Pengunjung hanya mendapat anggota yang tampil di setidaknya satu tempat. Dengan token login, semua anggota. |
| `POST /api/team-members`, `PUT /api/team-members/{id}` | Ya | `name`, `role`, `division` (`IT`/`Media`/`Marketing`), `email`, `initials` (kosong = dibuat dari nama), `sortOrder`, `showOnHome`, `showInDivision`, `showInContact`. Foto baru di `photoData`. `photoUrl` null = foto tidak berubah, `""` = foto dihapus. |
| `DELETE /api/team-members/{id}` | Ya | Fotonya ikut dihapus. |
| `GET /api/media/{id}` | Tidak | Isi gambar (WebP, JPG, atau PNG). Gambar tidak pernah diubah (gambar pengganti selalu mendapat alamat baru), jadi browser boleh menyimpannya setahun. |

Catatan:

- **Tidak perlu SQL manual.** Tabel `website_projects`, `website_team_members`, dan `website_media` dibuat otomatis oleh Hibernate (`ddl-auto=update`) saat backend dinyalakan.
- **Isi awal hanya sekali.** Tandanya disimpan di tabel `settings` (`isi_awal_projects` dan `isi_awal_team_members`). Jangan hapus dua baris itu: kalau dihapus dan tabelnya sedang kosong, data awal dimasukkan lagi.
- **Gambar disimpan di database**, supaya tidak hilang saat backend dipindah atau dipasang ulang, dan tidak butuh layanan penyimpanan lain. Dashboard memperkecil gambar sebelum dikirim (gambar project paling besar 1600 piksel, foto 600 piksel, biasanya di bawah 300 KB). Backend tetap menolak gambar di atas 3 MB, jenis selain WebP/JPG/PNG (SVG ditolak karena bisa berisi skrip), dan file yang isinya tidak cocok dengan jenisnya.
- **Link Canva harus diawali `http://` atau `https://`**, supaya tombol "Lihat di Canva" tidak bisa dipakai menjalankan skrip (`javascript:...`). Website juga memeriksanya sendiri.
- Semua anggota yang login boleh mengubah Projects dan Divisi, sama seperti Layanan dan Testimoni.
- Daftar anggota tim ini terpisah dari tabel `users` (akun login dashboard): tidak semua akun tampil di website, dan tidak semua anggota yang tampil punya akun.

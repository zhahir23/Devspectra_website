// Tulisan pembuka "Welcome" / "Welcome Back" (tampilannya di app/components/WelcomeIntro.tsx).
//
// - Pengunjung yang belum pernah membuka situs ini melihat "Welcome", yang sudah pernah melihat "Welcome Back".
//   Tandanya disimpan di browser pengunjung (localStorage), jadi berlaku per browser/perangkat.
// - Tampil sekali per tab. Refresh, pindah halaman, atau kembali dari situs lain di tab yang sama
//   tidak memunculkannya lagi (sessionStorage). Membuka situs di tab baru memunculkannya lagi.
// - Klik logo tidak memunculkan tulisan ini (lihat app/components/LogoLink.tsx).

export const VISITED_KEY = "devspectra-visited";
export const INTRO_SHOWN_KEY = "devspectra-intro-shown";

/**
 * Dijalankan di app/layout.tsx sebelum halaman tampil. Mengisi data-intro di <html>:
 * "first" = Welcome, "back" = Welcome Back, "none" = tidak tampil. CSS di app/globals.css
 * memakai nilai ini, jadi tulisan yang benar langsung tampil tanpa berkedip.
 * Kalau penyimpanan browser diblokir, tampil "Welcome" setiap kali dibuka (seperti dulu).
 */
export const INTRO_SCRIPT = `(function(){var m="none";try{if(!sessionStorage.getItem("${INTRO_SHOWN_KEY}")){m=localStorage.getItem("${VISITED_KEY}")?"back":"first"}}catch(e){m="first"}document.documentElement.setAttribute("data-intro",m)})();`;

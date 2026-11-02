// Mode tampilan terang/gelap.
// - Pilihan disimpan di browser ini (localStorage), jadi tiap perangkat bisa berbeda.
// - Selama belum pernah memilih, dashboard mengikuti pengaturan mode gelap di perangkat.
// - index.html memasang tema sebelum halaman tampil, supaya tidak berkedip putih saat dibuka.
//   Kalau nama kunci di bawah diganti, ganti juga di index.html.

export const THEME_STORAGE_KEY = 'devspectra-theme';

const isTheme = (value) => value === 'light' || value === 'dark';

// Pilihan selama halaman ini terbuka, untuk berjaga kalau penyimpanan browser diblokir
let chosenThisVisit = null;

export function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** Tema yang pernah dipilih sendiri, atau null kalau belum pernah. */
export function savedTheme() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(value)) return value;
  } catch {
    // Penyimpanan diblokir: pakai pilihan selama halaman ini terbuka
  }
  return chosenThisVisit;
}

export function applyTheme(theme, { save = true } = {}) {
  if (!isTheme(theme)) return;
  document.documentElement.dataset.theme = theme;
  if (!save) return;
  chosenThisVisit = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Mode privat atau penyimpanan diblokir: tema tetap berganti, hanya tidak diingat
  }
}

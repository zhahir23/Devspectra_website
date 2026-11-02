/**
 * "Cara Memilih Website!" -> "cara-memilih-website"
 * Aturannya mirip dengan pembuat slug di backend (huruf kecil, hanya huruf/angka, spasi jadi "-").
 */
export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

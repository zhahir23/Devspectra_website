// Gambar untuk Konten website (gambar project, foto anggota tim).
// Gambar diperkecil di browser sebelum diunggah, supaya cepat terkirim dan database tidak cepat penuh.
import { API_URL, WEBSITE_URL } from '../config';

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const MAX_INPUT_BYTES = 20 * 1024 * 1024; // file asli dari laptop/HP
const MAX_OUTPUT_BYTES = 2.5 * 1024 * 1024; // backend menolak di atas 3 MB

/** Perkiraan ukuran isi data URL dalam byte. */
export const dataUrlBytes = (dataUrl) => Math.floor(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);

/** 210 KB, 1,4 MB */
export function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`;
}

async function loadImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, done: () => bitmap.close() };
    } catch {
      // lanjut dengan cara lama di bawah
    }
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new Error('Gambar tidak bisa dibuka. Pilih file gambar lain.');
  }
  return { source: image, width: image.naturalWidth, height: image.naturalHeight, done: () => URL.revokeObjectURL(url) };
}

/**
 * Perkecil gambar menjadi paling besar `maxSize` piksel di sisi terpanjang.
 * Hasilnya data URL WebP, atau JPG kalau browser belum bisa membuat WebP.
 * Melempar Error dengan pesan yang bisa langsung ditampilkan.
 */
export async function compressImage(file, { maxSize = 1600, quality = 0.82 } = {}) {
  if (!file) throw new Error('Belum ada gambar yang dipilih.');
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Pilih gambar PNG, JPG, atau WebP.');
  if (file.size > MAX_INPUT_BYTES) throw new Error('Gambar terlalu besar. Pilih gambar di bawah 20 MB.');

  const image = await loadImage(file);
  try {
    if (!image.width || !image.height) throw new Error('Gambar tidak bisa dibuka. Pilih file gambar lain.');
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(image.source, 0, 0, width, height);

    let type = 'image/webp';
    let dataUrl = canvas.toDataURL(type, quality);
    if (!dataUrl.startsWith('data:image/webp')) {
      // Browser tanpa WebP: JPG, dengan latar putih untuk bagian yang transparan
      type = 'image/jpeg';
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      dataUrl = canvas.toDataURL(type, quality);
    }
    for (let q = quality - 0.15; dataUrlBytes(dataUrl) > MAX_OUTPUT_BYTES && q >= 0.4; q -= 0.15) {
      dataUrl = canvas.toDataURL(type, q);
    }
    if (dataUrlBytes(dataUrl) > MAX_OUTPUT_BYTES) {
      throw new Error('Gambar masih terlalu besar setelah diperkecil. Coba gambar lain.');
    }
    return { dataUrl, width, height, bytes: dataUrlBytes(dataUrl), originalBytes: file.size };
  } finally {
    image.done();
  }
}

/**
 * Alamat gambar untuk <img>:
 * - data URL: pratinjau gambar yang baru dipilih
 * - "/api/media/12": gambar yang sudah diunggah, ada di backend
 * - "/projects/braka.png": file di folder public website company
 */
export function imageSrc(url) {
  if (!url) return null;
  if (url.startsWith('data:') || /^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/api/')) return `${API_URL}${url}`;
  if (url.startsWith('/') && !url.startsWith('//')) return `${WEBSITE_URL}${url}`;
  return null;
}

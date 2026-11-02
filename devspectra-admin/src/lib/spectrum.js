// Warna garis "spektrum" di kartu sambutan dan halaman login.
// Warnanya mengikuti posisi garis dari ungu ke jingga, bukan mewakili orang tertentu.

const STOPS = ['#c4a4fe', '#91b7fe', '#34c8fd', '#0cd1d1', '#63d18f', '#b0c352', '#e6ac3d', '#fe9975'];

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/** Warna di posisi t (0 sampai 1) sepanjang spektrum. */
export function spectrumColor(t) {
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const a = toRgb(STOPS[i]);
  const b = toRgb(STOPS[i + 1]);
  return toHex(a.map((v, k) => v + (b[k] - v) * f));
}

export function withAlpha(hex, alpha) {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Warna untuk n garis, rata dari ujung ke ujung. */
export function spectrumColors(n) {
  if (n <= 0) return [];
  if (n === 1) return [spectrumColor(0.5)];
  return Array.from({ length: n }, (_, i) => spectrumColor(i / (n - 1)));
}

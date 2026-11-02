import { formatNumber } from '../lib/format';

/**
 * Isian jumlah rupiah. Hanya angka (paling banyak 13 digit) dan ditampilkan dengan titik ribuan,
 * misalnya 2.500.000. `value` dan nilai yang dikirim ke onChange berupa teks angka tanpa titik.
 */
export default function RupiahInput({ id, value, onChange, ...rest }) {
  return (
    <input
      id={id}
      className="input"
      inputMode="numeric"
      autoComplete="off"
      value={value ? formatNumber(value) : ''}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 13))}
      {...rest}
    />
  );
}

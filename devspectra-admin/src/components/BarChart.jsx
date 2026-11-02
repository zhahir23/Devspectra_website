import { useState } from 'react';
import { formatRupiahShort } from '../lib/format';

/** Kelipatan "bagus" untuk garis bantu sumbu: 1, 2, 2.5, 5 x 10^n */
function niceStep(raw) {
  if (raw <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(raw));
  const f = raw / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

/**
 * Grafik batang satu seri (misalnya pemasukan per bulan).
 * - Arahkan kursor atau fokus keyboard ke batang untuk melihat nilainya.
 * - Hanya batang terakhir yang diberi label angka, sisanya lewat sumbu dan keterangan di atas.
 * items: [{ key, label, longLabel, value, valueText }]
 */
export default function BarChart({ items, height = 200, formatValue = (v) => String(v) }) {
  const lastIndex = items.length - 1;
  const [active, setActive] = useState(lastIndex);
  const current = items[Math.min(Math.max(active, 0), lastIndex)];

  const max = Math.max(...items.map((i) => i.value), 0);
  const step = niceStep(max / 4);
  const top = Math.max(step * 4, step);
  const ticks = [4, 3, 2, 1, 0].map((k) => k * step);

  return (
    <div className="barchart">
      <p className="barchart__readout" aria-live="polite">
        <span className="barchart__readout-label">{current?.longLabel}</span>
        <span className="barchart__readout-value">{current ? formatValue(current.value) : '-'}</span>
      </p>
      <div className="barchart__body">
        <div className="barchart__axis" aria-hidden="true" style={{ height }}>
          {ticks.map((t) => (
            <span key={t} style={{ top: `${(1 - t / top) * 100}%` }}>
              {formatRupiahShort(t, { prefix: false })}
            </span>
          ))}
        </div>
        <div className="barchart__plot-wrap">
          <div className="barchart__plot" style={{ height }} onMouseLeave={() => setActive(lastIndex)}>
            <div className="barchart__grid" aria-hidden="true">
              {ticks.map((t) => (
                <span key={t} className={t === 0 ? 'is-base' : undefined} style={{ top: `${(1 - t / top) * 100}%` }} />
              ))}
            </div>
            <div className="barchart__bars" style={{ '--cols': items.length }}>
              {items.map((item, i) => (
                <button
                  key={item.key}
                  type="button"
                  className={`barchart__col${i === active ? ' is-active' : ''}`}
                  aria-label={`${item.longLabel}, ${formatValue(item.value)}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  {i === lastIndex && item.value > 0 && (
                    <span className="barchart__tip">{formatRupiahShort(item.value, { prefix: false })}</span>
                  )}
                  <span className="barchart__bar" style={{ height: `${(item.value / top) * 100}%` }} />
                </button>
              ))}
            </div>
          </div>
          <div className="barchart__labels" aria-hidden="true" style={{ '--cols': items.length }}>
            {items.map((item) => (
              <span key={item.key}>{item.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { initials } from '../lib/format';
import { spectrumColors, withAlpha } from '../lib/spectrum';

/**
 * Garis "spektrum" tim: satu garis per anggota.
 * Garis menyala (berwarna) kalau anggota sedang online, redup kalau offline.
 * Warnanya hanya hiasan sesuai posisi; arti online/offline dibawa oleh terang-redupnya
 * dan oleh teks keterangan di bawahnya.
 */
export default function Spectrum({ members, height = 120, lineWidth = 6, allLit = false, showInitials = true }) {
  const count = Math.max(members.length, 1);
  const colors = spectrumColors(count);
  const band = `linear-gradient(90deg, ${colors
    .map((c, i) => `${c} ${(((i + 0.5) / count) * 100).toFixed(2)}%`)
    .join(', ')})`;
  const labels = showInitials && members.length <= 16;

  return (
    <div className="spectrum" aria-hidden="true" style={{ '--cols': count }}>
      <div className="spectrum__lines" style={{ height }}>
        {members.map((m, i) => {
          const lit = allLit || m.online === true;
          return (
            <div key={m.id ?? i} className="spectrum__cell">
              <span
                className="spectrum__line"
                style={{
                  width: lineWidth,
                  height,
                  background: lit ? colors[i] : undefined,
                  boxShadow: lit ? `0 0 14px ${withAlpha(colors[i], 0.55)}` : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="spectrum__band" style={{ background: band }} />
      {labels && (
        <div className="spectrum__labels">
          {members.map((m, i) => (
            <span key={m.id ?? i} className={allLit || m.online ? 'is-lit' : undefined}>
              {initials(m.name)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

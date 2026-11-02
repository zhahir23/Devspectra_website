// Komponen kecil yang dipakai di banyak halaman.
import { ArrowDown, ArrowUp, Construction, LoaderCircle, Lock, RefreshCw, TriangleAlert } from 'lucide-react';
import { initials, presenceText } from '../lib/format';

export function Avatar({ name, size = 36, tone = 'accent', online }) {
  return (
    <span className="avatar-wrap" style={{ width: size, height: size }}>
      <span
        className={`avatar avatar--${tone}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
      {typeof online === 'boolean' && (
        <span className={`presence-dot${online ? ' is-online' : ''}`} aria-hidden="true" />
      )}
    </span>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

/** "● Online" atau "○ Offline", lengkap dengan teks (tidak hanya warna). */
export function Presence({ member, compact = false }) {
  if (member.online === undefined) {
    return <span className="presence presence--unknown">Memeriksa...</span>;
  }
  if (member.online === null) {
    return <span className="presence presence--unknown">Belum tersedia</span>;
  }
  return (
    <span className={`presence${member.online ? ' is-online' : ''}`}>
      <span className="presence__dot" aria-hidden="true" />
      <span className="presence__text">
        {member.online ? 'Online' : compact ? presenceText(member) : 'Offline'}
      </span>
      {!member.online && !compact && member.lastSeenAt && (
        <span className="presence__sub">{presenceText(member)}</span>
      )}
    </span>
  );
}

export function StatGrid({ label, children }) {
  return (
    <section className="stat-grid" aria-label={label}>
      {children}
    </section>
  );
}

/** trend: "up" (hijau, naik) atau "down" (merah, turun) */
export function StatTile({ label, value, caption, trend, action }) {
  return (
    <div className="stat">
      <div className="stat__head">
        <h3 className="stat__label">{label}</h3>
        {action}
      </div>
      <p className="stat__value">{value}</p>
      {caption && (
        <p className={`stat__caption${trend ? ` is-${trend}` : ''}`}>
          {trend === 'up' && <ArrowUp size={14} strokeWidth={2.4} aria-hidden="true" />}
          {trend === 'down' && <ArrowDown size={14} strokeWidth={2.4} aria-hidden="true" />}
          <span>{caption}</span>
        </p>
      )}
    </div>
  );
}

export function Loading({ label = 'Memuat data...' }) {
  return (
    <div className="state state--loading" role="status">
      <LoaderCircle className="spin" size={20} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <TriangleAlert size={20} aria-hidden="true" />
      <div className="state__body">
        <p className="state__title">Data belum bisa dimuat</p>
        <p className="state__text">{error?.message || 'Terjadi kesalahan.'}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn btn--secondary btn--sm" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" />
          <span>Coba lagi</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="state state--empty">
      <div className="state__body">
        <p className="state__title">{title}</p>
        {children && <p className="state__text">{children}</p>}
      </div>
      {action}
    </div>
  );
}

/** Untuk fitur yang tampilannya sudah siap tapi API-nya belum dibuat di backend. */
export function FeaturePending({ title, endpoints = [] }) {
  return (
    <div className="state state--pending" role="status">
      <Construction size={20} aria-hidden="true" />
      <div className="state__body">
        <p className="state__title">{title}</p>
        <p className="state__text">
          Tampilannya sudah siap, tinggal menunggu API dari backend. Rinciannya ada di CATATAN-BACKEND.md.
        </p>
        {endpoints.length > 0 && (
          <ul className="state__list">
            {endpoints.map((e) => (
              <li key={e}>
                <code>{e}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Untuk halaman yang hanya boleh dibuka anggota tertentu (misalnya Keuangan). */
export function AccessRestricted({ title, children }) {
  return (
    <div className="state state--restricted" role="status">
      <Lock size={20} aria-hidden="true" />
      <div className="state__body">
        <p className="state__title">{title}</p>
        {children && <p className="state__text">{children}</p>}
      </div>
    </div>
  );
}

/** Grup tombol pilihan (misalnya Semua / Online / Offline). */
export function Segmented({ label, options, value, onChange }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="segmented__btn"
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__hint" id={`${htmlFor}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Atribut aria untuk input yang punya hint/error di <Field>. */
export function describedBy(id, { hint, error }) {
  if (error) return { 'aria-describedby': `${id}-error`, 'aria-invalid': true };
  if (hint) return { 'aria-describedby': `${id}-hint` };
  return {};
}

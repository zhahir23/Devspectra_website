import { LogIn } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/endpoints';
import { demoAccounts, demoSignIn } from '../api/mock';
import { storage, tokenEmail } from '../api/storage';
import { useAuth } from '../auth/AuthContext';
import { canSeeFinance } from '../auth/permissions';
import PasswordInput from '../components/PasswordInput';
import Spectrum from '../components/Spectrum';
import { Avatar, Badge } from '../components/ui';
import { ALLOWED_EMAIL_DOMAIN, DEMO_MODE } from '../config';

const DECOR = Array.from({ length: 8 }, (_, i) => ({ id: i, name: '' }));

function DemoAccounts({ onPicked }) {
  const accounts = useMemo(() => demoAccounts(), []);
  return (
    <div className="stack stack--sm">
      <div className="login__intro">
        <h1 className="login__title">Pilih akun demo</h1>
        <p className="login__lead">
          Di mode demo tidak ada halaman login. Pilih salah satu anggota contoh untuk melihat dashboard dari sisi orang itu.
        </p>
      </div>
      <ul className="account-list">
        {accounts.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              className="account-list__btn"
              onClick={() => {
                demoSignIn(a.email);
                onPicked();
              }}
            >
              <Avatar name={a.name} />
              <span className="list__main">
                <span className="list__title">{a.name}</span>
                <span className="list__sub">{a.role}</span>
              </span>
              {canSeeFinance(a.email) && <Badge tone="info">Pemegang keuangan</Badge>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Hanya muncul saat pengembangan (npm run dev): masuk dengan token hasil login dari Postman. */
function DeveloperToken({ onAccepted }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const clean = token.trim().replace(/^Bearer\s+/i, '');
    if (!tokenEmail(clean)) {
      setError('Token tidak bisa dibaca. Salin nilai "token" dari respons POST /api/auth/login.');
      return;
    }
    storage.saveToken(clean);
    if (!onAccepted()) setError('Token sudah kedaluwarsa. Login ulang di Postman, lalu salin token barunya.');
  };

  return (
    <details className="dev-token">
      <summary>Untuk pengembang: pakai token dari Postman</summary>
      <form className="form" onSubmit={submit}>
        <div className={`field${error ? ' has-error' : ''}`}>
          <label className="field__label" htmlFor="dev-token">
            Token JWT
          </label>
          <textarea
            id="dev-token"
            className="input textarea"
            rows={4}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            aria-describedby={error ? 'dev-token-error' : 'dev-token-hint'}
            aria-invalid={Boolean(error)}
          />
          {error ? (
            <p className="field__error" id="dev-token-error">
              {error}
            </p>
          ) : (
            <p className="field__hint" id="dev-token-hint">
              Bagian ini tidak ikut di versi online (npm run build).
            </p>
          )}
        </div>
        <button type="submit" className="btn btn--secondary">
          Pakai token
        </button>
      </form>
    </details>
  );
}

/**
 * Halaman masuk dashboard. Login hanya ada di sini (tidak ada di website company),
 * memakai POST /api/auth/login di backend.
 */
function LoginForm({ notice, onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Isi email dan password dulu.');
      return;
    }
    if (!cleanEmail.endsWith(ALLOWED_EMAIL_DOMAIN)) {
      setError(`Dashboard hanya untuk email berakhiran ${ALLOWED_EMAIL_DOMAIN}.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await authApi.login(cleanEmail, password);
      if (!result?.token) throw new Error('Login gagal. Coba lagi sebentar lagi.');
      storage.saveToken(result.token);
      // Berhasil: dashboard langsung tampil di alamat yang sama dan halaman ini hilang
      if (!onSignedIn()) {
        setError('Login gagal. Coba lagi sebentar lagi.');
        setBusy(false);
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Coba lagi sebentar lagi.');
      setBusy(false);
    }
  };

  return (
    <div className="stack stack--sm">
      <div className="login__intro">
        <h1 className="login__title">Masuk ke dashboard</h1>
        <p className="login__lead">Khusus anggota tim DevSpectra. Masuk dengan email {ALLOWED_EMAIL_DOMAIN} kamu.</p>
      </div>
      {notice && !error && <p className="notice notice--info">{notice}</p>}
      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className="input input--lg"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={`nama${ALLOWED_EMAIL_DOMAIN}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="login-password">
            Password
          </label>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
            visible={showPassword}
            onVisibleChange={setShowPassword}
            autoComplete="current-password"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>
        {error && (
          <p className="notice notice--bad" id="login-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
          <LogIn size={18} aria-hidden="true" />
          <span>{busy ? 'Memeriksa...' : 'Masuk'}</span>
        </button>
      </form>
      <button
        type="button"
        className="link-btn login__help-toggle"
        aria-expanded={showHelp}
        aria-controls="login-help"
        onClick={() => setShowHelp((v) => !v)}
      >
        Lupa password?
      </button>
      {showHelp && (
        <p className="login__help" id="login-help">
          Minta pemegang keuangan mengatur ulang password-mu di menu Anggota (ikon kunci di baris namamu). Setelah masuk, kamu bisa
          menggantinya sendiri.
        </p>
      )}
    </div>
  );
}

export default function SignInGate() {
  const { denied, email, notice, signOut, refreshSession } = useAuth();

  useEffect(() => {
    document.title = 'Masuk | Dashboard DevSpectra';
  }, []);

  let content;
  if (denied) {
    content = (
      <div className="stack stack--sm">
        <div className="login__intro">
          <h1 className="login__title">Akun ini tidak bisa membuka dashboard</h1>
          <p className="login__lead">
            Dashboard hanya untuk email berakhiran {ALLOWED_EMAIL_DOMAIN}. Kamu masuk sebagai <strong>{email}</strong>.
          </p>
        </div>
        <button type="button" className="btn btn--primary btn--lg btn--block" onClick={() => signOut('manual')}>
          Keluar dan ganti akun
        </button>
      </div>
    );
  } else if (DEMO_MODE) {
    content = <DemoAccounts onPicked={refreshSession} />;
  } else {
    content = (
      <>
        <LoginForm notice={notice} onSignedIn={refreshSession} />
        {import.meta.env.DEV && <DeveloperToken onAccepted={refreshSession} />}
      </>
    );
  }

  return (
    <div className="login">
      <aside className="login__aside">
        <div className="login__brand">
          <img className="brand-logo brand-logo--lg" src="/logo-devspectra.webp" alt="" width="44" height="44" />
          <span className="login__brand-name">DevSpectra</span>
        </div>
        <div className="login__statement">
          <p className="login__headline">Kelola anggota, absensi, dan klien DevSpectra dari satu dashboard.</p>
          <div className="login__spectrum">
            <Spectrum members={DECOR} allLit height={168} lineWidth={8} showInitials={false} />
          </div>
        </div>
        <p className="login__foot">Dashboard internal, khusus anggota tim DevSpectra.</p>
      </aside>
      <main className="login__main">
        <div className="login__card">
          {DEMO_MODE && !denied && notice && <p className="notice notice--info">{notice}</p>}
          {content}
        </div>
      </main>
    </div>
  );
}

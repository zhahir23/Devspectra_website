import { CircleCheck, Copy, CopyCheck, Dices } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usersApi } from '../api/endpoints';
import { PASSWORD_HINT, passwordProblem, randomPassword } from '../lib/password';
import PasswordInput from './PasswordInput';
import { useToast } from './Toast';
import { Field, describedBy } from './ui';

const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'anggota ini';

/**
 * Atur ulang password satu anggota (atau password sendiri kalau isSelf).
 * Setelah berhasil, password baru ditampilkan sekali supaya bisa disalin
 * dan dikirim ke anggotanya. Password tidak disimpan di mana pun oleh dashboard.
 */
export default function ResetPasswordForm({ member, isSelf, onCancel, onDone, onGone }) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null);
  const [copied, setCopied] = useState(false);
  const doneTitleRef = useRef(null);
  const resultRef = useRef(null);
  const name = firstName(member.name);

  // Formulir diganti layar hasil, jadi fokus dipindah ke judulnya (dibacakan pembaca layar).
  useEffect(() => {
    if (saved) doneTitleRef.current?.focus();
  }, [saved]);

  const generate = () => {
    setPassword(randomPassword());
    setVisible(true);
    setError(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const problem = passwordProblem(password, 'Isi password baru, atau klik Buat password acak.');
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      await usersApi.resetPassword(member.id, password);
      setSaved(password);
      setPassword('');
    } catch (err) {
      toast.error(err.message);
      if (err.status === 404) onGone();
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(saved);
      setCopied(true);
    } catch {
      resultRef.current?.select();
      toast.info('Tidak bisa menyalin otomatis. Password sudah dipilih, tinggal salin manual.');
    }
  };

  if (saved) {
    return (
      <div className="reset-done">
        <h3 ref={doneTitleRef} tabIndex={-1} className="reset-done__title">
          <CircleCheck size={20} aria-hidden="true" />
          <span>Password sudah diganti</span>
        </h3>
        <p className="reset-done__text">
          {isSelf
            ? 'Pakai password baru ini saat login berikutnya di halaman masuk dashboard.'
            : `Kirim password baru ini ke ${name} lewat pesan pribadi, misalnya WhatsApp. ${name} bisa langsung login di halaman masuk dashboard.`}
        </p>
        <div className="secret">
          <label htmlFor="r-hasil" className="sr-only">
            Password baru
          </label>
          <input
            ref={resultRef}
            id="r-hasil"
            className="input input--mono secret__value"
            readOnly
            value={saved}
            onFocus={(e) => e.target.select()}
          />
          <button type="button" className="btn btn--secondary" onClick={copy}>
            {copied ? <CopyCheck size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
            <span>{copied ? 'Tersalin' : 'Salin password'}</span>
          </button>
        </div>
        <p className="field__hint">Password ini hanya tampil sekali. Setelah panel ditutup, dashboard tidak bisa menampilkannya lagi.</p>
        <div className="form__actions">
          <button type="button" className="btn btn--primary btn--grow" onClick={onDone}>
            Selesai
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <p className="form__context">
        {isSelf
          ? 'Setelah disimpan, password lama kamu tidak bisa dipakai lagi.'
          : `Akun ${member.email}. Setelah disimpan, password lama ${name} tidak bisa dipakai lagi.`}
      </p>
      <Field label="Password baru" htmlFor="r-password" hint={PASSWORD_HINT} error={error}>
        <PasswordInput
          id="r-password"
          value={password}
          onChange={setPassword}
          visible={visible}
          onVisibleChange={setVisible}
          {...describedBy('r-password', { hint: PASSWORD_HINT, error })}
        />
      </Field>
      <button type="button" className="btn btn--secondary btn--sm form__aside" onClick={generate} disabled={busy}>
        <Dices size={16} aria-hidden="true" />
        <span>Buat password acak</span>
      </button>
      <div className="form__actions">
        <button type="submit" className="btn btn--primary btn--grow" disabled={busy}>
          {busy ? 'Menyimpan...' : 'Simpan password'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>
          Batal
        </button>
      </div>
    </form>
  );
}

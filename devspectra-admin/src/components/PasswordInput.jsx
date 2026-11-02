import { Eye, EyeOff } from 'lucide-react';

/**
 * Kolom password dengan tombol tampilkan/sembunyikan.
 * `visible` diatur oleh komponen induk, supaya tombol "Buat password acak" bisa ikut menampilkannya.
 */
export default function PasswordInput({ id, value, onChange, visible, onVisibleChange, autoComplete = 'new-password', ...rest }) {
  return (
    <div className="password-input">
      <input
        id={id}
        className="input input--mono password-input__field"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        maxLength={100}
        {...rest}
      />
      <button
        type="button"
        className="icon-btn password-input__toggle"
        aria-label="Tampilkan password"
        aria-pressed={visible}
        aria-controls={id}
        onClick={() => onVisibleChange(!visible)}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}

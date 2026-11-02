import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { compressImage, formatBytes, imageSrc } from '../lib/image';

/**
 * Pilih gambar dari laptop/HP. Gambar langsung diperkecil di browser dan ditampilkan sebagai pratinjau;
 * baru diunggah ke backend saat formulir disimpan.
 *
 * value: alamat gambar sekarang ("/api/media/12", "/projects/braka.png", atau data URL gambar baru)
 * onChange(hasil): gambar baru dipilih, hasil = { dataUrl, width, height, bytes }
 * onRemove(): tombol hapus ditekan (tombolnya hanya muncul kalau onRemove diisi)
 * shape: 'wide' (kartu project, 16:10) atau 'circle' (foto anggota)
 * fallbackText: teks di pratinjau kalau belum ada gambar, misalnya inisial anggota
 */
export default function ImagePicker({
  id,
  label,
  value,
  onChange,
  onRemove,
  removeLabel = 'Hapus gambar',
  shape = 'wide',
  maxSize = 1600,
  hint,
  error,
  fallbackText,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [info, setInfo] = useState('');
  const [brokenSrc, setBrokenSrc] = useState(null);

  const src = imageSrc(value);
  const broken = Boolean(src) && brokenSrc === src;

  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // supaya file yang sama bisa dipilih lagi
    if (!file) return;
    setBusy(true);
    setProblem('');
    try {
      const result = await compressImage(file, { maxSize });
      setInfo(`Gambar baru: ${result.width} x ${result.height} piksel, ${formatBytes(result.bytes)}. Tersimpan setelah formulir disimpan.`);
      onChange(result);
    } catch (err) {
      setProblem(err.message || 'Gambar tidak bisa dipakai. Pilih file gambar lain.');
    } finally {
      setBusy(false);
    }
  };

  const shownError = problem || error;
  const noteId = shownError ? `${id}-error` : `${id}-hint`;
  const note = shownError || info || hint;

  return (
    <div className={`field image-field${shownError ? ' has-error' : ''}`} role="group" aria-labelledby={`${id}-label`}>
      <span className="field__label" id={`${id}-label`}>
        {label}
      </span>
      <div className="image-field__body">
        <div className={`image-preview image-preview--${shape}`}>
          {src && !broken ? (
            <img src={src} alt="" onError={() => setBrokenSrc(src)} />
          ) : fallbackText && !src ? (
            <span className="image-preview__initials" aria-hidden="true">
              {fallbackText}
            </span>
          ) : (
            <span className="image-preview__empty">
              <ImagePlus size={22} aria-hidden="true" />
              {shape === 'wide' && <span>{broken ? 'Gambar tidak bisa dimuat' : 'Belum ada gambar'}</span>}
            </span>
          )}
        </div>
        <div className="image-field__side">
          <div className="image-field__actions">
            <button
              type="button"
              id={id}
              className="btn btn--secondary btn--sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              aria-describedby={note ? noteId : undefined}
            >
              {busy ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
              <span>{busy ? 'Memproses gambar...' : value ? 'Ganti gambar' : 'Pilih gambar'}</span>
            </button>
            {onRemove && value && !busy && (
              <button
                type="button"
                className="btn btn--ghost-danger btn--sm"
                onClick={() => {
                  setInfo('');
                  setProblem('');
                  onRemove();
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
                <span>{removeLabel}</span>
              </button>
            )}
          </div>
          {shownError ? (
            <p className="field__error" id={noteId} role="alert">
              {shownError}
            </p>
          ) : (
            note && (
              <p className="field__hint" id={noteId}>
                {note}
              </p>
            )
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        id={`${id}-file`}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={pick}
      />
    </div>
  );
}

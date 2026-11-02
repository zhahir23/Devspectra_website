import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

/**
 * Jendela dialog memakai elemen <dialog> bawaan browser
 * (fokus otomatis terkunci di dalam dialog, tombol Esc menutup).
 * Isinya baru dibuat saat dibuka, jadi formulir selalu mulai dari awal.
 */
export default function Modal({ open, title, description, onClose, children, footer, size = 'md' }) {
  const ref = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal modal--${size}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="modal__inner">
          <div className="modal__header">
            <div className="modal__titles">
              <h2 id={titleId} className="modal__title">{title}</h2>
              {description && <p id={descId} className="modal__desc">{description}</p>}
            </div>
            <button type="button" className="icon-btn" aria-label="Tutup" onClick={onClose}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="modal__body">{children}</div>
          {footer && <div className="modal__footer">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

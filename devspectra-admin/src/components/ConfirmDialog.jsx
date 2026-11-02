import { useState } from 'react';
import Modal from './Modal';

/** Konfirmasi sebelum menghapus. onConfirm boleh async; tombol menunggu sampai selesai. */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Hapus', busyLabel = 'Menghapus...', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => {} : onClose}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={busy}>
            Batal
          </button>
          <button type="button" className="btn btn--danger" onClick={handleConfirm} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </>
      }
    >
      <p className="confirm__message">{message}</p>
    </Modal>
  );
}

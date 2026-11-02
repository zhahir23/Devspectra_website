import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

/** Notifikasi kecil di pojok layar: "Tersimpan", "Gagal menghapus", dan sejenisnya. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (message, tone = 'good') => {
      counter.current += 1;
      const id = counter.current;
      setToasts((list) => [...list.slice(-3), { id, message, tone }]);
      setTimeout(() => dismiss(id), tone === 'bad' ? 7000 : 4000);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (message) => show(message, 'good'),
      error: (message) => show(message, 'bad'),
      info: (message) => show(message, 'info'),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            {t.tone === 'bad' ? <CircleAlert size={18} aria-hidden="true" /> : <CircleCheck size={18} aria-hidden="true" />}
            <span>{t.message}</span>
            <button type="button" className="toast__close" aria-label="Tutup notifikasi" onClick={() => dismiss(t.id)}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>.');
  return ctx;
}

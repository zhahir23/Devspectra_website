import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { applyTheme, currentTheme, savedTheme, THEME_STORAGE_KEY } from '../lib/theme';

/** Tombol ganti mode terang/gelap di bilah atas, di samping lonceng notifikasi. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    // Belum pernah memilih sendiri: ikuti saat mode gelap di perangkat dinyalakan atau dimatikan
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const onSystemChange = (event) => {
      if (savedTheme()) return;
      const next = event.matches ? 'dark' : 'light';
      applyTheme(next, { save: false });
      setTheme(next);
    };
    // Tema diganti di tab dashboard lain
    const onStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = savedTheme();
      if (!next) return;
      applyTheme(next, { save: false });
      setTheme(next);
    };
    media?.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorage);
    return () => {
      media?.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const dark = theme === 'dark';
  const label = dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';
  const Icon = dark ? Sun : Moon;

  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button type="button" className="icon-btn icon-btn--bordered" aria-label={label} title={label} onClick={toggle}>
      <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}

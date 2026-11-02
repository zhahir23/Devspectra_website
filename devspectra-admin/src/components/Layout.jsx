import {
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Network,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { canSeeFinance } from '../auth/permissions';
import { DEMO_MODE } from '../config';
import { useInbox } from '../data/InboxContext';
import { prefetchMainMenus, prefetchPath } from '../data/queries';
import { revalidateVisibleQueries } from '../data/queryCache';
import ThemeToggle from './ThemeToggle';
import { useTeam } from '../data/TeamContext';
import { formatLongDate } from '../lib/format';
import { Avatar } from './ui';

const MAIN_NAV = [
  { to: '/', label: 'Ringkasan', icon: LayoutDashboard, end: true },
  { to: '/anggota', label: 'Anggota', icon: Users },
  { to: '/absensi', label: 'Absensi', icon: CalendarCheck },
  { to: '/klien', label: 'Klien masuk', icon: Inbox, badge: 'inbox' },
  // Hanya tampil untuk anggota yang tercantum di VITE_FINANCE_EMAILS
  { to: '/keuangan', label: 'Keuangan', icon: Wallet, finance: true },
];

const CONTENT_NAV = [
  { to: '/konten/layanan', label: 'Layanan', icon: BriefcaseBusiness },
  { to: '/konten/testimoni', label: 'Testimoni', icon: MessageSquareQuote },
  { to: '/konten/projects', label: 'Projects', icon: FolderKanban },
  { to: '/konten/divisi', label: 'Divisi', icon: Network },
];

const PAGE_INFO = [
  { match: /^\/$/, title: 'Ringkasan', subtitle: 'today' },
  { match: /^\/anggota/, title: 'Anggota', subtitle: 'Kelola akun anggota tim' },
  { match: /^\/absensi/, title: 'Absensi', subtitle: 'today' },
  { match: /^\/klien/, title: 'Klien masuk', subtitle: 'Pesan dari formulir kontak website' },
  { match: /^\/keuangan/, title: 'Keuangan', subtitle: 'Pemasukan dari klien' },
  { match: /^\/konten/, title: 'Konten website', subtitle: 'Yang tampil di website DevSpectra' },
];

/** Akun yang sedang masuk: di bilah atas (layar lebar) dan di menu samping (HP). */
function SignedInAs({ className, me, email, avatarSize }) {
  return (
    <div className={className}>
      <Avatar name={me?.name || email} size={avatarSize} />
      <span className={`${className}-text`}>
        <span className={`${className}-name`}>{me?.name || email}</span>
        {me && <span className={`${className}-role`}>{me.role || me.division || me.email}</span>}
      </span>
    </div>
  );
}

function NavItem({ item, pendingCount, onNavigate, onPrefetch }) {
  const Icon = item.icon;
  const prefetch = () => onPrefetch(item.to);
  return (
    <li>
      <NavLink to={item.to} end={item.end} className="nav__link" onClick={onNavigate} onPointerEnter={prefetch} onFocus={prefetch}>
        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
        <span>{item.label}</span>
        {item.badge === 'inbox' && pendingCount > 0 && (
          <span className="nav__badge">
            {pendingCount}
            <span className="sr-only"> pesan baru</span>
          </span>
        )}
      </NavLink>
    </li>
  );
}

export default function Layout() {
  const { email, signOut } = useAuth();
  const { me } = useTeam();
  const { pendingCount } = useInbox();
  const mainNav = MAIN_NAV.filter((item) => !item.finance || canSeeFinance(email));
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const info = PAGE_INFO.find((p) => p.match.test(location.pathname)) || { title: 'Dashboard', subtitle: '' };
  const subtitle = info.subtitle === 'today' ? formatLongDate(new Date()) : info.subtitle;

  useEffect(() => {
    document.title = `${info.title} | Dashboard DevSpectra`;
  }, [info.title]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Setelah halaman pertama selesai dimuat, data menu utama lain dimuat di belakang layar,
  // supaya saat berpindah menu isinya langsung tampil tanpa "Memuat data".
  useEffect(() => {
    const timer = setTimeout(() => prefetchMainMenus(email), 1500);
    return () => clearTimeout(timer);
  }, [email]);

  // Kembali ke tab dashboard setelah ditinggal: perbarui data yang sedang tampil kalau sudah lama.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') revalidateVisibleQueries();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const prefetch = (path) => prefetchPath(email, path);

  const closeMenu = () => setMenuOpen(false);

  // Klik logo: pindah ke Ringkasan di dalam dashboard, seperti mengeklik menu Ringkasan.
  // Halaman tidak dimuat ulang dan data memakai yang sudah tersimpan (src/data/queryCache.js).
  const scrollTopAfterNav = useRef(false);
  useLayoutEffect(() => {
    if (!scrollTopAfterNav.current) return;
    scrollTopAfterNav.current = false;
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const goToSummary = (event) => {
    // Ctrl/Cmd/Shift-klik atau klik tengah: biarkan browser membuka tab baru seperti biasa
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    closeMenu();
    if (location.pathname === '/') {
      // Sudah di Ringkasan: cukup kembali ke atas. Tidak pindah halaman, tidak ada permintaan baru.
      event.preventDefault();
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    scrollTopAfterNav.current = true;
  };

  return (
    <div className="app">
      <a className="skip-link" href="#konten-utama">
        Langsung ke konten
      </a>
      {DEMO_MODE && (
        <p className="demo-banner">
          Mode demo: semua data di sini contoh dan tidak tersimpan ke database.
        </p>
      )}
      <div className="app__body">
        <nav id="menu-utama" className={`sidebar${menuOpen ? ' is-open' : ''}`} aria-label="Menu utama">
          <div className="sidebar__brand">
            <Link to="/" className="sidebar__brand-link" aria-label="DevSpectra, buka Ringkasan" onClick={goToSummary}>
              <img className="brand-logo" src="/logo-devspectra.webp" alt="" width="40" height="40" />
              <span className="sidebar__brand-text">
                <span className="sidebar__brand-name">DevSpectra</span>
                <span className="sidebar__brand-sub">Dashboard admin</span>
              </span>
            </Link>
            <button type="button" className="icon-btn sidebar__close" aria-label="Tutup menu" onClick={closeMenu}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <ul className="nav">
            {mainNav.map((item) => (
              <NavItem key={item.to} item={item} pendingCount={pendingCount} onNavigate={closeMenu} onPrefetch={prefetch} />
            ))}
          </ul>

          <div className="nav-group">
            <p id="grup-konten" className="nav-group__label">
              Konten website
            </p>
            <ul className="nav" aria-labelledby="grup-konten">
              {CONTENT_NAV.map((item) => (
                <NavItem key={item.to} item={item} pendingCount={0} onNavigate={closeMenu} onPrefetch={prefetch} />
              ))}
            </ul>
          </div>

          <div className="sidebar__footer">
            <SignedInAs className="sidebar__user" me={me} email={email} avatarSize={36} />
            <button type="button" className="nav__link" onClick={() => signOut('manual')}>
              <LogOut size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </nav>
        {menuOpen && <button type="button" className="sidebar-scrim" aria-label="Tutup menu" onClick={closeMenu} />}

        <div className="main-col">
          <header className="topbar">
            <button
              type="button"
              className="icon-btn icon-btn--bordered topbar__menu"
              aria-label="Buka menu"
              aria-controls="menu-utama"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="topbar__titles">
              <h1 className="topbar__title">{info.title}</h1>
              {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
            </div>
            <div className="topbar__actions">
              <div className="topbar__tools">
                <ThemeToggle />
                <Link
                  to="/klien"
                  className="icon-btn icon-btn--bordered topbar__bell"
                  aria-label={pendingCount > 0 ? `Notifikasi, ${pendingCount} klien baru` : 'Notifikasi, tidak ada klien baru'}
                >
                  <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
                  {pendingCount > 0 && <span className="topbar__bell-dot" aria-hidden="true" />}
                </Link>
              </div>
              <SignedInAs className="topbar__user" me={me} email={email} avatarSize={40} />
            </div>
          </header>

          <main id="konten-utama" className="page" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

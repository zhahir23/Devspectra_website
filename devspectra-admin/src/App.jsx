import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { canSeeFinance } from './auth/permissions';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import { AccessRestricted } from './components/ui';
import { InboxProvider } from './data/InboxContext';
import { TeamProvider } from './data/TeamContext';
import Absensi from './pages/Absensi';
import Anggota from './pages/Anggota';
import Keuangan from './pages/Keuangan';
import Klien from './pages/Klien';
import Konten from './pages/Konten';
import NotFound from './pages/NotFound';
import Ringkasan from './pages/Ringkasan';

/** Semua halaman di dalamnya hanya tampil setelah login di halaman masuk dashboard. */
function AdminArea() {
  return (
    <ProtectedRoute>
      <TeamProvider>
        <InboxProvider>
          <Layout />
        </InboxProvider>
      </TeamProvider>
    </ProtectedRoute>
  );
}

/** Halaman Keuangan hanya untuk anggota yang tercantum di VITE_FINANCE_EMAILS. */
function FinanceRoute({ children }) {
  const { email } = useAuth();
  if (!canSeeFinance(email)) {
    return (
      <div className="stack">
        <AccessRestricted title="Keuangan hanya untuk anggota yang ditunjuk">
          Halaman ini hanya bisa dibuka oleh pengelola keuangan DevSpectra. Kalau kamu perlu akses, hubungi admin tim.
        </AccessRestricted>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AdminArea />}>
              <Route index element={<Ringkasan />} />
              <Route path="anggota" element={<Anggota />} />
              <Route path="absensi" element={<Absensi />} />
              <Route path="klien" element={<Klien />} />
              <Route
                path="keuangan"
                element={
                  <FinanceRoute>
                    <Keuangan />
                  </FinanceRoute>
                }
              />
              <Route path="konten" element={<Navigate to="/konten/layanan" replace />} />
              <Route path="konten/:tab" element={<Konten />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

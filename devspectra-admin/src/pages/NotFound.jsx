import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <div className="stack">
      <EmptyState
        title="Halaman tidak ditemukan"
        action={
          <Link to="/" className="btn btn--secondary btn--sm">
            Kembali ke Ringkasan
          </Link>
        }
      >
        Alamat yang kamu buka tidak ada di dashboard ini.
      </EmptyState>
    </div>
  );
}

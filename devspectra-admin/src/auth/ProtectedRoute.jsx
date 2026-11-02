import SignInGate from '../pages/SignInGate';
import { useAuth } from './AuthContext';

/** Isi dashboard hanya tampil kalau sudah ada token login yang berlaku. */
export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <SignInGate />;
  return children;
}

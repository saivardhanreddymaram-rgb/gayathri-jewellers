import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, initialized } = useAuth();
  const location = useLocation();

  // Still bootstrapping — render nothing to prevent flash
  if (!initialized) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-espresso-100 border-t-gold-500 rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  // Not signed in — redirect to /login, remember where they were going
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Signed in but not admin — redirect to home
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

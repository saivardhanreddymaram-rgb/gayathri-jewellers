import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Only allows unauthenticated users.
 * If already signed in, redirects straight to the home page.
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { user, initialized } = useAuth();

  // Still loading session — show nothing to avoid flash
  if (!initialized) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-espresso-100 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Already signed in — go to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

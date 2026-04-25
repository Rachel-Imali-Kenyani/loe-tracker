import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function FullScreenMessage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121315] px-6">
      <div className="rounded-2xl border border-outline-variant bg-surface-container px-6 py-5 text-sm text-on-surface-variant shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
        {message}
      </div>
    </div>
  );
}

export function RequireAuth() {
  const { isLoading, session } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenMessage message="Checking session..." />;
  }

  if (!session) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

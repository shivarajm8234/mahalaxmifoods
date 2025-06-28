import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }


  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/admin" state={{ from: location.pathname }} replace />;
  }

  // If not an admin but authenticated, redirect to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and admin, render children
  return <>{children}</>;
}

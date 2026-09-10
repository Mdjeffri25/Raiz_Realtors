import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-raiz-offwhite">
        <svg className="animate-spin" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="11" stroke="#E5E2DF" strokeWidth="2" />
          <path d="M25 14a11 11 0 0 0-11-11" stroke="#E7A58C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RoleGuard({ roles, children }) {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

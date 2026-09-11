import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setBackendReady(false);
      return;
    }

    let mounted = true;

    const wakeBackend = async () => {
      try {
        await axiosClient.get('/health');

        if (mounted) {
          setBackendReady(true);
        }
      } catch (error) {
        if (mounted) {
          setBackendReady(false);
        }
      }
    };

    wakeBackend();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  // Authentication loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-raiz-offwhite">
        <svg
          className="animate-spin"
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
        >
          <circle
            cx="14"
            cy="14"
            r="11"
            stroke="#E5E2DF"
            strokeWidth="2"
          />
          <path
            d="M25 14a11 11 0 0 0-11-11"
            stroke="#E7A58C"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Backend waking / connecting
  if (!backendReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-raiz-offwhite">
        <div className="text-center">
          <svg
            className="animate-spin mx-auto mb-4"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
          >
            <circle
              cx="14"
              cy="14"
              r="11"
              stroke="#E5E2DF"
              strokeWidth="2"
            />
            <path
              d="M25 14a11 11 0 0 0-11-11"
              stroke="#E7A58C"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <p className="text-sm text-raiz-secondary">
            Connecting to CRM...
          </p>

          <p className="mt-1 text-xs text-raiz-secondary">
            Starting secure backend connection
          </p>
        </div>
      </div>
    );
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
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || loading) {
      return;
    }

    let cancelled = false;

    const wakeBackend = async () => {
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          await axiosClient.get('/health', {
            timeout: 30000,
          });

          if (!cancelled) {
            setBackendReady(true);
          }

          return;
        } catch (error) {
          if (attempt < 5) {
            await new Promise((resolve) =>
              setTimeout(resolve, 3000)
            );
          }
        }
      }

      if (!cancelled) {
        setBackendReady(false);
      }
    };

    wakeBackend();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loading]);

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

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (!backendReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-raiz-offwhite">
        <div className="text-center">

          <svg
            className="animate-spin mx-auto"
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

          <p className="mt-4 text-sm text-raiz-black">
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
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}
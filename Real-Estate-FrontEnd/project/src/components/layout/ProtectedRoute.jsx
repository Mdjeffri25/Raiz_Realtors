import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const [backendReady, setBackendReady] = useState(false);

  // Wake Render in the background.
  // IMPORTANT: This does NOT block the application.
  useEffect(() => {
    if (!isAuthenticated || loading) {
      return;
    }

    let cancelled = false;

    const wakeBackend = async () => {
      try {
        await axiosClient.get('/health', {
          timeout: 15000,
        });

        if (!cancelled) {
          setBackendReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          setBackendReady(false);
        }
      }
    };

    wakeBackend();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loading]);

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

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // IMPORTANT:
  // Do NOT wait for backendReady here.
  // Render can take time to wake up.
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
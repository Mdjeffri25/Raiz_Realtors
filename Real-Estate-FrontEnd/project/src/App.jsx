import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ROLES } from './utils/constants';
import {
  ProtectedRoute,
  RoleGuard,
} from "./components/layout/ProtectedRoute";

import Layout from "./components/layout/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import FollowUps from "./pages/FollowUps";
import AuditLogs from "./pages/AuditLogs";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

// import { ROLES } from "./utils/constants";


function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* ================= LOGIN ================= */}

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />


      {/* ================= PROTECTED APP ================= */}

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* ================= LEADS ================= */}

        <Route
          path="/leads"
          element={
            <RoleGuard
              roles={[
                ROLES.ADMIN,
                ROLES.SALES,
                ROLES.BACK_OFFICE,
              ]}
            >
              <Leads />
            </RoleGuard>
          }
        />


        {/* ================= PROPERTIES ================= */}

        <Route
          path="/properties"
          element={
            <RoleGuard
              roles={[
                ROLES.ADMIN,
                ROLES.SALES,
                ROLES.BACK_OFFICE,
              ]}
            >
              <Properties />
            </RoleGuard>
          }
        />


        {/* ================= BOOKINGS ================= */}

        <Route
          path="/bookings"
          element={
            <RoleGuard
              roles={[
                ROLES.ADMIN,
                ROLES.SALES,
                ROLES.BACK_OFFICE,
                ROLES.AUDITOR,
              ]}
            >
              <Bookings />
            </RoleGuard>
          }
        />


        {/* ================= FOLLOW UPS ================= */}

        <Route
          path="/follow-ups"
          element={
            <RoleGuard
              roles={[
                ROLES.ADMIN,
                ROLES.SALES,
                ROLES.BACK_OFFICE,
              ]}
            >
              <FollowUps />
            </RoleGuard>
          }
        />


        {/* ================= AUDIT LOGS ================= */}

        <Route
          path="/audit-logs"
          element={
            <RoleGuard
              roles={[
                ROLES.ADMIN,
                ROLES.AUDITOR,
              ]}
            >
              <AuditLogs />
            </RoleGuard>
          }
        />


        {/* ================= USERS ================= */}

        <Route
          path="/users"
          element={
            <RoleGuard
              roles={[ROLES.ADMIN]}
            >
              <Users />
            </RoleGuard>
          }
        />


        {/* ================= SETTINGS ================= */}

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Route>


      {/* ================= FALLBACK ================= */}

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />

    </Routes>
  );
}


/* ================= MAIN APP ================= */

function App() {
  return (
    <BrowserRouter>

      <ToastProvider>

        <AuthProvider>

          <AppRoutes />

        </AuthProvider>

      </ToastProvider>

    </BrowserRouter>
  );
}


export default App;
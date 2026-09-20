import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RiskDashboard from './pages/RiskDashboard';
import AttackWizard from './pages/AttackWizard';
import Vulnerabilities from './pages/Vulnerabilities';
import Telemetry from './pages/Telemetry';
import Investments from './pages/Investments';
import Reports from './pages/Reports';
import Blockchain from './pages/BlockchainLedger';
import MarketBenchmarks from './pages/MarketBenchmarks';
import AdminPortal from './pages/AdminPortal';
import Onboarding from './pages/Onboarding';
import Legal from './pages/Legal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DemoRequest from './pages/DemoRequest';
import NotFound from './pages/NotFound';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04070a] flex items-center justify-center font-mono text-emerald-400 text-xs tracking-wider">
        INITIALIZING CYBER FLOCK 3D DEFENSE GRID...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route wrapper (Main Administrator Only)
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'admin';
  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/demo" element={<DemoRequest />} />

      {/* Authenticated Pages in Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="risk" element={<RiskDashboard />} />
        <Route
          path="attack-wizard"
          element={
            <AdminRoute>
              <AttackWizard />
            </AdminRoute>
          }
        />
        <Route
          path="simulations"
          element={
            <AdminRoute>
              <AttackWizard />
            </AdminRoute>
          }
        />
        <Route path="vulnerabilities" element={<Vulnerabilities />} />
        <Route path="telemetry" element={<Telemetry />} />
        <Route path="investments" element={<Investments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="blockchain" element={<Blockchain />} />
        <Route path="benchmarks" element={<MarketBenchmarks />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="legal" element={<Legal />} />

        {/* Admin Portal */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;


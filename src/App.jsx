import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import BetaRegister from "./pages/BetaRegister.jsx";
import PaymentPortal from "./pages/PaymentPortal.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TrialBanner from "./components/TrialBanner.jsx";

function PrivateRoute({ children, requireDueño = false }) {
  const { isAuthenticated, isDueño, loading, isSuspendido } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isSuspendido) return <Navigate to="/pago" replace />;
  if (requireDueño && !isDueño) return <Navigate to="/" replace />;

  return (
    <>
      {children}
      <TrialBanner />
    </>
  );
}

function AppRoutes() {
  const { userData, isSuspendido, isAuthenticated } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("pos_negocio_nombre");
    if (saved) {
      document.title = saved;
    } else if (userData?.nombre) {
      document.title = userData.nombre;
    }
  }, [userData]);

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={
        isAuthenticated && !isSuspendido ? <Navigate to="/dashboard" replace /> : <LandingPage />
      } />
      <Route path="/login" element={
        isAuthenticated && !isSuspendido ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/registro" element={
        isAuthenticated && !isSuspendido ? <Navigate to="/dashboard" replace /> : <Register />
      } />
      <Route path="/beta-registro" element={
        isAuthenticated && !isSuspendido ? <Navigate to="/dashboard" replace /> : <BetaRegister />
      } />

      {/* Portal de pago (accesible logueado pero suspendido) */}
      <Route path="/pago" element={
        isAuthenticated ? <PaymentPortal /> : <Navigate to="/login" replace />
      } />

      {/* Dashboard protegido */}
      <Route path="/dashboard/*" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/*" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

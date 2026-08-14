import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BetaRegister from "./pages/BetaRegister";
import PaymentPortal from "./pages/PaymentPortal";
import Dashboard from "./pages/Dashboard";
import TrialBanner from "./components/TrialBanner";

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
      <Route path="/login" element={
        isAuthenticated && !isSuspendido ? <Navigate to="/" replace /> : <Login />
      } />
      <Route path="/registro" element={
        isAuthenticated && !isSuspendido ? <Navigate to="/" replace /> : <Register />
      } />
      <Route path="/beta-registro" element={
        isAuthenticated && !isSuspendido ? <Navigate to="/" replace /> : <BetaRegister />
      } />
      <Route path="/pago" element={
        isAuthenticated ? <PaymentPortal /> : <Navigate to="/login" replace />
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

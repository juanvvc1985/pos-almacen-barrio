import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CanjearCodigo from "./components/CanjearCodigo";
import BetaRegister from "./pages/BetaRegister";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";

// Componente para proteger rutas privadas
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: Landing Page (Inicio) */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rutas públicas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/beta-registro" element={<BetaRegister />} />
          <Route path="/canjear-beta" element={<CanjearCodigo />} />
          
          {/* Rutas privadas (Dashboard) - Ahora bajo /app */}
          <Route path="/app/*" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          {/* Redirecciones legacy */}
          <Route path="/vender" element={<Navigate to="/app/vender" />} />
          <Route path="/productos" element={<Navigate to="/app/productos" />} />
          <Route path="/dashboard" element={<Navigate to="/app" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
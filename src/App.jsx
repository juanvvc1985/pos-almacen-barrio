import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CanjearCodigo from "./components/CanjearCodigo";
import BetaRegister from "./pages/BetaRegister";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";

// Componente para proteger rutas
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/beta-registro" element={<BetaRegister />} />
          <Route path="/canjear-beta" element={<CanjearCodigo />} />
          
          {/* Rutas Privadas (Dashboard) */}
          <Route path="/app/*" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          {/* Redirección legacy por si alguien entra a /vender directamente sin estar logueado */}
          <Route path="/vender" element={<Navigate to="/app/vender" />} />
          <Route path="/productos" element={<Navigate to="/app/productos" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
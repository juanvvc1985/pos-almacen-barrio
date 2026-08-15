import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import CanjearCodigo from "./components/CanjearCodigo";
import BetaRegister from "./pages/BetaRegister";
import Register from "./pages/Register";

// Puerta de seguridad: solo usuarios autenticados entran al panel
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Página principal PÚBLICA: siempre visible, con o sin sesión */}
          <Route path="/" element={<LandingPage />} />

          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/beta-registro" element={<BetaRegister />} />
          <Route path="/canjear-beta" element={<CanjearCodigo />} />

          {/* Panel privado: requiere sesión iniciada */}
          <Route
            path="/app/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Cualquier otra ruta → portada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
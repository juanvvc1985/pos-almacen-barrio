import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CanjearCodigo from "./components/CanjearCodigo";
import BetaRegister from "./pages/BetaRegister";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: canjear código beta (no requiere login) */}
          <Route path="/canjear-beta" element={<CanjearCodigo />} />
          {/* 🔥 FIX #24: Rutas faltantes para LandingPage */}
          <Route path="/beta-registro" element={<BetaRegister />} />
          <Route path="/registro" element={<Register />} />
          {/* Login */}
          <Route path="/login" element={<Login />} />
          {/* Dashboard con todas las rutas internas */}
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
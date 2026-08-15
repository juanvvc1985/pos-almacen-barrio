import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import POS from "../components/POS";
import ProductManager from "../components/ProductManager";
import Reports from "../components/Reports";
import Mermas from "../components/Mermas";
import Fiados from "../components/Fiados";
import Offers from "../components/Offers";
import AdminVendedores from "./AdminVendedores";
import ConfiguracionAlmacen from "./ConfiguracionAlmacen";
import BetaCodesAdmin from "../components/BetaCodesAdmin";

export default function Dashboard() {
  const { isDueño, hasPrivilege, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Routes>
          <Route index element={<POS />} />
          <Route path="vender" element={<POS />} />
          <Route path="productos" element={isDueño || hasPrivilege("productos") ? <ProductManager /> : <Navigate to="/app" replace />} />
          <Route path="fiados" element={<Fiados />} />
          <Route path="ofertas" element={isDueño || hasPrivilege("ofertas") ? <Offers /> : <Navigate to="/app" replace />} />
          <Route path="mermas" element={isDueño || hasPrivilege("mermas") ? <Mermas /> : <Navigate to="/app" replace />} />
          <Route path="informes" element={<Reports />} />
          <Route path="vendedores" element={isDueño ? <AdminVendedores /> : <Navigate to="/app" replace />} />
          <Route path="configuracion" element={isDueño ? <ConfiguracionAlmacen /> : <Navigate to="/app" replace />} />
          <Route path="admin-beta" element={isDueño ? <BetaCodesAdmin /> : <Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </main>
    </div>
  );
}
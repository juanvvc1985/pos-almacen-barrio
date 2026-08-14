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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/vender" element={<POS />} />
          <Route path="/productos" element={isDueño || hasPrivilege("productos") ? <ProductManager /> : <Navigate to="/" />} />
          <Route path="/fiados" element={<Fiados />} />
          <Route path="/ofertas" element={isDueño || hasPrivilege("ofertas") ? <Offers /> : <Navigate to="/" />} />
          <Route path="/mermas" element={isDueño || hasPrivilege("mermas") ? <Mermas /> : <Navigate to="/" />} />
          <Route path="/informes" element={<Reports />} />
          <Route path="/vendedores" element={isDueño ? <AdminVendedores /> : <Navigate to="/" />} />
          <Route path="/configuracion" element={isDueño ? <ConfiguracionAlmacen /> : <Navigate to="/" />} />
          <Route path="/admin-beta" element={isDueño ? <BetaCodesAdmin /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

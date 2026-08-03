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

export default function Dashboard() {
  const { isDueño, loading } = useAuth();

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
          <Route path="/productos" element={<ProductManager />} />
          <Route path="/fiados" element={<Fiados />} />  {/* Vendedor también accede */}
          {isDueño && (
            <>
              <Route path="/ofertas" element={<Offers />} />
              <Route path="/mermas" element={<Mermas />} />
              <Route path="/informes" element={<Reports />} />
              <Route path="/vendedores" element={<AdminVendedores />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
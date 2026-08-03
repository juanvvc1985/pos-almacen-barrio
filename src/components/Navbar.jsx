import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { salesService } from "../services/firestoreSales";
import { formatCurrency } from "../utils/format";
import { 
  ShoppingCart, Package, BarChart3, AlertTriangle, 
  Users, Tag, LogOut, Menu, X, UserPlus 
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { isDueño, isVendedor, userData, logout, almacenId } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarCierreLogout, setMostrarCierreLogout] = useState(false);
  const [resumenLogout, setResumenLogout] = useState(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/vender", label: "Vender", icon: ShoppingCart, show: true },
    { path: "/productos", label: "Productos", icon: Package, show: true },
    { path: "/fiados", label: "Fiados", icon: Users, show: true },
    { path: "/ofertas", label: "Ofertas", icon: Tag, show: isDueño },
    { path: "/mermas", label: "Mermas", icon: AlertTriangle, show: isDueño },
    { path: "/informes", label: "Informes", icon: BarChart3, show: isDueño },
    { path: "/vendedores", label: "Vendedores", icon: UserPlus, show: isDueño },
  ];

  async function handleLogout() {
    if (!almacenId) {
      logout();
      return;
    }
    const turno = await salesService.getTurnoActivo(almacenId);
    if (turno) {
      const ventasHoy = await salesService.getTodaySales(almacenId);
      const resumen = { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 };
      ventasHoy.forEach((v) => {
        if (resumen[v.metodoPago] !== undefined) resumen[v.metodoPago] += v.total;
      });
      const totalVentas = Object.values(resumen).reduce((a, b) => a + b, 0);
      setResumenLogout({
        ...resumen,
        totalVentas,
        efectivoEnCaja: (turno.montoInicial || 0) + (resumen.efectivo || 0),
        montoInicial: turno.montoInicial || 0,
        turnoId: turno.id,
      });
      setMostrarCierreLogout(true);
    } else {
      logout();
    }
  }

  async function confirmarCerrarYLogout() {
    if (!resumenLogout) return;
    await salesService.updateTurno(resumenLogout.turnoId, {
      estado: "cerrado",
      cerradoEn: new Date().toISOString(),
      ventas: {
        efectivo: resumenLogout.efectivo,
        tarjeta: resumenLogout.tarjeta,
        transferencia: resumenLogout.transferencia,
        fiado: resumenLogout.fiado,
      },
    });
    setMostrarCierreLogout(false);
    setResumenLogout(null);
    logout();
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-bold text-xl text-blue-600">POS Almacén</Link>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.filter(i => i.show).map((item) => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}>
                  <item.icon size={18} /> {item.label}
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {userData?.nombre} • {isDueño ? "Dueño" : "Vendedor"}
              </span>
              <button onClick={handleLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition text-sm">
                <LogOut size={18} /> Salir
              </button>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.filter(i => i.show).map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                    isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  <item.icon size={18} /> {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-500">
                  {userData?.nombre} • {isDueño ? "Dueño" : "Vendedor"}
                </div>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 text-red-600 text-sm font-medium w-full">
                  <LogOut size={18} /> Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Modal cierre de turno al logout */}
      {mostrarCierreLogout && resumenLogout && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-1">Hay un turno activo</h3>
            <p className="text-sm text-gray-500 mb-4">Cuadra la caja antes de salir</p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Efectivo inicial:</span><span className="font-medium">{formatCurrency(resumenLogout.montoInicial)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ventas efectivo:</span><span className="font-medium text-green-600">{formatCurrency(resumenLogout.efectivo)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ventas tarjeta:</span><span className="font-medium text-blue-600">{formatCurrency(resumenLogout.tarjeta)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transferencias:</span><span className="font-medium text-purple-600">{formatCurrency(resumenLogout.transferencia)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fiados:</span><span className="font-medium text-orange-600">{formatCurrency(resumenLogout.fiado)}</span></div>
              <div className="border-t pt-2 flex justify-between text-base font-bold"><span>Total ventas:</span><span>{formatCurrency(resumenLogout.totalVentas)}</span></div>
              <div className="flex justify-between text-base font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <span>Efectivo en caja:</span><span>{formatCurrency(resumenLogout.efectivoEnCaja)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMostrarCierreLogout(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={confirmarCerrarYLogout} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                <LogOut size={16} /> Cerrar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

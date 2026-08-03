import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { salesService } from "../services/firestoreSales";
import { formatCurrency } from "../utils/format";
import {
  ShoppingCart, Package, Users, BarChart3, AlertTriangle,
  Tag, LogOut, Menu, X, UserCircle
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, userData, isDueño, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    // Verificar si hay turno abierto
    const almacenId = userData?.almacenId;
    if (almacenId) {
      const turno = await salesService.getTurnoActivo(almacenId);
      if (turno) {
        const ventas = await salesService.getVentasTurno(almacenId, turno.id);
        const fiados = await salesService.getFiadosRecuperadosTurno(almacenId, turno.id);

        let efectivoVentas = 0;
        ventas.forEach((v) => {
          if (v.metodoPago === "efectivo") efectivoVentas += v.total || 0;
        });

        let efectivoRecuperado = 0;
        fiados.forEach((f) => {
          if (f.pagos) {
            f.pagos.forEach((p) => {
              if (p.metodo === "efectivo") efectivoRecuperado += p.monto || 0;
            });
          }
        });

        const totalEfectivo = (turno.montoInicial || 0) + efectivoVentas + efectivoRecuperado;

        const confirmar = window.confirm(
          `🧾 TURNO ABIERTO — Cierre antes de salir\n\n` +
          `Efectivo inicial: ${formatCurrency(turno.montoInicial || 0)}\n` +
          `Ventas en efectivo: ${formatCurrency(efectivoVentas)}\n` +
          `Fiados recuperados (efectivo): ${formatCurrency(efectivoRecuperado)}\n` +
          `─────────────────────\n` +
          `💰 TOTAL EFECTIVO: ${formatCurrency(totalEfectivo)}\n\n` +
          `¿Cerrar turno y salir?`
        );

        if (confirmar) {
          const ventasHoy = await salesService.getTodaySales(almacenId);
          const resumen = { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 };
          ventasHoy.forEach((v) => {
            if (resumen[v.metodoPago] !== undefined) resumen[v.metodoPago] += v.total;
          });
          await salesService.updateTurno(turno.id, {
            estado: "cerrado",
            cerradoEn: new Date().toISOString(),
            ventas: resumen,
            saldoCalculado: {
              montoInicial: turno.montoInicial || 0,
              efectivoVentas,
              efectivoRecuperado,
              totalEfectivo,
            },
          });
        } else {
          return; // No salir si cancela
        }
      }
    }
    logout();
  }

  const navItems = [
    { path: "/vender", label: "Vender", icon: ShoppingCart, public: true },
    { path: "/productos", label: "Productos", icon: Package, public: true },
    { path: "/fiados", label: "Fiados", icon: Users, public: true },
  ];

  const dueñoItems = [
    { path: "/ofertas", label: "Ofertas", icon: Tag },
    { path: "/mermas", label: "Mermas", icon: AlertTriangle },
    { path: "/informes", label: "Informes", icon: BarChart3 },
    { path: "/vendedores", label: "Vendedores", icon: UserCircle },
  ];

  const allItems = isDueño ? [...navItems, ...dueñoItems] : navItems;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="font-bold text-blue-600 text-lg">
            POS Almacén
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            {allItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {userData?.nombre || user?.email} {isDueño ? "• Dueño" : "• Vendedor"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {allItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <p className="px-3 text-xs text-gray-400 mb-1">
                {userData?.nombre || user?.email}
              </p>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOffline } from "../hooks/useOffline";
import { salesService } from "../services/firestoreSales";
import {
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  Store,
  BarChart3,
  Package,
  Users,
  Settings,
  HandCoins,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function Navbar() {
  const { isDueño, isVendedor, userData, logout, almacenId } = useAuth();
  const { isOnline, pendingCount, syncing, getOfflineTurno, addToQueue, clearOfflineTurno } = useOffline();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarCierreLogout, setMostrarCierreLogout] = useState(false);
  const [resumenLogout, setResumenLogout] = useState(null);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const navLinks = [
    { to: "/", label: "Vender", icon: Store, visible: true },
    { to: "/productos", label: "Productos", icon: Package, visible: isDueño },
    { to: "/fiados", label: "Fiados", icon: HandCoins, visible: true },
    { to: "/ofertas", label: "Ofertas", icon: Tag, visible: isDueño },
    { to: "/mermas", label: "Mermas", icon: AlertTriangle, visible: isDueño },
    { to: "/informes", label: "Informes", icon: BarChart3, visible: true },
    { to: "/vendedores", label: "Vendedores", icon: Users, visible: isDueño },
    { to: "/configuracion", label: "Configuración", icon: Settings, visible: isDueño },
  ];

  async function handleLogout() {
    if (!almacenId) {
      logout();
      return;
    }

    setLoadingLogout(true);
    try {
      // FIX: Si estamos offline, cerrar turno local antes de salir
      if (!isOnline) {
        const offlineTurno = getOfflineTurno();
        if (offlineTurno) {
          const cerrado = {
            ...offlineTurno,
            estado: "cerrado",
            cerradoEn: new Date().toISOString(),
            ventas: { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 },
          };
          addToQueue({ type: "turno_cerrar", turnoId: offlineTurno.id, data: cerrado });
          clearOfflineTurno();
        }
        logout();
        return;
      }

      // Online: flujo normal con try-catch
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
    } catch (err) {
      console.error("Error al procesar logout:", err);
      alert("Hubo un problema al verificar el turno. Se cerrará la sesión de todas formas.");
      logout();
    } finally {
      setLoadingLogout(false);
    }
  }

  async function confirmarCierreLogout() {
    if (!resumenLogout) return;
    setLoadingLogout(true);
    try {
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
    } catch (err) {
      console.error("Error cerrando turno:", err);
      alert("Error al cerrar el turno: " + (err.message || "Intenta de nuevo"));
    } finally {
      setLoadingLogout(false);
    }
  }

  return (
    <>
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <Store className="text-blue-600" size={22} />
              <span className="font-bold text-gray-800 text-lg hidden sm:inline">
                {userData?.nombreNegocio || "Almacén"}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks
                .filter((l) => l.visible)
                .map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      location.pathname === link.to
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}
            </div>

            <div className="flex items-center gap-2">
              {!isOnline && (
                <span className="hidden sm:flex items-center gap-1 text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full">
                  <WifiOff size={12} />
                  Offline
                </span>
              )}
              {isOnline && pendingCount > 0 && (
                <span className="hidden sm:flex items-center gap-1 text-blue-600 text-xs font-medium bg-blue-50 px-2 py-1 rounded-full">
                  <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                  {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
                </span>
              )}
              <button
                onClick={handleLogout}
                disabled={loadingLogout}
                className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {loadingLogout ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                <span className="hidden sm:inline">Salir</span>
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-white">
            {navLinks
              .filter((l) => l.visible)
              .map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
                    location.pathname === link.to
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
          </div>
        )}
      </nav>

      {/* Modal cierre de turno al logout */}
      {mostrarCierreLogout && resumenLogout && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-amber-500" size={24} />
              <h2 className="text-lg font-bold text-gray-800">Cerrar Turno y Salir</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Hay un turno abierto. Debes cerrarlo antes de salir.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Monto inicial</span>
                <span className="font-medium">${resumenLogout.montoInicial.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Efectivo</span>
                <span className="font-medium text-green-700">+${resumenLogout.efectivo.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tarjeta</span>
                <span className="font-medium">${resumenLogout.tarjeta.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transferencia</span>
                <span className="font-medium">${resumenLogout.transferencia.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fiado</span>
                <span className="font-medium text-amber-600">${resumenLogout.fiado.toLocaleString("es-CL")}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
                <span>Total ventas</span>
                <span>${resumenLogout.totalVentas.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex justify-between font-bold text-blue-700">
                <span>Efectivo en caja</span>
                <span>${resumenLogout.efectivoEnCaja.toLocaleString("es-CL")}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmarCierreLogout}
                disabled={loadingLogout}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingLogout ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {loadingLogout ? "Cerrando..." : "Cerrar Turno y Salir"}
              </button>
              <button
                onClick={() => { setMostrarCierreLogout(false); setResumenLogout(null); }}
                disabled={loadingLogout}
                className="px-4 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

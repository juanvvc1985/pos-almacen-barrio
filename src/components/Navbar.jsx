import { useState, useCallback } from "react";
import { LogOut, User, Store, AlertTriangle, Loader2 } from "lucide-react";
import { useTurno } from "../hooks/useTurno";

// ============================================================
// AJUSTA ESTAS IMPORTS SEGÚN TU PROYECTO
// ============================================================
// Si usas un contexto de auth:
// import { useAuth } from "../context/AuthContext";
//
// Si pasas por props o usas otro hook, cambia las líneas marcadas
// con "AUTH:" abajo.
// ============================================================

export default function Navbar({ user, logout, almacenId }) {
  // AUTH: si usas useAuth(), reemplaza las props por:
  // const { user, logout, almacenId } = useAuth();

  const vendedorId = user?.uid || user?.id || "";
  const vendedorNombre = user?.nombre || user?.displayName || user?.email || "Usuario";
  const rol = user?.rol || "vendedor"; // "dueño" | "vendedor"

  const { turno, loading: turnoLoading, cerrar } = useTurno(almacenId, vendedorId);
  const [showModal, setShowModal] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  const handleLogoutClick = useCallback(() => {
    setErrorModal("");
    if (turno) {
      setShowModal(true);
    } else {
      // Sin turno abierto: salir directo
      logout?.();
    }
  }, [turno, logout]);

  const handleCancelar = useCallback(() => {
    setShowModal(false);
    setErrorModal("");
  }, []);

  const handleAceptarCerrar = useCallback(async () => {
    if (cerrando) return; // evitar doble click
    setCerrando(true);
    setErrorModal("");

    try {
      await cerrar(); // <-- ESTE AWAIT ES LA CLAVE
      setShowModal(false);
      // Solo después de cerrar el turno hacemos logout
      logout?.();
    } catch (err) {
      console.error("Error cerrando turno:", err);
      setErrorModal(err?.message || "No se pudo cerrar el turno. Intenta de nuevo.");
    } finally {
      setCerrando(false);
    }
  }, [cerrando, cerrar, logout]);

  const handleCerrarTurnoSolo = useCallback(async () => {
    if (cerrando) return;
    setCerrando(true);
    setErrorModal("");
    try {
      await cerrar();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setErrorModal(err?.message || "Error al cerrar turno");
    } finally {
      setCerrando(false);
    }
  }, [cerrando, cerrar]);

  const efectivoInicial = turno?.efectivoInicial || 0;
  const ventasEfectivo = turno?.ventasEfectivo || 0;
  const fiadosRecuperados = turno?.fiadosRecuperados || 0;
  const totalEfectivo = turno?.totalEfectivo || efectivoInicial + ventasEfectivo + fiadosRecuperados;

  return (
    <>
      <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Store size={22} className="text-blue-400" />
          <span className="font-bold text-lg tracking-tight">POS Almacén</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Indicador de turno */}
          {turno && (
            <button
              onClick={handleCerrarTurnoSolo}
              disabled={cerrando}
              className="hidden sm:flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white px-3 py-1.5 rounded-full transition"
            >
              {cerrando ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
              Turno abierto — Cerrar
            </button>
          )}

          <div className="flex items-center gap-2 text-sm text-slate-300">
            <User size={16} />
            <span className="hidden sm:inline">
              {vendedorNombre}
              {rol === "dueño" && (
                <span className="ml-1.5 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">
                  Dueño
                </span>
              )}
            </span>
          </div>

          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </nav>

      {/* Modal de cierre de turno */}
      {showModal && turno && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 text-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-slate-700 px-5 py-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              <h3 className="font-semibold text-sm">TURNO ABIERTO — Cierre antes de salir</h3>
            </div>

            <div className="px-5 py-4 space-y-3 text-sm">
              {errorModal && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-3 py-2 rounded-lg text-xs">
                  {errorModal}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Efectivo inicial:</span>
                  <span className="font-mono text-white">
                    ${efectivoInicial.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Ventas en efectivo:</span>
                  <span className="font-mono text-emerald-400">
                    +${ventasEfectivo.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Fiados recuperados (efectivo):</span>
                  <span className="font-mono text-emerald-400">
                    +${fiadosRecuperados.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="text-amber-400">💰</span> TOTAL EFECTIVO:
                  </span>
                  <span className="font-mono text-amber-400">
                    ${totalEfectivo.toLocaleString("es-CL")}
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-center pt-1">
                ¿Cerrar turno y salir?
              </p>
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={handleAceptarCerrar}
                disabled={cerrando}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2.5 rounded-xl font-medium transition"
              >
                {cerrando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Cerrando...
                  </>
                ) : (
                  "Aceptar"
                )}
              </button>
              <button
                onClick={handleCancelar}
                disabled={cerrando}
                className="flex-1 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-white py-2.5 rounded-xl font-medium transition"
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

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { verificarEstadoV2 } from "../services/paymentService";
import { Clock, AlertTriangle, X, Crown, Zap, Gift } from "lucide-react";

export default function TrialBanner() {
  const { userData } = useAuth();
  const [estado, setEstado] = useState(null);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    if (!userData) return;
    const info = verificarEstadoV2(userData);
    setEstado(info);
  }, [userData]);

  if (!estado || cerrado) return null;

  // No mostrar banner si está en plan pagado
  if (estado.estado === "basico" || estado.estado === "pro") return null;

  // Banner rojo si está suspendido
  if (estado.suspendido) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <AlertTriangle size={20} />
          <div className="flex-1">
            <p className="font-bold text-sm">{estado.mensaje}</p>
            <p className="text-xs text-red-100">
              Tu periodo de prueba y plan gratuito han finalizado. Ve a Configuración → Plan para activar uno.
            </p>
          </div>
          <button
            onClick={() => setCerrado(true)}
            className="p-1 hover:bg-red-700 rounded transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Banner morado para Trial Pro (últimos 5 días = urgente)
  if (estado.estado === "trial_pro") {
    const esUrgente = estado.diasRestantes <= 5;
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className={`${esUrgente ? "bg-amber-500" : "bg-purple-600"} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}>
          <Crown size={18} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{estado.mensaje}</p>
            <p className="text-xs opacity-90">
              Tienes acceso completo al Plan Pro. Luego vendrán 6 meses gratis.
            </p>
          </div>
          <button
            onClick={() => setCerrado(true)}
            className="p-1 hover:bg-white/20 rounded transition shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Banner verde para Pro Gratis (últimos 15 días = urgente)
  if (estado.estado === "pro_gratis") {
    const esUrgente = estado.diasRestantes <= 15;
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className={`${esUrgente ? "bg-amber-500" : "bg-green-600"} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}>
          <Gift size={18} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{estado.mensaje}</p>
            <p className="text-xs opacity-90">
              Disfruta de Plan Pro gratis como agradecimiento por ser beta tester.
            </p>
          </div>
          <button
            onClick={() => setCerrado(true)}
            className="p-1 hover:bg-white/20 rounded transition shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

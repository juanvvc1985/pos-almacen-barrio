import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { 
  PRECIOS, formatMoney, calcularCompensacion, activarPlan 
} from "../services/paymentService";
import { 
  X, Crown, Zap, ArrowRight, Check, Loader2, Calculator 
} from "lucide-react";

export default function PlanUpgrade({ onClose }) {
  const { user, userData } = useAuth();
  const [planDestino, setPlanDestino] = useState("pro");
  const [periodoDestino, setPeriodoDestino] = useState("mensual");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  const planActual = userData?.plan || "basico";
  const periodoActual = userData?.planPeriodo || "mensual";
  const fechaInicioActual = userData?.planStartedAt || new Date().toISOString();

  // Calcular compensación
  const compensacion = calcularCompensacion(
    planActual, periodoActual, planDestino, periodoDestino, fechaInicioActual
  );

  async function handleUpgrade() {
    if (!user || !userData?.almacenId) return;
    setLoading(true);
    setError("");

    try {
      // Simulación de pago de la compensación
      await new Promise(r => setTimeout(r, 1500));

      await activarPlan(user.uid, userData.almacenId, planDestino, periodoDestino, {
        monto: compensacion.monto,
        metodo: "simulado_upgrade",
        transactionId: `upg_${Date.now()}`,
      });

      setExito(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al procesar el upgrade.");
    } finally {
      setLoading(false);
    }
  }

  if (exito) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <Check className="w-14 h-14 text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">¡Upgrade exitoso!</h3>
          <p className="text-gray-600">
            Ahora tienes el plan <strong>{PRECIOS[planDestino].label}</strong>.
          </p>
          <p className="text-sm text-gray-400 mt-3">Actualizando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Upgrade de Plan
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan actual */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Plan actual</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{PRECIOS[planActual]?.label || planActual}</p>
                <p className="text-sm text-gray-500">
                  {periodoActual === "anual" ? "Pago anual" : "Pago mensual"} • 
                  Desde {new Date(fechaInicioActual).toLocaleDateString("es-CL")}
                </p>
              </div>
              <span className="text-lg font-bold text-gray-800">
                {formatMoney(PRECIOS[planActual]?.[periodoActual] || 0)}
              </span>
            </div>
          </div>

          {/* Flecha */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Plan destino */}
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-3">Nuevo plan</p>

            {/* Selector de plan */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setPlanDestino("pro")}
                className={`p-3 rounded-xl border-2 text-left transition ${
                  planDestino === "pro" 
                    ? "border-purple-500 bg-purple-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Crown className="w-5 h-5 text-purple-600 mb-1" />
                <p className="font-bold text-sm">Plan Pro</p>
                <p className="text-xs text-gray-500">Todo ilimitado</p>
              </button>
            </div>

            {/* Selector de periodo */}
            <div className="bg-gray-100 rounded-lg p-1 inline-flex w-full">
              <button
                onClick={() => setPeriodoDestino("mensual")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  periodoDestino === "mensual" 
                    ? "bg-white text-gray-800 shadow-sm" 
                    : "text-gray-500"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setPeriodoDestino("anual")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                  periodoDestino === "anual" 
                    ? "bg-white text-gray-800 shadow-sm" 
                    : "text-gray-500"
                }`}
              >
                Anual
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </div>

          {/* Cálculo de compensación */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-bold text-blue-800">Cálculo de compensación</p>
            </div>
            <p className="text-sm text-blue-700 mb-3">{compensacion.mensaje}</p>

            {compensacion.prorrateo && compensacion.detalle && (
              <div className="text-xs text-blue-600 space-y-1">
                <div className="flex justify-between">
                  <span>Precio nuevo ({PRECIOS[planDestino].label} {periodoDestino})</span>
                  <span>{formatMoney(compensacion.detalle.precioNuevo)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor restante de tu plan actual</span>
                  <span className="text-green-700">-{formatMoney(compensacion.detalle.valorRestante)}</span>
                </div>
                <div className="border-t border-blue-200 pt-1 flex justify-between font-bold">
                  <span>Total a pagar ahora</span>
                  <span>{formatMoney(compensacion.monto)}</span>
                </div>
              </div>
            )}

            {!compensacion.prorrateo && (
              <div className="text-xs text-blue-600 space-y-1">
                <div className="flex justify-between">
                  <span>{PRECIOS[planDestino].label} {periodoDestino}</span>
                  <span>{formatMoney(PRECIOS[planDestino][periodoDestino])}</span>
                </div>
                <div className="flex justify-between">
                  <span>{PRECIOS[planActual].label} {periodoActual} (actual)</span>
                  <span className="text-green-700">-{formatMoney(PRECIOS[planActual][periodoActual])}</span>
                </div>
                <div className="border-t border-blue-200 pt-1 flex justify-between font-bold">
                  <span>Diferencia a pagar</span>
                  <span>{formatMoney(compensacion.monto)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Detalle del nuevo plan */}
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Incluye Plan Pro</p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Productos ilimitados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Vendedores ilimitados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Reportes avanzados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Multi-sucursal</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Ofertas y promociones</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading || compensacion.monto === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
            ) : (
              <><Zap size={18} /> {compensacion.monto > 0 
                ? `Pagar ${formatMoney(compensacion.monto)} y upgradear` 
                : "Activar upgrade gratuito"}
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            El upgrade es inmediato. Se prorratea el tiempo restante de tu plan actual.
          </p>
        </div>
      </div>
    </div>
  );
}

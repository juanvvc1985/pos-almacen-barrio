import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { PRECIOS, formatMoney, activarPlan } from "../services/paymentService";
import { useNavigate } from "react-router-dom";
import { 
  Crown, Zap, Check, Loader2, Calendar, CreditCard, 
  AlertTriangle, ArrowRight, ShieldCheck, WifiOff 
} from "lucide-react";

export default function PaymentPortal() {
  const { user, userData, logout, isSuspendido, suscripcionInfo } = useAuth();
  const navigate = useNavigate();
  const [planSeleccionado, setPlanSeleccionado] = useState("basico");
  const [periodo, setPeriodo] = useState("mensual");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  // Si no está suspendido, redirigir al dashboard
  useEffect(() => {
    if (!isSuspendido && userData?.plan && userData.plan !== "suspendido") {
      navigate("/");
    }
  }, [isSuspendido, userData, navigate]);

  const precioActual = PRECIOS[planSeleccionado][periodo];
  const ahorroAnual = periodo === "anual" 
    ? Math.round((PRECIOS[planSeleccionado].mensual * 12 - PRECIOS[planSeleccionado].anual))
    : 0;

  async function handlePagar() {
    if (!user || !userData?.almacenId) return;
    setLoading(true);
    setError("");

    try {
      // 🔥 SIMULACIÓN: En producción, aquí iría Stripe/MercadoPago
      // Se abre el checkout, el usuario paga, y al confirmar se llama activarPlan

      // Simulamos 2 segundos de "procesando pago"
      await new Promise(r => setTimeout(r, 2000));

      await activarPlan(user.uid, userData.almacenId, planSeleccionado, periodo, {
        monto: precioActual,
        metodo: "simulado",
        transactionId: `sim_${Date.now()}`,
      });

      setExito(true);
      setTimeout(() => {
        window.location.reload(); // Recargar para que useAuth detecte el nuevo plan
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al procesar el pago. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Plan activado!</h2>
          <p className="text-gray-600">
            Tu plan <strong>{PRECIOS[planSeleccionado].label}</strong> ha sido activado exitosamente.
          </p>
          <p className="text-sm text-gray-400 mt-4">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">POS Almacén de Barrio</h1>
          </div>
          <button 
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Alerta de suspensión */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800">Tu periodo de prueba ha finalizado</h3>
            <p className="text-sm text-red-700 mt-1">
              Gracias por ser beta tester. Tu acceso gratuito ha terminado. 
              Activa un plan para seguir usando el sistema.
            </p>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Elige tu plan</h2>
          <p className="text-gray-500 mt-2">Sin contratos. Cancela cuando quieras.</p>
        </div>

        {/* Selector de periodo */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setPeriodo("mensual")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                periodo === "mensual" 
                  ? "bg-white text-gray-800 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setPeriodo("anual")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                periodo === "anual" 
                  ? "bg-white text-gray-800 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Anual
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                Ahorra 2 meses
              </span>
            </button>
          </div>
        </div>

        {/* Cards de planes */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Plan Básico */}
          <button
            onClick={() => setPlanSeleccionado("basico")}
            className={`relative bg-white rounded-2xl border-2 p-6 text-left transition hover:shadow-lg ${
              planSeleccionado === "basico" 
                ? "border-blue-500 shadow-md" 
                : "border-gray-200"
            }`}
          >
            {planSeleccionado === "basico" && (
              <div className="absolute -top-3 left-6 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Seleccionado
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Plan Básico</h3>
                <p className="text-xs text-gray-500">Para almacenes de barrio</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-800">{formatMoney(PRECIOS.basico[periodo])}</span>
              <span className="text-gray-500">/{periodo === "mensual" ? "mes" : "año"}</span>
              {periodo === "anual" && (
                <p className="text-xs text-green-600 mt-1">
                  Equivalente a {formatMoney(Math.round(PRECIOS.basico.anual / 12))}/mes
                </p>
              )}
            </div>

            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Hasta 500 productos</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 1 vendedor</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> POS 100% offline</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Ventas y fiados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Control de stock</li>
            </ul>
          </button>

          {/* Plan Pro */}
          <button
            onClick={() => setPlanSeleccionado("pro")}
            className={`relative bg-white rounded-2xl border-2 p-6 text-left transition hover:shadow-lg ${
              planSeleccionado === "pro" 
                ? "border-purple-500 shadow-md" 
                : "border-gray-200"
            }`}
          >
            {planSeleccionado === "pro" && (
              <div className="absolute -top-3 left-6 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Seleccionado
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                Recomendado
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Plan Pro</h3>
                <p className="text-xs text-gray-500">Para negocios en crecimiento</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-800">{formatMoney(PRECIOS.pro[periodo])}</span>
              <span className="text-gray-500">/{periodo === "mensual" ? "mes" : "año"}</span>
              {periodo === "anual" && (
                <p className="text-xs text-green-600 mt-1">
                  Equivalente a {formatMoney(Math.round(PRECIOS.pro.anual / 12))}/mes
                </p>
              )}
            </div>

            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> <strong>Productos ilimitados</strong></li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> <strong>Vendedores ilimitados</strong></li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> POS 100% offline</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Reportes avanzados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Multi-sucursal</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Ofertas y promociones</li>
            </ul>
          </button>
        </div>

        {/* Resumen de pago */}
        <div className="max-w-md mx-auto mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-bold text-gray-800 mb-4">Resumen</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium">{PRECIOS[planSeleccionado].label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Periodo</span>
              <span className="font-medium">{periodo === "mensual" ? "Mensual" : "Anual (12 meses)"}</span>
            </div>
            {ahorroAnual > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Ahorro anual</span>
                <span className="font-medium">{formatMoney(ahorroAnual)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total a pagar</span>
              <span>{formatMoney(precioActual)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handlePagar}
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
            ) : (
              <><CreditCard size={18} /> Pagar {formatMoney(precioActual)}</>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            🔒 Pago seguro. En producción se conectará con Webpay o MercadoPago.
            <br/>Por ahora es una simulación para pruebas.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h3 className="font-bold text-gray-800 mb-4">¿Tienes dudas?</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-left text-sm">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-800 mb-1">¿Puedo cambiar de plan después?</p>
              <p className="text-gray-500">Sí. Puedes upgradear de Básico a Pro pagando solo la diferencia.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-800 mb-1">¿Qué pasa si no pago?</p>
              <p className="text-gray-500">Tu cuenta se suspende pero no se borra. Al pagar, recuperas todo.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-800 mb-1">¿Pago anual tiene descuento?</p>
              <p className="text-gray-500">Sí. Pagas 10 meses y usas 12. Es un ahorro de 2 meses gratis.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-800 mb-1">¿Mis datos están seguros?</p>
              <p className="text-gray-500">Sí. Toda la información se guarda en Firebase con encriptación.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

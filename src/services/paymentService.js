import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

// ─── PRECIOS ───
export const PRECIOS = {
  basico: {
    mensual: 5990,
    anual: 59900,   // paga 10 meses, usa 12
    label: "Básico",
    descripcion: "Hasta 500 productos, 1 vendedor, POS offline",
  },
  pro: {
    mensual: 11990,
    anual: 119900,  // paga 10 meses, usa 12
    label: "Pro",
    descripcion: "Productos ilimitados, vendedores ilimitados, reportes avanzados, multi-sucursal",
  },
};

// ─── FECHAS ───
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// ─── CALCULAR PRÓXIMA FECHA DE RENOVACIÓN ───
export function calcularProximaRenovacion(fechaInicio, periodo) {
  const inicio = new Date(fechaInicio);
  if (periodo === "anual") {
    return addMonths(inicio, 12);
  }
  return addMonths(inicio, 1);
}

// ─── CALCULAR COMPENSACIÓN DE UPGRADE ───
/**
 * Calcula cuánto debe pagar un usuario que quiere upgradear de plan.
 * 
 * Escenarios:
 * 1. Básico mensual → Pro mensual: paga diferencia mensual ($6.000) desde YA
 * 2. Básico anual → Pro anual: paga diferencia anual ($60.000) desde YA  
 * 3. Básico mensual → Pro anual: paga Pro anual completo ($119.900) - lo pagado prorrateado
 * 4. A mitad de ciclo: se calcula prorrateo simple
 */
export function calcularCompensacion(planActual, periodoActual, planNuevo, periodoNuevo, fechaInicioActual) {
  const precioActual = PRECIOS[planActual][periodoActual];
  const precioNuevo = PRECIOS[planNuevo][periodoNuevo];

  // Si es upgrade dentro del mismo periodo (mensual→mensual o anual→anual)
  if (periodoActual === periodoNuevo) {
    const diferencia = precioNuevo - precioActual;
    return {
      tipo: "diferencia",
      monto: Math.max(0, diferencia),
      mensaje: diferencia > 0 
        ? `Paga la diferencia: ${formatMoney(diferencia)} ${periodoNuevo === "mensual" ? "/mes" : "al año"}`
        : "Sin costo adicional",
      prorrateo: false,
    };
  }

  // Si cambia de periodo (mensual→anual o anual→mensual)
  // Calcular días transcurridos del ciclo actual
  const hoy = new Date();
  const inicio = new Date(fechaInicioActual);
  const diasTotales = periodoActual === "anual" ? 365 : 30;
  const msTranscurridos = hoy - inicio;
  const diasTranscurridos = Math.max(0, Math.floor(msTranscurridos / (1000 * 60 * 60 * 24)));
  const diasRestantes = Math.max(0, diasTotales - diasTranscurridos);

  // Valor restante del plan actual (prorrateo simple)
  const valorRestante = Math.round((precioActual / diasTotales) * diasRestantes);

  // Debe pagar: precio nuevo - valor restante
  const montoAPagar = Math.max(0, precioNuevo - valorRestante);

  return {
    tipo: "prorrateo",
    monto: montoAPagar,
    mensaje: `Cambio de plan: pagas ${formatMoney(montoAPagar)} (se descuentan ${formatMoney(valorRestante)} de tu plan actual)`,
    prorrateo: true,
    detalle: {
      precioNuevo,
      valorRestante,
      diasRestantes,
    },
  };
}

// ─── FORMATEAR DINERO ───
export function formatMoney(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(valor);
}

// ─── ACTIVAR PLAN (simulado - luego conectas Stripe/MercadoPago) ───
/**
 * Activa un plan para un usuario.
 * En producción, esto se llamaría DESPUÉS de confirmar el pago con la pasarela.
 */
export async function activarPlan(uid, almacenId, plan, periodo, datosPago = {}) {
  const ahora = new Date();
  const planStartedAt = ahora.toISOString();
  const planExpiresAt = calcularProximaRenovacion(ahora, periodo).toISOString();

  const userUpdates = {
    plan,
    planPeriodo: periodo,
    planStartedAt,
    planExpiresAt,
    planActivatedAt: ahora.toISOString(),
    suspendido: false,
    updatedAt: ahora.toISOString(),
    ultimoPago: {
      plan,
      periodo,
      monto: datosPago.monto || PRECIOS[plan][periodo],
      fecha: ahora.toISOString(),
      metodo: datosPago.metodo || "pendiente",
      transactionId: datosPago.transactionId || null,
    },
  };

  const almacenUpdates = {
    plan,
    planExpiresAt,
    updatedAt: ahora.toISOString(),
  };

  await updateDoc(doc(db, "users", uid), userUpdates);
  await updateDoc(doc(db, "almacenes", almacenId), almacenUpdates);

  return { success: true, plan, periodo, planExpiresAt };
}

// ─── VERIFICAR ESTADO DE SUSCRIPCIÓN V2 (reemplaza a betaAuth) ───
export function verificarEstadoV2(userData) {
  const ahora = new Date();
  const plan = userData?.plan || "suspendido";
  const trialExpiresAt = userData?.trialExpiresAt ? new Date(userData.trialExpiresAt) : null;
  const proGratisUntil = userData?.proGratisUntil ? new Date(userData.proGratisUntil) : null;
  const planExpiresAt = userData?.planExpiresAt ? new Date(userData.planExpiresAt) : null;

  const msPorDia = 1000 * 60 * 60 * 24;

  // Fase 1: Trial Pro (30 días)
  if (plan === "trial_pro" && trialExpiresAt && ahora < trialExpiresAt) {
    const diasRestantes = Math.max(0, Math.ceil((trialExpiresAt - ahora) / msPorDia));
    return {
      estado: "trial_pro",
      activo: true,
      diasRestantes,
      mensaje: `Periodo de prueba PRO: ${diasRestantes} días restantes`,
      planReal: "pro",
      suspendido: false,
    };
  }

  // Fase 2: Pro Gratis (6 meses después del trial)
  if ((plan === "trial_pro" || plan === "pro_gratis") && proGratisUntil && ahora < proGratisUntil) {
    const diasRestantes = Math.max(0, Math.ceil((proGratisUntil - ahora) / msPorDia));
    return {
      estado: "pro_gratis",
      activo: true,
      diasRestantes,
      mensaje: `Plan Pro gratis (beta): ${diasRestantes} días restantes`,
      planReal: "pro",
      suspendido: false,
      necesitaUpgrade: plan === "trial_pro", // Marcar para auto-upgrade
    };
  }

  // Fase 3: Plan pagado (básico o pro)
  if ((plan === "basico" || plan === "pro") && planExpiresAt && ahora < planExpiresAt) {
    const diasRestantes = Math.max(0, Math.ceil((planExpiresAt - ahora) / msPorDia));
    return {
      estado: plan,
      activo: true,
      diasRestantes,
      mensaje: `Plan ${PRECIOS[plan].label} activo. Renueva en ${diasRestantes} días.`,
      planReal: plan,
      suspendido: false,
    };
  }

  // Fase 4: Suspendido
  return {
    estado: "suspendido",
    activo: false,
    diasRestantes: 0,
    mensaje: "Tu plan ha finalizado. Activa un plan para continuar.",
    planReal: null,
    suspendido: true,
  };
}

// ─── AUTO-UPGRADE ENTRE FASES ───
export async function autoUpgradeFases(uid, userData) {
  const ahora = new Date();
  const plan = userData?.plan;
  const trialExpiresAt = userData?.trialExpiresAt ? new Date(userData.trialExpiresAt) : null;
  const proGratisUntil = userData?.proGratisUntil ? new Date(userData.proGratisUntil) : null;

  // Trial Pro expiró → pasar a Pro Gratis
  if (plan === "trial_pro" && trialExpiresAt && ahora >= trialExpiresAt) {
    if (proGratisUntil && ahora < proGratisUntil) {
      await updateDoc(doc(db, "users", uid), {
        plan: "pro_gratis",
        faseUpgradedAt: ahora.toISOString(),
        updatedAt: ahora.toISOString(),
      });
      await updateDoc(doc(db, "almacenes", userData.almacenId), {
        plan: "pro_gratis",
        updatedAt: ahora.toISOString(),
      });
      return "pro_gratis";
    }
  }

  // Pro Gratis expiró → suspender
  if (plan === "pro_gratis" && proGratisUntil && ahora >= proGratisUntil) {
    await updateDoc(doc(db, "users", uid), {
      plan: "suspendido",
      suspendedAt: ahora.toISOString(),
      updatedAt: ahora.toISOString(),
    });
    await updateDoc(doc(db, "almacenes", userData.almacenId), {
      plan: "suspendido",
      updatedAt: ahora.toISOString(),
    });
    return "suspendido";
  }

  // Plan pagado expiró → suspender
  if ((plan === "basico" || plan === "pro") && userData?.planExpiresAt) {
    const exp = new Date(userData.planExpiresAt);
    if (ahora >= exp) {
      await updateDoc(doc(db, "users", uid), {
        plan: "suspendido",
        suspendedAt: ahora.toISOString(),
        updatedAt: ahora.toISOString(),
      });
      await updateDoc(doc(db, "almacenes", userData.almacenId), {
        plan: "suspendido",
        updatedAt: ahora.toISOString(),
      });
      return "suspendido";
    }
  }

  return plan;
}

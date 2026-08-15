import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

// 🔥 FIX #10: Exportaciones faltantes para PlanUpgrade y PaymentPortal
export const PRECIOS = {
  basico: { label: "Plan Básico", mensual: 5990, anual: 59900 },
  pro: { label: "Plan Pro", mensual: 11990, anual: 119900 }
};

export function formatMoney(val) {
  if (val === undefined || val === null) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", minimumFractionDigits: 0
  }).format(val);
}

export function calcularCompensacion(planActual, periodoActual, planDestino, periodoDestino, fechaInicioActual) {
  const precioNuevo = PRECIOS[planDestino]?.[periodoDestino] || 0;
  const precioActual = PRECIOS[planActual]?.[periodoActual] || 0;
  const inicio = new Date(fechaInicioActual).getTime();
  const ahora = Date.now();
  const diasTranscurridos = Math.max(0, Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24)));
  const diasTotales = periodoActual === "anual" ? 365 : 30;
  const diasRestantes = Math.max(0, diasTotales - diasTranscurridos);
  const valorRestante = (precioActual / diasTotales) * diasRestantes;
  
  const monto = Math.max(0, precioNuevo - valorRestante);
  return {
    monto: Math.round(monto),
    mensaje: `Se prorratean los ${diasRestantes} días restantes de tu plan actual.`,
    prorrateo: true,
    detalle: { precioNuevo, valorRestante: Math.round(valorRestante) }
  };
}

export async function activarPlan(uid, almacenId, plan, periodo, pagoData) {
  const ahora = Date.now();
  const dias = periodo === "anual" ? 365 : 30;
  const planExpiresAt = ahora + (dias * 24 * 60 * 60 * 1000);
  
  await updateDoc(doc(db, "users", uid), {
    plan,
    planPeriodo: periodo,
    planStartedAt: new Date(ahora).toISOString(),
    planExpiresAt: new Date(planExpiresAt).toISOString(),
    ultimoPago: pagoData,
    updatedAt: serverTimestamp()
  });
  
  await updateDoc(doc(db, "almacenes", almacenId), {
    plan,
    updatedAt: serverTimestamp()
  });
}

// 🔥 FIX #1: Comparación de fechas segura (convierte strings ISO a timestamps)
export async function verificarEstadoV2(userData) {
  // Acepta objeto userData directo (evita lectura extra a Firestore)
  const u = userData;
  if (!u) return { estado: "no_encontrado", activo: false, suspendido: true, mensaje: "Usuario no encontrado" };
  
  const ahora = Date.now();
  const plan = u.plan || "basico";

  if (u.role === "admin" || u.isAdmin === true) {
    return { estado: "admin", activo: true, suspendido: false, plan: "admin", mensaje: "Admin ilimitado" };
  }

  const tieneFechas = u.trialExpiresAt || u.proGratisUntil || u.planExpiresAt;
  if (!tieneFechas) {
    return { estado: "activo_legacy", activo: true, suspendido: false, plan, mensaje: "Plan activo (usuario legacy)" };
  }

  // 🔥 FIX #1: Usamos new Date().getTime() para comparar correctamente strings ISO
  if (plan === "trial" && u.trialExpiresAt) {
    const expira = new Date(u.trialExpiresAt).getTime();
    const activo = ahora < expira;
    return { estado: activo ? "trial_activo" : "trial_expirado", activo, suspendido: !activo, plan: "trial", mensaje: activo ? "Trial activo" : "Trial expirado" };
  }

  if (plan === "pro_gratis" && u.proGratisUntil) {
    const expira = new Date(u.proGratisUntil).getTime();
    const activo = ahora < expira;
    return { estado: activo ? "pro_gratis_activo" : "pro_gratis_expirado", activo, suspendido: !activo, plan: "pro_gratis", mensaje: activo ? "Pro gratis activo" : "Pro gratis expirado" };
  }

  if ((plan === "basico" || plan === "pro") && u.planExpiresAt) {
    const expira = new Date(u.planExpiresAt).getTime();
    const activo = ahora < expira;
    return { estado: activo ? `${plan}_activo` : `${plan}_expirado`, activo, suspendido: !activo, plan, mensaje: activo ? `Plan ${plan} activo` : `Plan ${plan} expirado` };
  }

  return { estado: "activo_fallback", activo: true, suspendido: false, plan, mensaje: "Plan activo (fallback)" };
}

export async function autoUpgradeFases(uid, userData) {
  const estado = await verificarEstadoV2(userData);
  const ref = doc(db, "users", uid);
  if (estado.estado === "trial_expirado") {
    await updateDoc(ref, { plan: "basico", trialExpirado: true, updatedAt: serverTimestamp() });
  }
  if (estado.estado === "pro_gratis_expirado") {
    await updateDoc(ref, { plan: "basico", proGratisExpirado: true, updatedAt: serverTimestamp() });
  }
  return estado;
}

export async function activarTrial(uid) {
  const trialExpiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { plan: "trial", trialExpiresAt: new Date(trialExpiresAt).toISOString(), trialIniciado: serverTimestamp(), updatedAt: serverTimestamp() });
  return trialExpiresAt;
}

export async function activarProGratis(uid, dias = 30) {
  const proGratisUntil = Date.now() + dias * 24 * 60 * 60 * 1000;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { plan: "pro_gratis", proGratisUntil: new Date(proGratisUntil).toISOString(), proGratisActivado: serverTimestamp(), updatedAt: serverTimestamp() });
  return proGratisUntil;
}

// 🔥 FIX #2: Unificado a colección "codigosBeta"
export async function validarCodigoBeta(codigo) {
  const ref = doc(db, "codigosBeta", codigo.toUpperCase().trim());
  const snap = await getDoc(ref);
  if (!snap.exists()) return { valido: false, mensaje: "Código no encontrado" };
  const data = snap.data();
  if (data.usado) return { valido: false, mensaje: "Código ya utilizado" };
  if (data.expiresAt && Date.now() > new Date(data.expiresAt).getTime()) return { valido: false, mensaje: "Código expirado" };
  return { valido: true, data, mensaje: "Código válido" };
}

export async function usarCodigoBeta(codigo, uid) {
  const ref = doc(db, "codigosBeta", codigo.toUpperCase().trim());
  await updateDoc(ref, { usado: true, usadoPor: uid, usadoEn: serverTimestamp() });
}
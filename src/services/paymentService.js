// services/paymentService.js
// ─── Compatibilidad hacia atrás: usuarios antiguos sin fechas de expiración se consideran ACTIVOS ───

import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * Verifica el estado de suscripción de un usuario.
 * Compatibilidad: usuarios creados antes de los cambios de pago
 * (sin trialExpiresAt, proGratisUntil ni planExpiresAt) se consideran ACTIVOS.
 */
export async function verificarEstadoV2(uid) {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { estado: "no_encontrado", activo: false, suspendido: true, mensaje: "Usuario no encontrado" };
  }

  const u = snap.data();
  const ahora = Date.now();
  const plan = u.plan || "basico";

  // ─── ADMIN SIEMPRE ACTIVO ───
  if (u.role === "admin" || u.isAdmin === true) {
    return { estado: "admin", activo: true, suspendido: false, plan: "admin", mensaje: "Admin ilimitado" };
  }

  // ─── COMPATIBILIDAD: usuarios antiguos sin fechas de expiración ───
  const tieneFechas = u.trialExpiresAt || u.proGratisUntil || u.planExpiresAt;
  if (!tieneFechas) {
    // Usuario antiguo: activo con su plan actual
    return {
      estado: "activo_legacy",
      activo: true,
      suspendido: false,
      plan: plan,
      mensaje: "Plan activo (usuario legacy)"
    };
  }

  // ─── TRIAL ───
  if (plan === "trial" && u.trialExpiresAt) {
    const activo = ahora < u.trialExpiresAt;
    return {
      estado: activo ? "trial_activo" : "trial_expirado",
      activo,
      suspendido: !activo,
      plan: "trial",
      mensaje: activo ? "Trial activo" : "Trial expirado"
    };
  }

  // ─── PRO GRATIS ───
  if (plan === "pro_gratis" && u.proGratisUntil) {
    const activo = ahora < u.proGratisUntil;
    return {
      estado: activo ? "pro_gratis_activo" : "pro_gratis_expirado",
      activo,
      suspendido: !activo,
      plan: "pro_gratis",
      mensaje: activo ? "Pro gratis activo" : "Pro gratis expirado"
    };
  }

  // ─── BÁSICO / PRO CON PLAN EXPIRADO ───
  if ((plan === "basico" || plan === "pro") && u.planExpiresAt) {
    const activo = ahora < u.planExpiresAt;
    return {
      estado: activo ? `${plan}_activo` : `${plan}_expirado`,
      activo,
      suspendido: !activo,
      plan,
      mensaje: activo ? `Plan ${plan} activo` : `Plan ${plan} expirado`
    };
  }

  // ─── Fallback: si tiene fechas pero ninguna condición aplica, activo por defecto ───
  return {
    estado: "activo_fallback",
    activo: true,
    suspendido: false,
    plan: plan,
    mensaje: "Plan activo (fallback)"
  };
}

/**
 * Actualiza automáticamente la fase de suscripción según el estado actual.
 */
export async function autoUpgradeFases(uid) {
  const estado = await verificarEstadoV2(uid);
  const ref = doc(db, "usuarios", uid);

  if (estado.estado === "trial_expirado") {
    await updateDoc(ref, {
      plan: "basico",
      trialExpirado: true,
      updatedAt: serverTimestamp()
    });
  }

  if (estado.estado === "pro_gratis_expirado") {
    await updateDoc(ref, {
      plan: "basico",
      proGratisExpirado: true,
      updatedAt: serverTimestamp()
    });
  }

  return estado;
}

/**
 * Activa trial de 14 días para un nuevo usuario.
 */
export async function activarTrial(uid) {
  const trialExpiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000;
  const ref = doc(db, "usuarios", uid);
  await updateDoc(ref, {
    plan: "trial",
    trialExpiresAt,
    trialIniciado: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return trialExpiresAt;
}

/**
 * Activa plan Pro gratis por N días (para códigos beta).
 */
export async function activarProGratis(uid, dias = 30) {
  const proGratisUntil = Date.now() + dias * 24 * 60 * 60 * 1000;
  const ref = doc(db, "usuarios", uid);
  await updateDoc(ref, {
    plan: "pro_gratis",
    proGratisUntil,
    proGratisActivado: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return proGratisUntil;
}

/**
 * Verifica si un código beta es válido y no ha sido usado.
 */
export async function validarCodigoBeta(codigo) {
  const ref = doc(db, "codigosBeta", codigo.toUpperCase().trim());
  const snap = await getDoc(ref);
  if (!snap.exists()) return { valido: false, mensaje: "Código no encontrado" };

  const data = snap.data();
  if (data.usado) return { valido: false, mensaje: "Código ya utilizado" };
  if (data.expiresAt && Date.now() > data.expiresAt) return { valido: false, mensaje: "Código expirado" };

  return { valido: true, data, mensaje: "Código válido" };
}

/**
 * Marca un código beta como usado por un usuario.
 */
export async function usarCodigoBeta(codigo, uid) {
  const ref = doc(db, "codigosBeta", codigo.toUpperCase().trim());
  await updateDoc(ref, {
    usado: true,
    usadoPor: uid,
    usadoEn: serverTimestamp()
  });
}

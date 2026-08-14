import { auth, db } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const ROLES = {
  DUEÑO: "dueño",
};

function getTrialDates() {
  const now = new Date();
  const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const proGratisUntil = new Date(trialExpiresAt.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
  return {
    trialStartedAt: now.toISOString(),
    trialExpiresAt: trialExpiresAt.toISOString(),
    proGratisUntil: proGratisUntil.toISOString(),
  };
}

// ─── VALIDAR CÓDIGO BETA ───
export async function validarCodigoBeta(codigo) {
  if (!codigo || codigo.trim() === "") {
    return { valido: false, mensaje: "Ingresa un código de invitación." };
  }

  const cleanCode = codigo.trim().toUpperCase();
  const codeRef = doc(db, "beta_codes", cleanCode);
  const snap = await getDoc(codeRef);

  if (!snap.exists()) {
    return { valido: false, mensaje: "Código de invitación no válido." };
  }

  const data = snap.data();

  if (data.activo === false) {
    return { valido: false, mensaje: "Este código de invitación ha sido desactivado." };
  }

  const usados = data.usados || 0;
  const maximo = data.usosMaximos || 1;

  if (usados >= maximo) {
    return { valido: false, mensaje: "Este código ya alcanzó el límite de usos." };
  }

  return { valido: true, codigoDoc: { id: snap.id, ...data } };
}

// ─── REGISTRO BETA ───
export async function registerBetaDueño({ email, password, nombre, nombreAlmacen, codigoBeta }) {
  const validation = await validarCodigoBeta(codigoBeta);
  if (!validation.valido) {
    throw new Error(validation.mensaje);
  }

  const { trialStartedAt, trialExpiresAt, proGratisUntil } = getTrialDates();

  const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await updateProfile(result.user, { displayName: nombre });

  const uid = result.user.uid;

  const almacenRef = doc(collection(db, "almacenes"));
  await setDoc(almacenRef, {
    nombre: nombreAlmacen.trim(),
    dueñoId: uid,
    plan: "trial_pro",
    trialStartedAt,
    trialExpiresAt,
    proGratisUntil,
    createdAt: new Date().toISOString(),
  });

  const userData = {
    email: email.trim().toLowerCase(),
    nombre,
    role: ROLES.DUEÑO,
    almacenId: almacenRef.id,
    plan: "trial_pro",
    trialStartedAt,
    trialExpiresAt,
    proGratisUntil,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, "users", uid), userData);

  const codeRef = doc(db, "beta_codes", codigoBeta.trim().toUpperCase());
  await runTransaction(db, async (transaction) => {
    const codeSnap = await transaction.get(codeRef);
    if (!codeSnap.exists()) throw new Error("Código no encontrado");
    const codeData = codeSnap.data();
    const usados = (codeData.usados || 0) + 1;
    if (usados > (codeData.usosMaximos || 1)) {
      throw new Error("Código agotado");
    }
    transaction.update(codeRef, { usados, updatedAt: new Date().toISOString() });
  });

  return {
    user: result.user,
    userData,
    almacenId: almacenRef.id,
  };
}

// ═══════════════════════════════════════════════
// 🔥 ADMIN: GESTIÓN DE CÓDIGOS BETA
// ═══════════════════════════════════════════════

/**
 * Crea un nuevo código beta.
 * Solo el dueño del sistema (tú) debería poder ejecutar esto.
 */
export async function crearCodigoBeta({ codigo, usosMaximos = 1, notas = "" }) {
  const cleanCode = codigo.trim().toUpperCase();

  // Verificar que no exista
  const existing = await getDoc(doc(db, "beta_codes", cleanCode));
  if (existing.exists()) {
    throw new Error(`El código "${cleanCode}" ya existe.`);
  }

  await setDoc(doc(db, "beta_codes", cleanCode), {
    codigo: cleanCode,
    usosMaximos: Number(usosMaximos) || 1,
    usados: 0,
    activo: true,
    notas: notas || "",
    createdAt: new Date().toISOString(),
  });

  return { id: cleanCode, codigo: cleanCode, usosMaximos, usados: 0, activo: true };
}

/**
 * Genera un código beta aleatorio.
 */
export function generarCodigoAleatorio(prefijo = "BETA") {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefijo}-${timestamp}-${random}`;
}

/**
 * Lista todos los códigos beta.
 */
export async function listarCodigosBeta() {
  const snap = await getDocs(collection(db, "beta_codes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

/**
 * Activa/desactiva un código beta.
 */
export async function toggleCodigoBeta(codigoId, activo) {
  await updateDoc(doc(db, "beta_codes", codigoId), {
    activo,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Elimina un código beta.
 */
export async function eliminarCodigoBeta(codigoId) {
  await deleteDoc(doc(db, "beta_codes", codigoId));
}

/**
 * Obtiene estadísticas de uso de códigos beta.
 */
export async function estadisticasBeta() {
  const codigos = await listarCodigosBeta();
  const total = codigos.length;
  const activos = codigos.filter(c => c.activo).length;
  const inactivos = total - activos;
  const usadosTotal = codigos.reduce((sum, c) => sum + (c.usados || 0), 0);
  const disponiblesTotal = codigos.reduce((sum, c) => sum + Math.max(0, (c.usosMaximos || 0) - (c.usados || 0)), 0);

  return {
    total,
    activos,
    inactivos,
    usadosTotal,
    disponiblesTotal,
  };
}

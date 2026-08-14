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
} from "firebase/firestore";

const ROLES = {
  DUEÑO: "dueño",
};

// 🔥 FIX: Trial Pro = 30 días con acceso completo a Pro
// Luego 6 meses Pro gratis
function getTrialDates() {
  const now = new Date();
  const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 días
  const proGratisUntil = new Date(trialExpiresAt.getTime() + 6 * 30 * 24 * 60 * 60 * 1000); // +6 meses
  return {
    trialStartedAt: now.toISOString(),
    trialExpiresAt: trialExpiresAt.toISOString(),
    proGratisUntil: proGratisUntil.toISOString(),
  };
}

/**
 * Valida un código beta contra Firestore.
 */
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

/**
 * Registra un dueño con código beta.
 * 🔥 FIX: Trial Pro (acceso completo a Pro por 30 días)
 */
export async function registerBetaDueño({ email, password, nombre, nombreAlmacen, codigoBeta }) {
  const validation = await validarCodigoBeta(codigoBeta);
  if (!validation.valido) {
    throw new Error(validation.mensaje);
  }

  const { trialStartedAt, trialExpiresAt, proGratisUntil } = getTrialDates();

  // 1. Crear usuario en Firebase Auth
  const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await updateProfile(result.user, { displayName: nombre });

  const uid = result.user.uid;

  // 2. Crear almacén con plan trial_pro
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

  // 3. Crear documento de usuario
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

  // 4. Marcar código como usado
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

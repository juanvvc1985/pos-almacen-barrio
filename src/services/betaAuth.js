import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection } from "firebase/firestore";

const ROLES = { DUEÑO: "dueño" };

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

// 🔥 FIX #2: Unificado a "codigosBeta"
export async function validarCodigoBeta(codigo) {
  if (!codigo || codigo.trim() === "") return { valido: false, mensaje: "Ingresa un código de invitación." };
  const cleanCode = codigo.trim().toUpperCase();
  const codeRef = doc(db, "codigosBeta", cleanCode);
  const snap = await getDoc(codeRef);
  if (!snap.exists()) return { valido: false, mensaje: "Código de invitación no válido." };
  const data = snap.data();
  if (data.activo === false) return { valido: false, mensaje: "Este código ha sido desactivado." };
  const usados = data.usados || 0;
  const maximo = data.usosMaximos || 1;
  if (usados >= maximo) return { valido: false, mensaje: "Este código ya alcanzó el límite de usos." };
  return { valido: true, codigoDoc: { id: snap.id, ...data } };
}

export async function registerBetaDueño({ email, password, nombre, nombreAlmacen, codigoBeta }) {
  const validation = await validarCodigoBeta(codigoBeta);
  if (!validation.valido) throw new Error(validation.mensaje);
  const { trialStartedAt, trialExpiresAt, proGratisUntil } = getTrialDates();
  const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await updateProfile(result.user, { displayName: nombre });
  const uid = result.user.uid;
  const almacenRef = doc(collection(db, "almacenes"));
  
  await setDoc(almacenRef, { nombre: nombreAlmacen.trim(), dueñoId: uid, plan: "trial_pro", trialStartedAt, trialExpiresAt, proGratisUntil, createdAt: new Date().toISOString() });
  
  const userData = { email: email.trim().toLowerCase(), nombre, role: ROLES.DUEÑO, almacenId: almacenRef.id, plan: "trial_pro", trialStartedAt, trialExpiresAt, proGratisUntil, createdAt: new Date().toISOString() };
  await setDoc(doc(db, "users", uid), userData);
  
  // 🔥 FIX #2: Unificado a "codigosBeta"
  const codeRef = doc(db, "codigosBeta", codigoBeta.trim().toUpperCase());
  await runTransaction(db, async (transaction) => {
    const codeSnap = await transaction.get(codeRef);
    if (!codeSnap.exists()) throw new Error("Código no encontrado");
    const codeData = codeSnap.data();
    const usados = (codeData.usados || 0) + 1;
    if (usados > (codeData.usosMaximos || 1)) throw new Error("Código agotado");
    transaction.update(codeRef, { usados, updatedAt: new Date().toISOString() });
  });
  return { user: result.user, userData, almacenId: almacenRef.id };
}

export async function crearCodigoBeta({ codigo, usosMaximos = 1, notas = "" }) {
  const cleanCode = codigo.trim().toUpperCase();
  const existing = await getDoc(doc(db, "codigosBeta", cleanCode));
  if (existing.exists()) throw new Error(`El código "${cleanCode}" ya existe.`);
  await setDoc(doc(db, "codigosBeta", cleanCode), { codigo: cleanCode, usosMaximos: Number(usosMaximos) || 1, usados: 0, activo: true, notas: notas || "", createdAt: new Date().toISOString() });
  return { id: cleanCode, codigo: cleanCode, usosMaximos, usados: 0, activo: true };
}
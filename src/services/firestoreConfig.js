import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function getConfig(almacenId) {
  if (!almacenId) return {};
  const snap = await getDoc(doc(db, "almacenes", almacenId));
  if (snap.exists()) return snap.data().config || {};
  return {};
}

export async function updateConfig(almacenId, config) {
  if (!almacenId) throw new Error("Falta almacenId");
  await updateDoc(doc(db, "almacenes", almacenId), { config });
}

export async function getAlmacenData(almacenId) {
  if (!almacenId) return null;
  const snap = await getDoc(doc(db, "almacenes", almacenId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export const configService = { getConfig, updateConfig, getAlmacenData };

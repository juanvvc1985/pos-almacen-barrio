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

export const configService = { getConfig, updateConfig };

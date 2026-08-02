import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Obtener datos del almacén
export async function getAlmacen(almacenId) {
  const snap = await getDoc(doc(db, "almacenes", almacenId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

// Actualizar plan del almacén
export async function updatePlan(almacenId, plan) {
  await updateDoc(doc(db, "almacenes", almacenId), { plan });
}

// Actualizar datos de usuario
export async function updateUserData(userId, data) {
  await updateDoc(doc(db, "users", userId), data);
}

export const usersService = {
  getAlmacen,
  updatePlan,
  updateUserData,
};

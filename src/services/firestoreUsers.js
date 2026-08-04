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

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

export const usersService = {
  // Obtener datos del usuario actual
  async getUserData(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  // Crear vendedor (ya lo tienes, se mantiene igual)
  async createVendedor({ username, password, nombre, almacenId }) {
    const email = `vendedor.${username}.${almacenId}@pos-almacen.local`;

    // 1. Crear usuario en Firebase Auth vía REST API
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error al crear vendedor");

    const uid = data.localId;

    // 2. Guardar en Firestore
    await setDoc(doc(db, "users", uid), {
      uid,
      nombre,
      username,
      email,
      role: "vendedor",
      almacenId,
      activo: true,
      createdAt: new Date().toISOString(),
    });

    // 3. Reservar username público
    await setDoc(doc(db, "publicUsernames", username), {
      uid,
      almacenId,
      createdAt: new Date().toISOString(),
    });

    return { uid, email };
  },

  // Obtener vendedores del almacén
  async getVendedores(almacenId) {
    const q = query(collection(db, "users"), where("almacenId", "==", almacenId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // Actualizar vendedor
  async updateVendedor(uid, data) {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
  },

  // ✅ CORREGIDO: Eliminar vendedor + liberar username
  async deleteVendedor(uid, username) {
    // 1. Eliminar el username de publicUsernames primero
    if (username) {
      await deleteDoc(doc(db, "publicUsernames", username));
    }

    // 2. Eliminar el documento del vendedor en users
    await deleteDoc(doc(db, "users", uid));

    // Nota: La cuenta de Firebase Auth permanece. Para eliminarla completamente
    // necesitarías una Cloud Function con privilegios de admin, ya que el cliente
    // no puede borrar otros usuarios. En producción, marca como inactivo o usa una
    // función serverless. Por ahora, con las reglas corregidas, el doc de Firestore
    // sí se elimina y el username queda libre.
  },
};
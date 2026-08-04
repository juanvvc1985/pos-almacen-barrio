import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
} from "firebase/firestore";
import { puedeCrearVendedor } from "./planLimits";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

export const usersService = {
  async getUserData(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async createVendedor({ username, password, nombre, almacenId }) {
    const check = await puedeCrearVendedor(almacenId);
    if (!check.permitido) throw new Error(check.mensaje);

    const email = `vendedor.${username}.${almacenId}@pos-almacen.local`;

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

    await setDoc(doc(db, "publicUsernames", username), {
      uid,
      almacenId,
      createdAt: new Date().toISOString(),
    });

    return { uid, email };
  },

  async getVendedores(almacenId) {
    const q = query(
      collection(db, "users"),
      where("almacenId", "==", almacenId),
      where("role", "==", "vendedor")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async updateVendedor(uid, data) {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
  },

  async deleteVendedor(uid, username) {
    if (username) {
      await deleteDoc(doc(db, "publicUsernames", username));
    }
    await deleteDoc(doc(db, "users", uid));
  },
};

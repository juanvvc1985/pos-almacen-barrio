import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
} from "firebase/firestore";
import { puedeCrearVendedor } from "./planLimits";

const API_KEY = "AIzaSyAQUD8KyWSPYNz73RTrdSy-jZ3Lf2QiF3c";

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

    let res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    let data = await res.json();

    if (!res.ok && data.error?.message === "EMAIL_EXISTS") {
      const loginRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );
      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        if (loginData.error?.message === "INVALID_PASSWORD") {
          throw new Error(
            `El usuario "${username}" ya existe con otra contraseña.\n\n` +
            "Si fue creado antes y no aparece en la lista, elimínalo desde " +
            "Firebase Console → Authentication → Users, y vuelve a intentar."
          );
        }
        throw new Error(loginData.error?.message || "Error al verificar usuario existente");
      }
      data = loginData;
    } else if (!res.ok) {
      if (data.error?.message === "WEAK_PASSWORD") {
        throw new Error("Contraseña muy débil (mínimo 6 caracteres)");
      }
      throw new Error(data.error?.message || "Error al crear vendedor");
    }

    const uid = data.localId;

    await setDoc(doc(db, "users", uid), {
      uid,
      nombre,
      username,
      email,
      role: "vendedor",
      almacenId,
      activo: true,
      privilegios: {
        productos: false,
        mermas: false,
        ofertas: false,
        fiados: true,
        informes: true,
        configuracion: false,
        vendedores: false,
      },
      createdAt: new Date().toISOString(),
    });

    await setDoc(doc(db, "publicUsernames", username), {
      uid,
      email,
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

  async cambiarPasswordVendedor(uid, nuevaPassword) {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, {
      passwordPending: nuevaPassword,
      updatedAt: new Date().toISOString(),
    });
  },
};

import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const AuthContext = createContext(null);

export const ROLES = {
  DUEÑO: "dueño",
  VENDEDOR: "vendedor",
};

export const PLANES = {
  BASICO: "basico",
  PRO: "pro",
};

const FIREBASE_API_KEY = "AIzaSyAQUD8KyWSPYNz73RTrdSy-jZ3Lf2QiF3c";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function findEmailByUsername(username) {
    const snap = await getDoc(doc(db, "publicUsernames", username.trim().toLowerCase()));
    if (snap.exists()) return snap.data().email;
    return null;
  }

  const login = async (identifier, password) => {
    let email = identifier.trim();
    if (!email.includes("@")) {
      const foundEmail = await findEmailByUsername(email);
      if (!foundEmail) {
        throw new Error("Usuario no encontrado");
      }
      email = foundEmail;
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.activo === false) {
        await signOut(auth);
        throw new Error("Usuario desactivado. Contacta al dueño.");
      }
      setUserData(data);
    }
    return result;
  };

  const registerDueño = async (email, password, nombre, nombreAlmacen) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: nombre });
    const almacenRef = doc(collection(db, "almacenes"));
    await setDoc(almacenRef, {
      nombre: nombreAlmacen,
      dueñoId: result.user.uid,
      plan: PLANES.BASICO,
      createdAt: new Date().toISOString(),
    });
    await setDoc(doc(db, "users", result.user.uid), {
      email, nombre, role: ROLES.DUEÑO,
      almacenId: almacenRef.id, plan: PLANES.BASICO,
      createdAt: new Date().toISOString(),
    });
    setUserData({
      email, nombre, role: ROLES.DUEÑO,
      almacenId: almacenRef.id, plan: PLANES.BASICO,
    });
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const isDueño = userData?.role === ROLES.DUEÑO;
  const isVendedor = userData?.role === ROLES.VENDEDOR;
  const almacenId = userData?.almacenId || null;

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, login, registerDueño, logout,
        isDueño, isVendedor, almacenId, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}

export async function crearVendedorDirecto(almacenId, nombre, username, password) {
  const cleanUser = username.toLowerCase().trim();
  const email = `vendedor.${cleanUser}.${almacenId.slice(0, 8)}@pos-almacen.local`;
  const snapCheck = await getDoc(doc(db, "publicUsernames", cleanUser));
  if (snapCheck.exists()) throw new Error("El nombre de usuario ya existe");

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await response.json();
  if (data.error) {
    if (data.error.message === "EMAIL_EXISTS") throw new Error("El usuario ya existe");
    if (data.error.message === "WEAK_PASSWORD") throw new Error("Contraseña muy débil (mínimo 6 caracteres)");
    throw new Error(data.error.message);
  }
  const uid = data.localId;
  await setDoc(doc(db, "users", uid), {
    email, nombre, username: cleanUser, role: ROLES.VENDEDOR,
    almacenId, activo: true, createdAt: new Date().toISOString(),
  });
  await setDoc(doc(db, "publicUsernames", cleanUser), {
    email, almacenId, uid,
  });
  return { uid, email, username: cleanUser };
}

export async function toggleVendedorEstado(vendedorId, activo) {
  await updateDoc(doc(db, "users", vendedorId), {
    activo, updatedAt: new Date().toISOString(),
  });
}

export async function getVendedores(almacenId) {
  const q = query(collection(db, "users"), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.role === "vendedor");
}

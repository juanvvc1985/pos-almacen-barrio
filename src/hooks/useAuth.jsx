import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
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
const OFFLINE_SESSION_KEY = "pos_offline_session";
const OFFLINE_USERS_KEY = "pos_offline_users";
const IDB_NAME = "pos_offline_db";
const IDB_STORE = "session";
const IDB_VERSION = 1;

// ─── IndexedDB helpers ───
function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(IDB_STORE);
    };
  });
}

async function idbSet(key, value) {
  const db = await openIDB();
  const tx = db.transaction(IDB_STORE, "readwrite");
  const store = tx.objectStore(IDB_STORE);
  return new Promise((resolve, reject) => {
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    return new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function idbDel(key) {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    return new Promise((resolve, reject) => {
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    /* noop */
  }
}

// ─── localStorage helpers (fallback) ───
function getOfflineSession() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_SESSION_KEY));
  } catch {
    return null;
  }
}

function saveOfflineSession(user, userData) {
  localStorage.setItem(
    OFFLINE_SESSION_KEY,
    JSON.stringify({
      uid: user.uid,
      email: user.email?.toLowerCase(),
      displayName: user.displayName,
      photoURL: user.photoURL,
      userData,
      savedAt: new Date().toISOString(),
    })
  );
}

function clearOfflineSession() {
  localStorage.removeItem(OFFLINE_SESSION_KEY);
}

function saveOfflineUser(uid, data) {
  const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || "{}");
  users[uid] = { ...data, _offlineSavedAt: new Date().toISOString() };
  localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
}

function getOfflineUser(uid) {
  try {
    const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || "{}");
    return users[uid] || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = null;
    let mounted = true;

    async function init() {
      // 1. Restaurar sesión offline lo más rápido posible
      const offline = (await idbGet("session").catch(() => null)) || getOfflineSession();
      if (mounted && offline?.userData) {
        setUser({
          uid: offline.uid,
          email: offline.email,
          displayName: offline.displayName,
          photoURL: offline.photoURL,
        });
        setUserData(offline.userData);
      }

      // 2. Escuchar Firebase Auth (puede confirmar o invalidar)
      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;

        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();

              if (data.passwordPending && data.role === "vendedor") {
                try {
                  await updatePassword(firebaseUser, data.passwordPending);
                  await updateDoc(doc(db, "users", firebaseUser.uid), {
                    passwordPending: null,
                    passwordUpdatedAt: new Date().toISOString(),
                  });
                } catch (err) {
                  console.error("No se pudo actualizar contraseña pendiente:", err);
                }
              }

              setUserData(data);
              const session = {
                uid: firebaseUser.uid,
                email: firebaseUser.email?.toLowerCase(),
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                userData: data,
                savedAt: new Date().toISOString(),
              };
              await idbSet("session", session);
              saveOfflineSession(firebaseUser, data);
              saveOfflineUser(firebaseUser.uid, data);
            } else {
              // Documento no existe: usar cache si hay
              const cached = getOfflineUser(firebaseUser.uid);
              if (cached) setUserData(cached);
            }
          } catch (err) {
            // Fallo de red (offline): mantener cache
            const cached = getOfflineUser(firebaseUser.uid);
            if (cached) setUserData(cached);
            console.warn("Firestore offline, usando cache:", err.message);
          }
        } else {
          // Firebase dice que no hay usuario
          const stillOffline = (await idbGet("session").catch(() => null)) || getOfflineSession();
          if (!stillOffline) {
            setUser(null);
            setUserData(null);
          }
        }

        if (mounted) setLoading(false);
      });
    }

    init();

    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  async function findEmailByUsername(username) {
    const clean = username.toLowerCase().trim();
    const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || "{}");
    for (const uid in users) {
      if (users[uid].username === clean) return users[uid].email;
    }
    if (navigator.onLine) {
      const snap = await getDoc(doc(db, "publicUsernames", clean));
      if (snap.exists()) return snap.data().email;
    }
    return null;
  }

  const login = async (identifier, password) => {
    let email = identifier.trim().toLowerCase();
    if (!email.includes("@")) {
      const foundEmail = await findEmailByUsername(email);
      if (!foundEmail) throw new Error("Usuario no encontrado");
      email = foundEmail.toLowerCase();
    }

    // Intento 1: Firebase Auth (por si hay internet lenta o intermitente)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.activo === false) {
          await signOut(auth);
          throw new Error("Usuario desactivado. Contacta al dueño.");
        }
        setUserData(data);
        const session = {
          uid: result.user.uid,
          email: result.user.email?.toLowerCase(),
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          userData: data,
          savedAt: new Date().toISOString(),
        };
        await idbSet("session", session);
        saveOfflineSession(result.user, data);
        saveOfflineUser(result.user.uid, data);
      }
      return result;
    } catch (err) {
      // Intento 2: Fallback offline si falló por red
      const isNetworkError =
        err.code === "auth/network-request-failed" ||
        err.code === "auth/timeout" ||
        err.message?.includes("network") ||
        err.message?.includes("fetch") ||
        !navigator.onLine;

      if (isNetworkError) {
        const offline = (await idbGet("session").catch(() => null)) || getOfflineSession();
        if (offline && offline.email?.toLowerCase() === email) {
          setUser({
            uid: offline.uid,
            email: offline.email,
            displayName: offline.displayName,
            photoURL: offline.photoURL,
          });
          setUserData(offline.userData);
          return { user: offline, offline: true };
        }
        throw new Error("Sin conexión. Primero inicia sesión con internet al menos una vez.");
      }
      throw err;
    }
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
      email,
      nombre,
      role: ROLES.DUEÑO,
      almacenId: almacenRef.id,
      plan: PLANES.BASICO,
      createdAt: new Date().toISOString(),
    });
    const newUserData = {
      email,
      nombre,
      role: ROLES.DUEÑO,
      almacenId: almacenRef.id,
      plan: PLANES.BASICO,
    };
    setUserData(newUserData);
    const session = {
      uid: result.user.uid,
      email: result.user.email?.toLowerCase(),
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      userData: newUserData,
      savedAt: new Date().toISOString(),
    };
    await idbSet("session", session);
    saveOfflineSession(result.user, newUserData);
    saveOfflineUser(result.user.uid, newUserData);
    return result;
  };

  const logout = async () => {
    await idbDel("session");
    clearOfflineSession();
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const isDueño = userData?.role === ROLES.DUEÑO;
  const isVendedor = userData?.role === ROLES.VENDEDOR;
  const almacenId = userData?.almacenId || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        registerDueño,
        logout,
        isDueño,
        isVendedor,
        almacenId,
        isAuthenticated: !!userData,
      }}
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
  const email = `vendedor.${cleanUser}.${almacenId}@pos-almacen.local`;
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
    email,
    nombre,
    username: cleanUser,
    role: ROLES.VENDEDOR,
    almacenId,
    activo: true,
    createdAt: new Date().toISOString(),
  });
  await setDoc(doc(db, "publicUsernames", cleanUser), {
    email,
    almacenId,
    uid,
  });
  return { uid, email, username: cleanUser };
}

export async function toggleVendedorEstado(vendedorId, activo) {
  await updateDoc(doc(db, "users", vendedorId), {
    activo,
    updatedAt: new Date().toISOString(),
  });
}

export async function getVendedores(almacenId) {
  const q = query(collection(db, "users"), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.role === "vendedor");
}

export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
}
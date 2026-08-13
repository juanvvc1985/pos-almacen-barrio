import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  persistentSingleTabManager,
  memoryLocalCache,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQUD8KyWSPYNz73RTrdSy-jZ3Lf2QiF3c",
  authDomain: "almacen-de-barrio-a947a.firebaseapp.com",
  projectId: "almacen-de-barrio-a947a",
  storageBucket: "almacen-de-barrio-a947a.firebasestorage.app",
  messagingSenderId: "1014856587704",
  appId: "1:1014856587704:web:a4dbcdfaea21e88388974d"
};

const app = initializeApp(firebaseConfig);

// Auth con persistencia local (IndexedDB del navegador)
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Firestore con cache persistente (para que la app siga funcionando sin
// conexión) con una cadena de respaldo: si el navegador no puede abrir el
// cache persistente con soporte multi-pestaña (esto pasa en Safari antiguo,
// modo privado, o cuando falta la Web Locks API que Safari solo agregó en
// iOS 15.4), se intenta con cache persistente de una sola pestaña, y si
// tampoco es posible, se usa cache en memoria para que la app AL MENOS
// cargue y funcione con conexión, en vez de fallar por completo sin avisar.
// Sin este respaldo, un fallo silencioso aquí deja a getProducts() (que usa
// una lectura única, no un listener en vivo) sin datos para mostrar apenas
// el dispositivo pierde conexión — la app "no funciona offline" sin ningún
// error visible.
function crearFirestoreConRespaldo() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      })
    });
  } catch (err) {
    console.warn("Cache persistente multi-pestaña no disponible, probando modo de una pestaña:", err);
  }
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager({ forceOwnership: false }),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      })
    });
  } catch (err) {
    console.warn("Cache persistente no disponible en este dispositivo, usando cache en memoria (sin modo offline real):", err);
  }
  return initializeFirestore(app, { localCache: memoryLocalCache() });
}

const db = crearFirestoreConRespaldo();

export { auth, db };
export default app;
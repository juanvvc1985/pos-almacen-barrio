import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
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

// Firestore con cache persistente + multi-tab desde el arranque
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

export { auth, db };
export default app;

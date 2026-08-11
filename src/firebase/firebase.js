import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQUD8KyWSPYNz73RTrdSy-jZ3Lf2QiF3c",
  authDomain: "almacen-de-barrio-a947a.firebaseapp.com",
  projectId: "almacen-de-barrio-a947a",
  storageBucket: "almacen-de-barrio-a947a.firebasestorage.app",
  messagingSenderId: "1014856587704",
  appId: "1:1014856587704:web:a4dbcdfaea21e88388974d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Activar persistencia offline (IndexedDB)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Firestore offline: múltiples pestañas abiertas");
  } else if (err.code === "unimplemented") {
    console.warn("Firestore offline: navegador no soporta IndexedDB");
  } else {
    console.error("Firestore offline error:", err);
  }
});

export default app;

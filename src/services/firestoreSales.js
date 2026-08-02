import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs, addDoc,
} from "firebase/firestore";

const COLLECTION_VENTAS = "ventas";
const COLLECTION_TURNOS = "turnos";

export async function createSale(almacenId, saleData) {
  const data = { ...saleData, almacenId, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, COLLECTION_VENTAS), data);
  return { id: ref.id, ...data };
}

export async function getSales(almacenId, filters = {}) {
  if (!almacenId) return [];
  const q = query(
    collection(db, COLLECTION_VENTAS),
    where("almacenId", "==", almacenId)
  );
  const snap = await getDocs(q);
  let sales = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Ordenar localmente
  sales.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (filters.desde) sales = sales.filter((s) => new Date(s.createdAt) >= new Date(filters.desde));
  if (filters.hasta) sales = sales.filter((s) => new Date(s.createdAt) <= new Date(filters.hasta));
  if (filters.metodoPago) sales = sales.filter((s) => s.metodoPago === filters.metodoPago);
  if (filters.tipo) sales = sales.filter((s) => s.tipo === filters.tipo);
  return sales;
}

export async function getTodaySales(almacenId) {
  const hoy = new Date().toISOString().split("T")[0];
  const sales = await getSales(almacenId);
  return sales.filter((s) => s.createdAt?.startsWith(hoy));
}

export async function createTurno(almacenId, turnoData) {
  const data = { ...turnoData, almacenId, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, COLLECTION_TURNOS), data);
  return { id: ref.id, ...data };
}

export async function updateTurno(turnoId, updates) {
  await updateDoc(doc(db, COLLECTION_TURNOS, turnoId), {
    ...updates, updatedAt: new Date().toISOString(),
  });
}

export async function getTurnoActivo(almacenId) {
  if (!almacenId) return null;
  const q = query(
    collection(db, COLLECTION_TURNOS),
    where("almacenId", "==", almacenId),
    where("estado", "==", "abierto")
  );
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  return null;
}

export async function getTurnos(almacenId) {
  if (!almacenId) return [];
  const q = query(collection(db, COLLECTION_TURNOS), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  const turnos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return turnos.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export const salesService = {
  createSale, getSales, getTodaySales, createTurno, updateTurno, getTurnoActivo, getTurnos,
};

import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
} from "firebase/firestore";

const COLLECTION = "turnos";
const VENTAS_COLLECTION = "ventas";

export async function getTurnos(almacenId) {
  if (!almacenId) return [];
  const q = query(collection(db, COLLECTION), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  const turnos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return turnos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getTurnoActivo(almacenId) {
  if (!almacenId) return null;
  const q = query(
    collection(db, COLLECTION),
    where("almacenId", "==", almacenId),
    where("estado", "==", "abierto")
  );
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  return null;
}

export async function createTurno(almacenId, data) {
  const turnoData = {
    ...data,
    almacenId,
    estado: "abierto",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COLLECTION), turnoData);
  return { id: ref.id, ...turnoData };
}

export async function updateTurno(turnoId, updates) {
  const data = { ...updates, updatedAt: new Date().toISOString() };
  await updateDoc(doc(db, COLLECTION, turnoId), data);
  return { id: turnoId, ...updates };
}

export async function getTodaySales(almacenId) {
  if (!almacenId) return [];
  const hoy = new Date().toISOString().split("T")[0];
  const q = query(
    collection(db, VENTAS_COLLECTION),
    where("almacenId", "==", almacenId),
    where("createdAt", ">=", hoy)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSales(almacenId) {
  if (!almacenId) return [];
  const q = query(collection(db, VENTAS_COLLECTION), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  const sales = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createSale(almacenId, data) {
  const saleData = {
    ...data,
    almacenId,
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, VENTAS_COLLECTION), saleData);
  return { id: ref.id, ...saleData };
}

export async function getVentasTurno(almacenId, turnoId) {
  if (!almacenId || !turnoId) return [];
  const q = query(
    collection(db, VENTAS_COLLECTION),
    where("almacenId", "==", almacenId),
    where("turnoId", "==", turnoId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getFiadosRecuperadosTurno(almacenId, turnoId) {
  if (!almacenId || !turnoId) return [];
  const q = query(
    collection(db, "fiados"),
    where("almacenId", "==", almacenId),
    where("turnoId", "==", turnoId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const salesService = {
  getTurnos, getTurnoActivo, createTurno, updateTurno,
  getTodaySales, getSales, createSale,
  getVentasTurno, getFiadosRecuperadosTurno,
};

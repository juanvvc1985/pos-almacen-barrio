import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
} from "firebase/firestore";

const COLLECTION = "fiados";

export async function createFiado(almacenId, fiadoData) {
  const data = {
    ...fiadoData, almacenId, estado: "pendiente", pagos: [],
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
}

export async function getFiados(almacenId, filters = {}) {
  if (!almacenId) return [];
  const q = query(collection(db, COLLECTION), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  let fiados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  fiados.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (filters.estado) fiados = fiados.filter((f) => f.estado === filters.estado);
  if (filters.search) {
    const term = filters.search.toLowerCase();
    fiados = fiados.filter((f) =>
      f.clienteNombre?.toLowerCase().includes(term) || f.clienteTelefono?.includes(term)
    );
  }
  return fiados;
}

export async function getFiado(fiadoId) {
  const snap = await getDoc(doc(db, COLLECTION, fiadoId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export async function addPago(fiadoId, pagoData) {
  const fiado = await getFiado(fiadoId);
  if (!fiado) throw new Error("Fiado no encontrado");
  const pagos = [...(fiado.pagos || []), pagoData];
  const totalPagado = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);
  const estado = totalPagado >= fiado.total ? "pagada" : totalPagado > 0 ? "parcial" : "pendiente";
  await updateDoc(doc(db, COLLECTION, fiadoId), {
    pagos, estado, updatedAt: new Date().toISOString(),
  });
  return { ...fiado, pagos, estado };
}

export async function deleteFiado(fiadoId) {
  await deleteDoc(doc(db, COLLECTION, fiadoId));
}

export const fiadosService = {
  createFiado, getFiados, getFiado, addPago, deleteFiado,
};

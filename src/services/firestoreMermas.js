import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
} from "firebase/firestore";

const COLLECTION = "mermas";

export async function createMerma(almacenId, mermaData) {
  const data = { ...mermaData, almacenId, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
}

export async function getMermas(almacenId, filters = {}) {
  if (!almacenId) return [];
  const q = query(collection(db, COLLECTION), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  let mermas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  mermas.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (filters.desde) mermas = mermas.filter((m) => new Date(m.createdAt) >= new Date(filters.desde));
  if (filters.hasta) mermas = mermas.filter((m) => new Date(m.createdAt) <= new Date(filters.hasta));
  if (filters.motivo) mermas = mermas.filter((m) => m.motivo === filters.motivo);
  return mermas;
}

export async function deleteMerma(mermaId) {
  await deleteDoc(doc(db, COLLECTION, mermaId));
}

export const mermasService = {
  createMerma, getMermas, deleteMerma,
};

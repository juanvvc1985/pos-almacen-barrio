import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
} from "firebase/firestore";

const COLLECTION = "productos";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getProducts(almacenId) {
  if (!almacenId) return [];
  const q = query(
    collection(db, COLLECTION),
    where("almacenId", "==", almacenId)
  );
  const snap = await getDocs(q);
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return products.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
}

export async function getProduct(productId) {
  const snap = await getDoc(doc(db, COLLECTION, productId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export async function createProduct(almacenId, productData) {
  const data = {
    ...productData,
    almacenId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
}

export async function updateProduct(productId, updates) {
  const data = { ...updates, updatedAt: new Date().toISOString() };
  await updateDoc(doc(db, COLLECTION, productId), data);
  return { id: productId, ...updates };
}

export async function deleteProduct(productId) {
  await deleteDoc(doc(db, COLLECTION, productId));
}

export async function addStock(productId, cantidad, loteData = null) {
  const product = await getProduct(productId);
  if (!product) throw new Error("Producto no encontrado");
  const nuevoStock = (product.stock || 0) + cantidad;
  const updates = { stock: nuevoStock, updatedAt: new Date().toISOString() };
  if (product.perecedero && loteData) {
    const lotes = product.lotes || [];
    lotes.push({
      id: generateId(),
      cantidad,
      fechaVencimiento: loteData.fechaVencimiento,
      fechaIngreso: new Date().toISOString(),
    });
    updates.lotes = lotes;
  }
  await updateDoc(doc(db, COLLECTION, productId), updates);
  return { ...product, ...updates };
}

export async function discountStock(productId, cantidad) {
  const product = await getProduct(productId);
  if (!product) throw new Error("Producto no encontrado");
  if ((product.stock || 0) < cantidad) {
    throw new Error(`Stock insuficiente: ${product.nombre}`);
  }
  const updates = {
    stock: product.stock - cantidad,
    updatedAt: new Date().toISOString(),
  };
  if (product.perecedero && product.lotes) {
    let restante = cantidad;
    const lotes = [...product.lotes].sort(
      (a, b) => new Date(a.fechaIngreso) - new Date(b.fechaIngreso)
    );
    for (let i = 0; i < lotes.length && restante > 0; i++) {
      if (lotes[i].cantidad <= restante) {
        restante -= lotes[i].cantidad;
        lotes[i].cantidad = 0;
      } else {
        lotes[i].cantidad -= restante;
        restante = 0;
      }
    }
    updates.lotes = lotes.filter((l) => l.cantidad > 0);
  }
  await updateDoc(doc(db, COLLECTION, productId), updates);
  return { ...product, ...updates };
}

export async function getProductByBarcode(almacenId, barcode) {
  if (!almacenId || !barcode) return null;
  const q = query(
    collection(db, COLLECTION),
    where("almacenId", "==", almacenId),
    where("codigoBarras", "==", barcode)
  );
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  return null;
}

export async function searchProducts(almacenId, searchTerm) {
  if (!almacenId) return [];
  const products = await getProducts(almacenId);
  if (!searchTerm) return products;
  const term = searchTerm.toLowerCase();
  return products.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(term) ||
      p.codigoBarras?.includes(term) ||
      p.categoria?.toLowerCase().includes(term)
  );
}

export const productsService = {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addStock, discountStock, getProductByBarcode, searchProducts,
};

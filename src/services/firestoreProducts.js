import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
  runTransaction,
} from "firebase/firestore";
import { puedeCrearProducto } from "./planLimits";

const COLLECTION = "productos";
const PRODUCTS_CACHE_KEY = "pos_products_cache";

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

function getCacheKey(almacenId) {
  return `${PRODUCTS_CACHE_KEY}_${almacenId}`;
}

export function saveProductsToCache(almacenId, products) {
  try {
    localStorage.setItem(getCacheKey(almacenId), JSON.stringify({
      products,
      timestamp: new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Error guardando productos en cache:", e);
  }
}

export function getCachedProducts(almacenId) {
  try {
    const raw = localStorage.getItem(getCacheKey(almacenId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.products || null;
  } catch (e) {
    console.error("Error leyendo productos de cache:", e);
    return null;
  }
}

export async function getProducts(almacenId) {
  if (!almacenId) return [];

  try {
    const q = query(
      collection(db, COLLECTION),
      where("almacenId", "==", almacenId)
    );
    const snap = await getDocs(q);
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const sorted = products.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));

    // Guardar en cache para uso offline
    saveProductsToCache(almacenId, sorted);
    return sorted;
  } catch (err) {
    console.warn("Error cargando productos de Firestore, usando cache local:", err.message);
    const cached = getCachedProducts(almacenId);
    if (cached) return cached;
    throw err;
  }
}

export async function getProduct(productId) {
  const snap = await getDoc(doc(db, COLLECTION, productId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

// 🔥 FIX: Validar duplicados por código de barras antes de crear
export async function createProduct(almacenId, productData) {
  const check = await puedeCrearProducto(almacenId);
  if (!check.permitido) throw new Error(check.mensaje);

  // Si tiene código de barras, verificar que no exista otro producto con el mismo código
  if (productData.codigoBarras && productData.codigoBarras.trim() !== "") {
    const existente = await getProductByBarcode(almacenId, productData.codigoBarras.trim());
    if (existente) {
      throw new Error(`Ya existe un producto con el código de barras "${productData.codigoBarras}". Usa el producto existente o cambia el código.`);
    }
  }

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
  const productRef = doc(db, COLLECTION, productId);

  return await runTransaction(db, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error("Producto no encontrado");

    const product = productSnap.data();
    const nuevoStock = (product.stock || 0) + cantidad;
    const updates = { stock: nuevoStock, updatedAt: new Date().toISOString() };

    if (product.perecedero && loteData) {
      const lotes = product.lotes ? [...product.lotes] : [];
      lotes.push({
        id: generateId(),
        cantidad,
        fechaVencimiento: loteData.fechaVencimiento,
        fechaIngreso: new Date().toISOString(),
      });
      updates.lotes = lotes;
    }

    transaction.update(productRef, updates);
    return { id: productId, ...product, ...updates };
  });
}

export async function discountStock(productId, cantidad) {
  const productRef = doc(db, COLLECTION, productId);

  return await runTransaction(db, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error("Producto no encontrado");

    const product = productSnap.data();

    if ((product.stock || 0) < cantidad) {
      throw new Error(`Stock insuficiente: ${product.nombre || productId}`);
    }

    const nuevoStock = (product.stock || 0) - cantidad;
    const updates = {
      stock: nuevoStock,
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

    transaction.update(productRef, updates);
    return { id: productId, ...product, ...updates };
  });
}

export async function discountStockBatch(carritoItems) {
  const results = [];
  for (const item of carritoItems) {
    const res = await discountStock(item.id, item.cantidad);
    results.push(res);
  }
  return results;
}

// 🔥 FIX: Si hay múltiples productos con el mismo código, devolver el que tenga stock > 0
// para evitar vender productos duplicados con stock 0
export async function getProductByBarcode(almacenId, barcode) {
  if (!almacenId || !barcode) return null;
  try {
    const q = query(
      collection(db, COLLECTION),
      where("almacenId", "==", almacenId),
      where("codigoBarras", "==", barcode)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;

    // Si hay múltiples resultados, priorizar el que tenga stock disponible
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (docs.length === 1) return docs[0];

    const conStock = docs.find(p => (p.stock || 0) > 0);
    if (conStock) return conStock;

    // Si ninguno tiene stock, devolver el primero (para mostrarlo como agotado)
    return docs[0];
  } catch (err) {
    // Fallback: buscar en cache local
    const cached = getCachedProducts(almacenId);
    if (cached) {
      const matches = cached.filter(p => p.codigoBarras === barcode);
      if (matches.length === 0) return null;
      if (matches.length === 1) return matches[0];
      const conStock = matches.find(p => (p.stock || 0) > 0);
      return conStock || matches[0];
    }
    throw err;
  }
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
  addStock, discountStock, discountStockBatch, getProductByBarcode, searchProducts,
  getCachedProducts, saveProductsToCache,
};

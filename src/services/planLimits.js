import { db } from "../firebase/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export const LIMITES = {
  basico: { productos: 500, vendedores: 1 },
  pro:    { productos: Infinity, vendedores: Infinity },
};

export async function getPlan(almacenId) {
  if (!almacenId) return "basico";
  const snap = await getDoc(doc(db, "almacenes", almacenId));
  if (snap.exists()) return snap.data().plan || "basico";
  return "basico";
}

export async function contarProductos(almacenId) {
  if (!almacenId) return 0;
  const q = query(collection(db, "productos"), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  return snap.size;
}

export async function contarVendedores(almacenId) {
  if (!almacenId) return 0;
  const q = query(collection(db, "users"), where("almacenId", "==", almacenId), where("role", "==", "vendedor"));
  const snap = await getDocs(q);
  return snap.size;
}

export async function puedeCrearProducto(almacenId) {
  const plan = await getPlan(almacenId);
  const limite = LIMITES[plan]?.productos ?? LIMITES.basico.productos;
  if (limite === Infinity) return { permitido: true, plan };
  const actuales = await contarProductos(almacenId);
  if (actuales >= limite) {
    return {
      permitido: false,
      plan,
      mensaje: `Limite alcanzado: Plan ${plan.toUpperCase()} permite maximo ${limite} productos. Actual: ${actuales}.`,
    };
  }
  return { permitido: true, plan, usados: actuales, limite };
}

export async function puedeCrearVendedor(almacenId) {
  const plan = await getPlan(almacenId);
  const limite = LIMITES[plan]?.vendedores ?? LIMITES.basico.vendedores;
  if (limite === Infinity) return { permitido: true, plan };
  const actuales = await contarVendedores(almacenId);
  if (actuales >= limite) {
    return {
      permitido: false,
      plan,
      mensaje: `Limite alcanzado: Plan ${plan.toUpperCase()} permite maximo ${limite} vendedor(es). Actual: ${actuales}.`,
    };
  }
  return { permitido: true, plan, usados: actuales, limite };
}

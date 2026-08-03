import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

// ============================================================
// VENTAS
// ============================================================

export async function createSale(almacenId, saleData) {
  if (!almacenId) throw new Error("almacenId requerido");
  const ref = collection(db, "almacenes", almacenId, "ventas");
  const docRef = await addDoc(ref, {
    ...saleData,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...saleData };
}

export async function getSalesByDate(almacenId, startDate, endDate) {
  if (!almacenId) return [];
  // NO usar orderBy combinado con where (regla del proyecto)
  const ref = collection(db, "almacenes", almacenId, "ventas");
  const q = query(ref, where("createdAt", ">=", startDate), where("createdAt", "<=", endDate));
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Ordenar localmente
  return data.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() || 0;
    const tb = b.createdAt?.toMillis?.() || 0;
    return tb - ta;
  });
}

// ============================================================
// TURNOS
// ============================================================

export async function openTurno(almacenId, vendedorId, vendedorNombre, efectivoInicial) {
  if (!almacenId || !vendedorId) throw new Error("almacenId y vendedorId requeridos");

  // Verificar que no haya turno abierto
  const activo = await getActiveTurno(almacenId, vendedorId);
  if (activo) throw new Error("Ya tienes un turno abierto");

  const ref = collection(db, "almacenes", almacenId, "turnos");
  const docRef = await addDoc(ref, {
    vendedorId,
    vendedorNombre: vendedorNombre || "",
    efectivoInicial: Number(efectivoInicial) || 0,
    abiertoEn: serverTimestamp(),
    cerradoEn: null,
    ventasEfectivo: 0,
    ventasOtras: 0,
    fiadosRecuperados: 0,
    totalEfectivo: 0,
    estado: "abierto",
  });

  return { id: docRef.id };
}

export async function getActiveTurno(almacenId, vendedorId) {
  if (!almacenId || !vendedorId) return null;
  const ref = collection(db, "almacenes", almacenId, "turnos");
  const q = query(ref, where("vendedorId", "==", vendedorId), where("estado", "==", "abierto"));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function closeTurno(almacenId, vendedorId) {
  if (!almacenId || !vendedorId) {
    throw new Error("almacenId y vendedorId requeridos para cerrar turno");
  }

  // 1. Buscar turno activo
  const turno = await getActiveTurno(almacenId, vendedorId);
  if (!turno) {
    // No hay turno abierto, no es error fatal, solo retornar null
    return null;
  }

  const turnoId = turno.id;
  const turnoAbiertoEn = turno.abiertoEn;

  // 2. Calcular ventas del turno (desde que abrió)
  let ventasEfectivo = 0;
  let ventasOtras = 0;

  try {
    const ventasRef = collection(db, "almacenes", almacenId, "ventas");
    // Traemos ventas del día para no hacer query compleja con orderBy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const qVentas = query(
      ventasRef,
      where("createdAt", ">=", Timestamp.fromDate(hoy)),
      where("createdAt", "<", Timestamp.fromDate(manana))
    );
    const ventasSnap = await getDocs(qVentas);

    ventasSnap.forEach((d) => {
      const v = d.data();
      // Solo contar ventas de ESTE turno (mismo vendedor y después de abiertoEn)
      if (v.vendedorId === vendedorId && v.createdAt) {
        const ventaTime = v.createdAt.toMillis?.() || 0;
        const turnoTime = turnoAbiertoEn?.toMillis?.() || 0;
        if (ventaTime >= turnoTime) {
          if (v.metodoPago === "efectivo" || v.metodoPago === "cash") {
            ventasEfectivo += Number(v.total) || 0;
          } else {
            ventasOtras += Number(v.total) || 0;
          }
        }
      }
    });
  } catch (e) {
    console.error("Error calculando ventas del turno:", e);
    // No fallar el cierre por esto, continuar con 0
  }

  // 3. Calcular fiados recuperados en efectivo del turno
  let fiadosRecuperados = 0;
  try {
    const fiadosRef = collection(db, "almacenes", almacenId, "fiados");
    const qFiados = query(
      fiadosRef,
      where("updatedAt", ">=", Timestamp.fromDate(new Date(Date.now() - 86400000)))
    );
    const fiadosSnap = await getDocs(qFiados);
    fiadosSnap.forEach((d) => {
      const f = d.data();
      if (f.vendedorId === vendedorId && f.estado === "pagado" && f.metodoPago === "efectivo") {
        const pagoTime = f.updatedAt?.toMillis?.() || 0;
        const turnoTime = turnoAbiertoEn?.toMillis?.() || 0;
        if (pagoTime >= turnoTime) {
          fiadosRecuperados += Number(f.montoPagado) || Number(f.total) || 0;
        }
      }
    });
  } catch (e) {
    console.error("Error calculando fiados recuperados:", e);
  }

  const efectivoInicial = Number(turno.efectivoInicial) || 0;
  const totalEfectivo = efectivoInicial + ventasEfectivo + fiadosRecuperados;

  // 4. Actualizar turno
  const turnoDocRef = doc(db, "almacenes", almacenId, "turnos", turnoId);
  await updateDoc(turnoDocRef, {
    cerradoEn: serverTimestamp(),
    estado: "cerrado",
    ventasEfectivo,
    ventasOtras,
    fiadosRecuperados,
    totalEfectivo,
  });

  return {
    id: turnoId,
    vendedorNombre: turno.vendedorNombre,
    efectivoInicial,
    ventasEfectivo,
    fiadosRecuperados,
    totalEfectivo,
    ventasOtras,
  };
}

// ============================================================
// FIADOS
// ============================================================

export async function createFiado(almacenId, fiadoData) {
  if (!almacenId) throw new Error("almacenId requerido");
  const ref = collection(db, "almacenes", almacenId, "fiados");
  const docRef = await addDoc(ref, {
    ...fiadoData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    estado: "pendiente",
  });
  return { id: docRef.id, ...fiadoData };
}

export async function updateFiado(almacenId, fiadoId, updates) {
  const ref = doc(db, "almacenes", almacenId, "fiados", fiadoId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getFiados(almacenId, estado = null) {
  if (!almacenId) return [];
  const ref = collection(db, "almacenes", almacenId, "fiados");
  let q;
  if (estado) {
    q = query(ref, where("estado", "==", estado));
  } else {
    q = query(ref);
  }
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() || 0;
    const tb = b.createdAt?.toMillis?.() || 0;
    return tb - ta;
  });
}

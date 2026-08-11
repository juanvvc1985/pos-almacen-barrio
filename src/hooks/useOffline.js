import { useState, useEffect, useCallback } from "react";
import { salesService } from "../services/firestoreSales";
import { fiadosService } from "../services/firestoreFiados";
import { productsService } from "../services/firestoreProducts";

const SYNC_KEY = "pos_offline_queue";
const OFFLINE_TURNO_KEY = "pos_offline_turno";

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    setPendingCount(queue.length);
  }, [isOnline, syncing]);

  // Sincronizar cola automáticamente al reconectar
  useEffect(() => {
    if (!isOnline) return;

    async function syncQueue() {
      const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
      if (queue.length === 0) return;

      setSyncing(true);
      const remaining = [];

      for (const op of queue) {
        try {
          if (op.type === "venta") {
            await productsService.discountStockBatch(op.data.productos.map(p => ({
              id: p.id,
              cantidad: p.cantidad
            })));
            await salesService.createSale(op.almacenId, op.data);
          } else if (op.type === "fiado") {
            await productsService.discountStockBatch(op.data.productos.map(p => ({
              id: p.id,
              cantidad: p.cantidad
            })));
            await fiadosService.createFiado(op.almacenId, op.data);
          } else if (op.type === "turno_cerrar") {
            await salesService.updateTurno(op.turnoId, op.data);
          }
        } catch (err) {
          console.error("Error sincronizando operación:", err);
          remaining.push(op);
        }
      }

      localStorage.setItem(SYNC_KEY, JSON.stringify(remaining));
      setPendingCount(remaining.length);
      setSyncing(false);
    }

    syncQueue();
  }, [isOnline]);

  const addToQueue = useCallback((operation) => {
    const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    queue.push({ ...operation, timestamp: new Date().toISOString() });
    localStorage.setItem(SYNC_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  }, []);

  const clearQueue = useCallback(() => {
    localStorage.removeItem(SYNC_KEY);
    setPendingCount(0);
  }, []);

  const getQueue = useCallback(() => {
    return JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
  }, []);

  const removeFromQueue = useCallback((index) => {
    const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    queue.splice(index, 1);
    localStorage.setItem(SYNC_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  }, []);

  const saveOfflineTurno = useCallback((turno) => {
    localStorage.setItem(OFFLINE_TURNO_KEY, JSON.stringify(turno));
  }, []);

  const getOfflineTurno = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_TURNO_KEY));
    } catch { return null; }
  }, []);

  const clearOfflineTurno = useCallback(() => {
    localStorage.removeItem(OFFLINE_TURNO_KEY);
  }, []);

  return {
    isOnline,
    syncing,
    setSyncing,
    pendingCount,
    addToQueue,
    clearQueue,
    getQueue,
    removeFromQueue,
    saveOfflineTurno,
    getOfflineTurno,
    clearOfflineTurno,
  };
}

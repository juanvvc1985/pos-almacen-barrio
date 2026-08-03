import { useState, useEffect, useCallback } from "react";
import { getActiveTurno, closeTurno as closeTurnoService } from "../services/firestoreSales";

export function useTurno(almacenId, vendedorId) {
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!almacenId || !vendedorId) {
      setTurno(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const t = await getActiveTurno(almacenId, vendedorId);
      setTurno(t);
    } catch (e) {
      console.error(e);
      setError("No se pudo verificar el turno");
    } finally {
      setLoading(false);
    }
  }, [almacenId, vendedorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cerrar = useCallback(async () => {
    if (!almacenId || !vendedorId) {
      throw new Error("Falta almacenId o vendedorId");
    }
    setLoading(true);
    setError("");
    try {
      const resumen = await closeTurnoService(almacenId, vendedorId);
      setTurno(null);
      return resumen;
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cerrar turno");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [almacenId, vendedorId]);

  return { turno, loading, error, refresh, cerrar };
}

import { useState, useEffect, useCallback } from "react";
import {
  getTurnoActivo,
  createTurno as openTurnoService,
  updateTurno,
} from "../services/firestoreSales";

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
      const t = await getTurnoActivo(almacenId);
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

  const abrir = useCallback(
    async (efectivoInicial, vendedorNombre) => {
      if (!almacenId || !vendedorId) {
        throw new Error("Falta almacenId o vendedorId");
      }
      setLoading(true);
      setError("");
      try {
        const turnoData = {
          estado: "abierto",
          vendedorId,
          vendedorNombre,
          montoInicial: efectivoInicial,
          ventas: { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 },
        };
        const res = await openTurnoService(almacenId, turnoData);
        await refresh();
        return res;
      } catch (e) {
        console.error(e);
        setError(e.message || "Error al abrir turno");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [almacenId, vendedorId, refresh]
  );

  const cerrar = useCallback(async () => {
    if (!almacenId || !vendedorId || !turno?.id) {
      throw new Error("Falta turno activo");
    }
    setLoading(true);
    setError("");
    try {
      await updateTurno(turno.id, {
        estado: "cerrado",
        cerradoEn: new Date().toISOString(),
      });
      setTurno(null);
      return { mensaje: "Turno cerrado" };
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cerrar turno");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [almacenId, vendedorId, turno]);

  return { turno, loading, error, refresh, abrir, cerrar };
}
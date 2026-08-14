import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// ═══════════════════════════════════════════════════════════════
// WHITELIST DE ADMIN: Solo estos UIDs pueden crear códigos beta
// Para obtener tu UID: Abre la app logueado → F12 → Console →
// console.log(JSON.parse(localStorage.getItem("pos_offline_session")).uid)
// ═══════════════════════════════════════════════════════════════
const ADMIN_UIDS = [
  // "PEGA-TU-UID-AQUI", // ← Descomenta y pega tu UID real
];

function generarCodigo(longitud = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

export default function BetaCodesAdmin() {
  const { user } = useAuth();
  const [codigos, setCodigos] = useState([]);
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [dias, setDias] = useState(30);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  useEffect(() => {
    if (isAdmin) cargarCodigos();
  }, [isAdmin]);

  async function cargarCodigos() {
    try {
      const q = query(collection(db, "codigosBeta"), orderBy("creadoEn", "desc"));
      const snap = await getDocs(q);
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCodigos(lista);
    } catch (err) {
      setError("Error al cargar códigos: " + err.message);
    }
  }

  async function crearCodigo(e) {
    e.preventDefault();
    if (!isAdmin) {
      setError("No tienes permisos para crear códigos beta.");
      return;
    }
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const codigosCreados = [];
      for (let i = 0; i < cantidad; i++) {
        const codigo = nuevoCodigo.trim() || generarCodigo();
        const expiresAt = Date.now() + dias * 24 * 60 * 60 * 1000;
        await addDoc(collection(db, "codigosBeta"), {
          codigo: codigo.toUpperCase(),
          dias,
          usado: false,
          expiresAt,
          creadoEn: serverTimestamp(),
          creadoPor: user.uid,
        });
        codigosCreados.push(codigo.toUpperCase());
      }
      setMensaje(`✅ ${codigosCreados.length} código(s) creado(s): ${codigosCreados.join(", ")}`);
      setNuevoCodigo("");
      cargarCodigos();
    } catch (err) {
      setError("Error al crear código: " + err.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarCodigo(id) {
    if (!window.confirm("¿Eliminar este código?")) return;
    try {
      await deleteDoc(doc(db, "codigosBeta", id));
      cargarCodigos();
      setMensaje("🗑️ Código eliminado");
    } catch (err) {
      setError("Error al eliminar: " + err.message);
    }
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🚫</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Restringido</h2>
          <p className="text-red-600">Este panel es exclusivo para administradores de Loventa.</p>
          <p className="text-sm text-red-500 mt-2">
            Tu UID: <code className="bg-red-100 px-2 py-1 rounded">{user?.uid || "No logueado"}</code>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Si eres el creador, agrega tu UID a ADMIN_UIDS en BetaCodesAdmin.jsx
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">🔑 Panel Admin — Códigos Beta</h1>

      {mensaje && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{mensaje}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Crear nuevo código</h2>
        <form onSubmit={crearCodigo} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="codigo-input" className="block text-sm font-medium text-gray-700 mb-1">Código (opcional)</label>
            <input id="codigo-input" name="codigo" type="text" value={nuevoCodigo}
              onChange={(e) => setNuevoCodigo(e.target.value.toUpperCase())}
              placeholder="Auto-generado" maxLength={12}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="dias-input" className="block text-sm font-medium text-gray-700 mb-1">Días Pro</label>
            <input id="dias-input" name="dias" type="number" min={1} max={365} value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="cantidad-input" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input id="cantidad-input" name="cantidad" type="number" min={1} max={50} value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button type="submit" disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              {cargando ? "Creando..." : "➕ Crear Código(s)"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Códigos existentes ({codigos.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Código</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Días</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Usado por</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Expira</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {codigos.map((c) => (
                <tr key={c.id} className={c.usado ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3 font-mono font-semibold">{c.codigo}</td>
                  <td className="px-4 py-3">{c.dias}</td>
                  <td className="px-4 py-3">
                    {c.usado ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">✅ Usado</span>
                    ) : c.expiresAt && Date.now() > c.expiresAt ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">⏰ Expirado</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">🟢 Activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.usadoPor ? c.usadoPor.slice(0, 8) + "..." : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("es-CL") : "Sin expiración"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => eliminarCodigo(c.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
              {codigos.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay códigos beta creados aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

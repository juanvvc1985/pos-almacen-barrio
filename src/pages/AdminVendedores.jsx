import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usersService } from "../services/firestoreUsers";
import { getPlan, LIMITES } from "../services/planLimits";
import { Plus, Trash2, RefreshCw, UserCheck, UserX, KeyRound, Loader2, AlertTriangle } from "lucide-react";

export default function AdminVendedores() {
  const { userData } = useAuth();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", username: "", password: "" });
  const [planInfo, setPlanInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userData?.almacenId) cargarTodo();
  }, [userData?.almacenId]);

  async function cargarTodo() {
    setLoading(true);
    setError("");
    try {
      // 🔥 OPTIMIZACIÓN: Paralelizar vendedores + plan en vez de secuencial
      const [data, plan] = await Promise.all([
        usersService.getVendedores(userData.almacenId),
        getPlan(userData.almacenId),
      ]);

      setVendedores(data);

      // Cache local para offline
      localStorage.setItem(
        `pos_vendedores_cache_${userData.almacenId}`,
        JSON.stringify({
          vendedores: data,
          timestamp: Date.now(),
        })
      );

      // Calcular plan localmente sin contar de nuevo en Firestore
      const limite = LIMITES[plan]?.vendedores ?? LIMITES.basico.vendedores;
      setPlanInfo({
        plan,
        usados: data.length,
        limite: limite === Infinity ? "∞" : limite,
        permitido: limite === Infinity || data.length < limite,
      });
    } catch (err) {
      console.error("Error cargando vendedores:", err);
      setError("Error al cargar vendedores. Intenta recargar.");
      // Fallback a cache local si existe
      const cache = localStorage.getItem(`pos_vendedores_cache_${userData.almacenId}`);
      if (cache) {
        try {
          const parsed = JSON.parse(cache);
          setVendedores(parsed.vendedores || []);
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCrear(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.username.trim() || !form.password.trim()) return;

    setSaving(true);
    setError("");
    try {
      const result = await usersService.createVendedor({
        almacenId: userData.almacenId,
        nombre: form.nombre.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
      });

      // 🔥 OPTIMIZACIÓN: Actualizar estado local inmediatamente sin recargar todo
      const nuevoVendedor = {
        id: result.uid,
        nombre: form.nombre.trim(),
        username: form.username.trim().toLowerCase(),
        email: result.email,
        activo: true,
        role: "vendedor",
        almacenId: userData.almacenId,
      };
      const nuevaLista = [...vendedores, nuevoVendedor];
      setVendedores(nuevaLista);
      setMostrarForm(false);
      setForm({ nombre: "", username: "", password: "" });

      // Actualizar planInfo localmente
      if (planInfo) {
        const limite = planInfo.limite === "∞" ? Infinity : parseInt(planInfo.limite);
        setPlanInfo({
          ...planInfo,
          usados: nuevaLista.length,
          permitido: limite === Infinity || nuevaLista.length < limite,
        });
      }

      // Recargar en background para sincronizar con Firestore (sin bloquear UI)
      usersService.getVendedores(userData.almacenId).then((data) => {
        setVendedores(data);
        localStorage.setItem(
          `pos_vendedores_cache_${userData.almacenId}`,
          JSON.stringify({ vendedores: data, timestamp: Date.now() })
        );
      }).catch(() => {});
    } catch (err) {
      setError(err.message || "Error al crear vendedor");
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(vendedor) {
    if (!confirm(`¿Eliminar vendedor "${vendedor.nombre}"? Esta acción no se puede deshacer.`)) return;

    setSaving(true);
    try {
      await usersService.deleteVendedor(vendedor.id, vendedor.username);

      // 🔥 OPTIMIZACIÓN: Remover del estado local inmediatamente
      const nuevaLista = vendedores.filter((v) => v.id !== vendedor.id);
      setVendedores(nuevaLista);

      // Actualizar planInfo localmente
      if (planInfo) {
        const limite = planInfo.limite === "∞" ? Infinity : parseInt(planInfo.limite);
        setPlanInfo({
          ...planInfo,
          usados: nuevaLista.length,
          permitido: limite === Infinity || nuevaLista.length < limite,
        });
      }

      // Recargar en background
      usersService.getVendedores(userData.almacenId).then((data) => {
        setVendedores(data);
        localStorage.setItem(
          `pos_vendedores_cache_${userData.almacenId}`,
          JSON.stringify({ vendedores: data, timestamp: Date.now() })
        );
      }).catch(() => {});
    } catch (err) {
      setError(err.message || "Error al eliminar vendedor");
      // Si falló, recargar para sincronizar estado
      cargarTodo();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActivo(vendedor) {
    setSaving(true);
    try {
      await usersService.updateVendedor(vendedor.id, { activo: !vendedor.activo });

      // 🔥 OPTIMIZACIÓN: Toggle local inmediato sin recargar
      setVendedores((prev) =>
        prev.map((v) => (v.id === vendedor.id ? { ...v, activo: !v.activo } : v))
      );
    } catch (err) {
      setError(err.message || "Error al cambiar estado");
      cargarTodo();
    } finally {
      setSaving(false);
    }
  }

  async function handleCambiarPassword(vendedor) {
    const nueva = prompt(`Nueva contraseña para ${vendedor.nombre}:`);
    if (!nueva || nueva.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setSaving(true);
    try {
      await usersService.cambiarPasswordVendedor(vendedor.id, nueva);
      alert("Contraseña actualizada");
    } catch (err) {
      setError(err.message || "Error al cambiar contraseña");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 Vendedores</h1>
          {planInfo && (
            <p className="text-sm text-gray-500 mt-1">
              Plan <span className="font-semibold capitalize">{planInfo.plan}</span> ·{" "}
              {planInfo.usados} / {planInfo.limite} vendedores
            </p>
          )}
        </div>
        <button
          onClick={cargarTodo}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title="Recargar"
        >
          <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : "text-gray-600"} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!mostrarForm ? (
        <button
          onClick={() => {
            if (!planInfo?.permitido) {
              alert("Has alcanzado el límite de vendedores de tu plan. Actualiza a Pro para agregar más.");
              return;
            }
            setMostrarForm(true);
          }}
          disabled={saving}
          className="mb-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          <Plus size={18} />
          Agregar Vendedor
        </button>
      ) : (
        <form onSubmit={handleCrear} className="mb-6 bg-white border rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Nuevo Vendedor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Usuario (sin espacios)"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="password"
              placeholder="Contraseña (mín. 6)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
              minLength={6}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? "Creando..." : "Crear Vendedor"}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); setForm({ nombre: "", username: "", password: "" }); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading && vendedores.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      ) : vendedores.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <UserCheck size={48} className="mx-auto mb-3 opacity-50" />
          <p>No hay vendedores registrados</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vendedores.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{v.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">@{v.username}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActivo(v)}
                      disabled={saving}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                        v.activo
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {v.activo ? <UserCheck size={12} /> : <UserX size={12} />}
                      {v.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCambiarPassword(v)}
                        disabled={saving}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                        title="Cambiar contraseña"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => handleEliminar(v)}
                        disabled={saving}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

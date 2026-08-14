import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usersService } from "../services/firestoreUsers";
import { getPlan, LIMITES } from "../services/planLimits";
import { Plus, Trash2, RefreshCw, UserCheck, UserX, KeyRound, Loader2, AlertTriangle, Shield } from "lucide-react";

const PRIVILEGIOS_DISPONIBLES = [
  { key: "productos", label: "Productos", desc: "Crear, editar y eliminar productos" },
  { key: "mermas", label: "Mermas", desc: "Registrar y eliminar mermas" },
  { key: "ofertas", label: "Ofertas", desc: "Crear y quitar ofertas especiales" },
  { key: "fiados", label: "Fiados", desc: "Gestionar fiados (siempre activo)", locked: true },
  { key: "informes", label: "Informes", desc: "Ver informes y estadísticas (siempre activo)", locked: true },
];

const DEFAULT_PRIVILEGIOS = {
  productos: false,
  mermas: false,
  ofertas: false,
  fiados: true,
  informes: true,
  configuracion: false,
  vendedores: false,
};

export default function AdminVendedores() {
  const { userData } = useAuth();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", username: "", password: "" });
  const [planInfo, setPlanInfo] = useState(null);
  const [error, setError] = useState("");
  const [editandoPrivilegios, setEditandoPrivilegios] = useState(null);

  useEffect(() => {
    if (userData?.almacenId) cargarTodo();
  }, [userData?.almacenId]);

  async function cargarTodo() {
    setLoading(true);
    setError("");
    try {
      const [data, plan] = await Promise.all([
        usersService.getVendedores(userData.almacenId),
        getPlan(userData.almacenId),
      ]);

      const normalizados = data.map((v) => ({
        ...v,
        privilegios: { ...DEFAULT_PRIVILEGIOS, ...v.privilegios },
      }));

      setVendedores(normalizados);

      localStorage.setItem(
        `pos_vendedores_cache_${userData.almacenId}`,
        JSON.stringify({ vendedores: normalizados, timestamp: Date.now() })
      );

      const limite = LIMITES[plan]?.vendedores ?? LIMITES.basico.vendedores;
      setPlanInfo({
        plan,
        usados: normalizados.length,
        limite: limite === Infinity ? "∞" : limite,
        permitido: limite === Infinity || normalizados.length < limite,
      });
    } catch (err) {
      console.error("Error cargando vendedores:", err);
      setError("Error al cargar vendedores. Intenta recargar.");
      const cache = localStorage.getItem(`pos_vendedores_cache_${userData.almacenId}`);
      if (cache) {
        try {
          const parsed = JSON.parse(cache);
          setVendedores((parsed.vendedores || []).map((v) => ({ ...v, privilegios: { ...DEFAULT_PRIVILEGIOS, ...v.privilegios } })));
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

      const nuevoVendedor = {
        id: result.uid,
        nombre: form.nombre.trim(),
        username: form.username.trim().toLowerCase(),
        email: result.email,
        activo: true,
        role: "vendedor",
        almacenId: userData.almacenId,
        privilegios: { ...DEFAULT_PRIVILEGIOS },
      };
      const nuevaLista = [...vendedores, nuevoVendedor];
      setVendedores(nuevaLista);
      setMostrarForm(false);
      setForm({ nombre: "", username: "", password: "" });

      if (planInfo) {
        const limite = planInfo.limite === "∞" ? Infinity : parseInt(planInfo.limite);
        setPlanInfo({
          ...planInfo,
          usados: nuevaLista.length,
          permitido: limite === Infinity || nuevaLista.length < limite,
        });
      }

      usersService.getVendedores(userData.almacenId).then((data) => {
        const normalizados = data.map((v) => ({ ...v, privilegios: { ...DEFAULT_PRIVILEGIOS, ...v.privilegios } }));
        setVendedores(normalizados);
        localStorage.setItem(
          `pos_vendedores_cache_${userData.almacenId}`,
          JSON.stringify({ vendedores: normalizados, timestamp: Date.now() })
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
      const nuevaLista = vendedores.filter((v) => v.id !== vendedor.id);
      setVendedores(nuevaLista);

      if (planInfo) {
        const limite = planInfo.limite === "∞" ? Infinity : parseInt(planInfo.limite);
        setPlanInfo({
          ...planInfo,
          usados: nuevaLista.length,
          permitido: limite === Infinity || nuevaLista.length < limite,
        });
      }

      usersService.getVendedores(userData.almacenId).then((data) => {
        const normalizados = data.map((v) => ({ ...v, privilegios: { ...DEFAULT_PRIVILEGIOS, ...v.privilegios } }));
        setVendedores(normalizados);
        localStorage.setItem(
          `pos_vendedores_cache_${userData.almacenId}`,
          JSON.stringify({ vendedores: normalizados, timestamp: Date.now() })
        );
      }).catch(() => {});
    } catch (err) {
      setError(err.message || "Error al eliminar vendedor");
      cargarTodo();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActivo(vendedor) {
    setSaving(true);
    try {
      await usersService.updateVendedor(vendedor.id, { activo: !vendedor.activo });
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

  function abrirPrivilegios(vendedor) {
    setEditandoPrivilegios({
      ...vendedor,
      privilegios: { ...DEFAULT_PRIVILEGIOS, ...vendedor.privilegios },
    });
  }

  function togglePrivilegio(key) {
    setEditandoPrivilegios((prev) => ({
      ...prev,
      privilegios: {
        ...prev.privilegios,
        [key]: !prev.privilegios?.[key],
      },
    }));
  }

  async function guardarPrivilegios() {
    if (!editandoPrivilegios) return;
    setSaving(true);
    try {
      await usersService.updateVendedor(editandoPrivilegios.id, {
        privilegios: editandoPrivilegios.privilegios,
      });
      setVendedores((prev) =>
        prev.map((v) =>
          v.id === editandoPrivilegios.id
            ? { ...v, privilegios: editandoPrivilegios.privilegios }
            : v
        )
      );
      setEditandoPrivilegios(null);
    } catch (err) {
      setError(err.message || "Error al guardar privilegios");
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
                        onClick={() => abrirPrivilegios(v)}
                        disabled={saving}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition"
                        title="Editar privilegios"
                      >
                        <Shield size={16} />
                      </button>
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

      {/* Modal de Privilegios */}
      {editandoPrivilegios && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-purple-600" size={20} />
              <h3 className="text-lg font-bold text-gray-800">
                Privilegios de {editandoPrivilegios.nombre}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Activa o desactiva los permisos de este vendedor. Los cambios se aplican inmediatamente al guardar.
            </p>
            <div className="space-y-3">
              {PRIVILEGIOS_DISPONIBLES.map((p) => (
                <label
                  key={p.key}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition ${
                    p.locked ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!editandoPrivilegios.privilegios?.[p.key]}
                    disabled={p.locked || saving}
                    onChange={() => togglePrivilegio(p.key)}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">{p.label}</span>
                      {p.locked && (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                          Siempre activo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditandoPrivilegios(null)}
                disabled={saving}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPrivilegios}
                disabled={saving}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                {saving ? "Guardando..." : "Guardar Privilegios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

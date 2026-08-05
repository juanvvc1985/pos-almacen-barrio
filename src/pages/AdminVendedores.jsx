import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usersService } from "../services/firestoreUsers";
import { puedeCrearVendedor, LIMITES } from "../services/planLimits";
import { UserPlus, Trash2, UserCheck, UserX, Loader2, Crown, AlertTriangle } from "lucide-react";

export default function AdminVendedores() {
  const { userData } = useAuth();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", nombre: "" });
  const [error, setError] = useState("");
  const [planInfo, setPlanInfo] = useState({ plan: "basico", usados: 0, limite: 1, permitido: true });

  useEffect(() => {
    if (userData?.almacenId) {
      cargarTodo();
    }
  }, [userData]);

  async function cargarTodo() {
    setLoading(true);
    const data = await usersService.getVendedores(userData.almacenId);
    setVendedores(data);
    await cargarPlanInfo(data.length);
    setLoading(false);
  }

  async function cargarPlanInfo(cantidadActual = null) {
    const r = await puedeCrearVendedor(userData.almacenId);
    setPlanInfo({
      plan: r.plan || "basico",
      usados: r.usados ?? cantidadActual ?? vendedores.length,
      limite: r.limite ?? LIMITES.basico.vendedores,
      permitido: r.permitido,
    });
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError("");
    try {
      await usersService.createVendedor({
        username: form.username.trim(),
        password: form.password,
        nombre: form.nombre.trim(),
        almacenId: userData.almacenId,
      });
      setForm({ username: "", password: "", nombre: "" });
      setMostrarForm(false);
      await cargarTodo();
    } catch (err) {
      setError(err.message || "Error al crear vendedor");
    }
  }

  async function toggleActivo(vendedor) {
    await usersService.updateVendedor(vendedor.id, { activo: !vendedor.activo });
    await cargarTodo();
  }

  async function handleEliminar(vendedor) {
    if (!confirm(`¿Eliminar permanentemente a ${vendedor.nombre}?\n\nEsta acción no se puede deshacer.`)) return;
    try {
      await usersService.deleteVendedor(vendedor.id, vendedor.username);
      await cargarTodo();
    } catch (err) {
      alert("Error al eliminar: " + (err.message || "Verifica las reglas de Firestore"));
      console.error(err);
    }
  }

  const alLimite = planInfo.usados >= planInfo.limite && planInfo.limite !== Infinity;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-blue-600" /> Vendedores
        </h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          disabled={alLimite}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <UserPlus size={18} /> Nuevo Vendedor
        </button>
      </div>

      <div className={`flex items-center justify-between mb-4 p-3 rounded-lg border text-sm ${
        planInfo.plan === "pro"
          ? "bg-purple-50 border-purple-200 text-purple-700"
          : "bg-gray-50 border-gray-200 text-gray-600"
      }`}>
        <div className="flex items-center gap-2">
          <Crown size={16} />
          <span className="font-medium">Plan {planInfo.plan.toUpperCase()}</span>
          <span>• Vendedores: {planInfo.usados} / {planInfo.limite === Infinity ? "∞" : planInfo.limite}</span>
        </div>
        {planInfo.plan === "basico" && (
          <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
            Upgrade a Pro para vendedores ilimitados
          </span>
        )}
      </div>

      {alLimite && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          Has alcanzado el límite de vendedores de tu plan. Elimina uno o actualiza a Pro.
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Crear Vendedor</h2>
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (login)</label>
              <input type="text" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required minLength={6} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setMostrarForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
              Crear Vendedor
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Usuario</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendedores.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{v.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{v.username}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${v.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {v.activo ? <UserCheck size={12} /> : <UserX size={12} />}
                    {v.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => toggleActivo(v)}
                      className={`p-1.5 rounded-lg transition ${v.activo ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                      title={v.activo ? "Desactivar" : "Activar"}>
                      {v.activo ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button onClick={() => handleEliminar(v)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendedores.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <UserPlus size={40} className="mx-auto mb-2" />
            <p>No hay vendedores registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}

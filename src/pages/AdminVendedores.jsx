import { useState, useEffect } from "react";
import { useAuth, crearVendedorDirecto, getVendedores, toggleVendedorEstado } from "../hooks/useAuth";
import { db } from "../firebase/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Users, Plus, Trash2, Power, PowerOff, Eye, EyeOff, Loader2, KeyRound, X } from "lucide-react";

const MAX_NAME_LEN = 100;
const MAX_USER_LEN = 20;
const MAX_PASS_LEN = 50;

function sanitize(value, max) {
  return value.slice(0, max).replace(/[<>\"'&]/g, "");
}

export default function AdminVendedores() {
  const { almacenId } = useAuth();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [vendedorEdit, setVendedorEdit] = useState(null);
  const [nuevaPass, setNuevaPass] = useState("");
  const [showNuevaPass, setShowNuevaPass] = useState(false);
  const [regenerando, setRegenerando] = useState(false);
  const [regeneradoMsg, setRegeneradoMsg] = useState("");

  useEffect(() => {
    if (almacenId) cargarDatos();
  }, [almacenId]);

  async function cargarDatos() {
    setLoading(true);
    try {
      const data = await getVendedores(almacenId);
      setVendedores(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function validarUsername(u) {
    return /^[a-zA-Z0-9._-]+$/.test(u);
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError("");
    const cleanNombre = sanitize(nombre, MAX_NAME_LEN).trim();
    const cleanUser = sanitize(username, MAX_USER_LEN).trim().toLowerCase();
    const cleanPass = sanitize(password, MAX_PASS_LEN);

    if (!cleanNombre) { setError("El nombre es obligatorio"); return; }
    if (!cleanUser || cleanUser.length < 3) { setError("El usuario debe tener al menos 3 caracteres"); return; }
    if (!validarUsername(cleanUser)) { setError("El usuario solo puede contener letras, números, puntos, guiones y guiones bajos"); return; }
    if (cleanPass.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }

    setGuardando(true);
    try {
      await crearVendedorDirecto(almacenId, cleanNombre, cleanUser, cleanPass);
      await cargarDatos();
      setMostrarForm(false); setNombre(""); setUsername(""); setPassword("");
    } catch (err) { setError(err.message || "Error al crear vendedor"); }
    finally { setGuardando(false); }
  }

  async function handleToggleActivo(vendedor) {
    try { await toggleVendedorEstado(vendedor.id, !vendedor.activo); await cargarDatos(); }
    catch (err) { alert("Error al cambiar estado"); }
  }

  async function handleEliminar(vendedor) {
    if (!confirm(`¿Eliminar permanentemente a ${vendedor.nombre}?`)) return;
    try { await deleteDoc(doc(db, "users", vendedor.id)); await cargarDatos(); }
    catch (err) { alert("Error al eliminar"); }
  }

  async function handleRegenerar() {
    if (!vendedorEdit || !nuevaPass.trim()) return;
    const cleanPass = sanitize(nuevaPass, MAX_PASS_LEN);
    if (cleanPass.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setRegenerando(true); setError("");
    try {
      await toggleVendedorEstado(vendedorEdit.id, false);
      const result = await crearVendedorDirecto(almacenId, vendedorEdit.nombre, vendedorEdit.username, cleanPass);
      await updateDoc(doc(db, "users", result.uid), { nombre: vendedorEdit.nombre });
      setRegeneradoMsg(`Nueva contraseña asignada a ${vendedorEdit.nombre}. El usuario anterior fue desactivado.`);
      setNuevaPass(""); setVendedorEdit(null); await cargarDatos();
    } catch (err) { setError(err.message || "Error al regenerar contraseña"); }
    finally { setRegenerando(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6"><Users className="w-6 h-6 text-blue-600" /><h1 className="text-2xl font-bold text-gray-800">Gestión de Vendedores</h1></div>
      {regeneradoMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{regeneradoMsg}</div>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Plus size={20} className="text-green-600" />{mostrarForm ? "Nuevo Vendedor" : "Crear Vendedor"}</h2>
          <button onClick={() => { setMostrarForm(!mostrarForm); setError(""); }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">{mostrarForm ? "Cancelar" : "+ Agregar nuevo"}</button>
        </div>
        {mostrarForm && (
          <form onSubmit={handleCrear} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(sanitize(e.target.value, MAX_NAME_LEN))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Paloma S." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
                <input type="text" value={username} onChange={(e) => setUsername(sanitize(e.target.value, MAX_USER_LEN))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="Ej: paloma01" maxLength={MAX_USER_LEN} required />
                <p className="text-xs text-gray-400 mt-1">Solo letras, números, puntos, guiones. Mínimo 3 caracteres.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña inicial</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(sanitize(e.target.value, MAX_PASS_LEN))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10" placeholder="Mínimo 6 caracteres" maxLength={MAX_PASS_LEN} minLength={6} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={guardando}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50 flex items-center gap-2">
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={18} />}{guardando ? "Creando..." : "Crear Vendedor"}
            </button>
          </form>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Vendedores</h2>
        {vendedores.length === 0 ? <p className="text-gray-500 text-sm">Aún no hay vendedores registrados</p> : (
          <div className="space-y-3">
            {vendedores.map((v) => (
              <div key={v.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border ${v.activo ? "bg-white border-gray-200" : "bg-gray-50 border-gray-200 opacity-60"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${v.activo ? "bg-purple-100" : "bg-gray-200"}`}><Users size={18} className={v.activo ? "text-purple-600" : "text-gray-400"} /></div>
                  <div>
                    <p className="font-medium text-gray-800">{v.nombre}</p>
                    <p className="text-sm text-gray-500 font-mono">@{v.username}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${v.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{v.activo ? "Activo" : "Inactivo"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <button onClick={() => handleToggleActivo(v)} className={`p-2 rounded-lg transition ${v.activo ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`} title={v.activo ? "Desactivar" : "Activar"}>{v.activo ? <Power size={18} /> : <PowerOff size={18} />}</button>
                  <button onClick={() => { setVendedorEdit(v); setNuevaPass(""); setError(""); setRegeneradoMsg(""); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Cambiar contraseña"><KeyRound size={18} /></button>
                  <button onClick={() => handleEliminar(v)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar permanentemente"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {vendedorEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Cambiar contraseña</h3>
              <button onClick={() => setVendedorEdit(null)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Vendedor: <span className="font-medium text-gray-800">{vendedorEdit.nombre}</span> (@{vendedorEdit.username})</p>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <div className="relative">
                <input type={showNuevaPass ? "text" : "password"} value={nuevaPass} onChange={(e) => setNuevaPass(sanitize(e.target.value, MAX_PASS_LEN))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10" placeholder="Mínimo 6 caracteres" maxLength={MAX_PASS_LEN} minLength={6} autoFocus />
                <button type="button" onClick={() => setShowNuevaPass(!showNuevaPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showNuevaPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setVendedorEdit(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleRegenerar} disabled={regenerando} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">{regenerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound size={16} />}{regenerando ? "Procesando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
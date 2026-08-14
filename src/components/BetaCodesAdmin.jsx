import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  crearCodigoBeta,
  generarCodigoAleatorio,
  listarCodigosBeta,
  toggleCodigoBeta,
  eliminarCodigoBeta,
  estadisticasBeta,
} from "../services/betaAuth";
import {
  Key, Plus, Trash2, Power, Copy, Loader2, BarChart3,
  Users, CheckCircle2, XCircle, RefreshCw, Search, Tag
} from "lucide-react";

export default function BetaCodesAdmin() {
  const { isDueño } = useAuth();
  const [codigos, setCodigos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ codigo: "", usosMaximos: 1, notas: "" });
  const [search, setSearch] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [copiado, setCopiado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [lista, estadisticas] = await Promise.all([
        listarCodigosBeta(),
        estadisticasBeta(),
      ]);
      setCodigos(lista);
      setStats(estadisticas);
    } catch (err) {
      console.error("Error cargando códigos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCrear() {
    if (!form.codigo.trim()) {
      mostrarMensaje("Ingresa un código");
      return;
    }
    try {
      await crearCodigoBeta({
        codigo: form.codigo,
        usosMaximos: form.usosMaximos,
        notas: form.notas,
      });
      setForm({ codigo: "", usosMaximos: 1, notas: "" });
      setMostrarForm(false);
      mostrarMensaje("Código creado exitosamente");
      await cargarDatos();
    } catch (err) {
      mostrarMensaje(err.message);
    }
  }

  function handleGenerar() {
    setForm({ ...form, codigo: generarCodigoAleatorio("BETA") });
  }

  async function handleToggle(codigoId, estadoActual) {
    try {
      await toggleCodigoBeta(codigoId, !estadoActual);
      await cargarDatos();
      mostrarMensaje(estadoActual ? "Código desactivado" : "Código activado");
    } catch (err) {
      mostrarMensaje("Error al cambiar estado");
    }
  }

  async function handleEliminar(codigoId) {
    if (!confirm(`¿Eliminar el código ${codigoId} permanentemente?`)) return;
    try {
      await eliminarCodigoBeta(codigoId);
      await cargarDatos();
      mostrarMensaje("Código eliminado");
    } catch (err) {
      mostrarMensaje("Error al eliminar");
    }
  }

  function copiarAlPortapapeles(texto, id) {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    });
  }

  function mostrarMensaje(texto) {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  }

  const codigosFiltrados = search.trim()
    ? codigos.filter(c =>
        c.codigo?.toLowerCase().includes(search.toLowerCase()) ||
        c.notas?.toLowerCase().includes(search.toLowerCase())
      )
    : codigos;

  if (!isDueño) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Key size={40} className="mx-auto mb-2" />
        <p>Solo el dueño puede gestionar códigos beta</p>
      </div>
    );
  }

  return (
    <div>
      {mensaje && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-40 text-sm">
          {mensaje}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Key size={16} className="text-blue-600" />
              <span className="text-xs text-gray-500 uppercase font-medium">Total códigos</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-green-600" />
              <span className="text-xs text-gray-500 uppercase font-medium">Activos</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-purple-600" />
              <span className="text-xs text-gray-500 uppercase font-medium">Usados</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.usadosTotal}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={16} className="text-amber-600" />
              <span className="text-xs text-gray-500 uppercase font-medium">Disponibles</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.disponiblesTotal}</p>
          </div>
        </div>
      )}

      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          Códigos de Invitación Beta
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <Plus size={16} /> Nuevo Código
          </button>
          <button
            onClick={cargarDatos}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>
      </div>

      {/* Formulario crear código */}
      {mostrarForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Crear nuevo código beta</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                  placeholder="BETA-001"
                />
                <button
                  onClick={handleGenerar}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                >
                  Generar
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos</label>
              <input
                type="number"
                value={form.usosMaximos}
                onChange={(e) => setForm({ ...form, usosMaximos: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                min="1"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
              <input
                type="text"
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Código para Juan del almacén de la esquina"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setMostrarForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Plus size={16} /> Crear Código
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar código o notas..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Tabla de códigos */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Usos</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Notas</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codigosFiltrados.map((c) => {
                  const disponibles = Math.max(0, (c.usosMaximos || 0) - (c.usados || 0));
                  const agotado = disponibles === 0;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                            {c.codigo}
                          </code>
                          <button
                            onClick={() => copiarAlPortapapeles(c.codigo, c.id)}
                            className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded transition"
                            title="Copiar"
                          >
                            {copiado === c.id ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${agotado ? "text-red-600" : "text-gray-800"}`}>
                          {c.usados || 0}
                        </span>
                        <span className="text-gray-400"> / {c.usosMaximos || 1}</span>
                        {agotado && (
                          <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Agotado</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.activo ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <CheckCircle2 size={12} /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                            <XCircle size={12} /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                        {c.notas || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggle(c.id, c.activo)}
                            className={`p-1.5 rounded-lg transition ${
                              c.activo
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={c.activo ? "Desactivar" : "Activar"}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => handleEliminar(c.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {codigosFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Key size={40} className="mx-auto mb-2" />
              <p>{search ? "No se encontraron códigos" : "No hay códigos beta creados"}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

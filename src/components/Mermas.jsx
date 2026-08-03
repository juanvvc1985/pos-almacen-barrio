import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { mermasService } from "../services/firestoreMermas";
import { productsService } from "../services/firestoreProducts";
import { configService } from "../services/firestoreConfig";
import { MOTIVOS_MERMA, CRITERIOS_MERMA } from "../types/index";
import { formatCurrency, formatDate } from "../utils/format";
import { AlertTriangle, Plus, Trash2, Loader2, Settings, Check } from "lucide-react";

export default function Mermas() {
  const { almacenId } = useAuth();
  const [productos, setProductos] = useState([]);
  const [mermas, setMermas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [configCriterios, setConfigCriterios] = useState({});
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [form, setForm] = useState({
    productoId: "",
    cantidad: "",
    motivo: MOTIVOS_MERMA[0],
    notas: "",
  });

  useEffect(() => {
    if (almacenId) {
      cargarDatos();
      cargarConfig();
    }
  }, [almacenId]);

  async function cargarDatos() {
    setLoading(true);
    const [p, m] = await Promise.all([
      productsService.getProducts(almacenId),
      mermasService.getMermas(almacenId),
    ]);
    setProductos(p);
    setMermas(m);
    setLoading(false);
  }

  async function cargarConfig() {
    const cfg = await configService.getConfig(almacenId);
    setConfigCriterios(cfg.mermasCriterios || {});
  }

  async function guardarConfig() {
    setGuardandoConfig(true);
    try {
      const cfg = await configService.getConfig(almacenId);
      await configService.updateConfig(almacenId, {
        ...cfg,
        mermasCriterios: configCriterios,
      });
      setMostrarConfig(false);
    } catch (err) {
      alert("Error al guardar configuración");
    } finally {
      setGuardandoConfig(false);
    }
  }

  function toggleCriterio(criterio) {
    setConfigCriterios((prev) => ({
      ...prev,
      [criterio]: !prev[criterio],
    }));
  }

  function productoCalifica(producto) {
    const activos = CRITERIOS_MERMA.filter((c) => configCriterios[c]);
    if (activos.length === 0) return true;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return activos.some((criterio) => {
      switch (criterio) {
        case "Vencido":
          return (
            producto.perecedero &&
            producto.lotes?.some((l) => {
              const fv = new Date(l.fechaVencimiento);
              fv.setHours(0, 0, 0, 0);
              return fv < hoy;
            })
          );
        case "Dañado por humedad/descomposición":
        case "Embalaje roto/desgastado":
        case "Producto roto":
        case "Robado":
        case "Otro":
          return true;
        default:
          return false;
      }
    });
  }

  const productosFiltrados = productos.filter(productoCalifica);

  async function handleGuardar() {
    const producto = productos.find((p) => p.id === form.productoId);
    if (!producto) {
      alert("Selecciona un producto");
      return;
    }
    const cantidad = Number(form.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Ingresa una cantidad válida");
      return;
    }
    if (cantidad > producto.stockActual) {
      alert(`Stock insuficiente. Disponible: ${producto.stockActual}`);
      return;
    }

    const perdidaEstimada = (producto.precioCompra || 0) * cantidad;

    try {
      await productsService.discountStock(producto.id, cantidad);
      await mermasService.createMerma(almacenId, {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad,
        motivo: form.motivo,
        notas: form.notas,
        perdidaEstimada,
        unidad: producto.unidad,
      });

      await cargarDatos();
      setMostrarForm(false);
      setForm({ productoId: "", cantidad: "", motivo: MOTIVOS_MERMA[0], notas: "" });
    } catch (err) {
      alert("Error al registrar merma");
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar esta merma?")) return;
    await mermasService.deleteMerma(id);
    await cargarDatos();
  }

  const totalMermas = mermas.reduce((s, m) => s + (m.perdidaEstimada || 0), 0);

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
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Control de Mermas
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarConfig(!mostrarConfig)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <Settings size={18} /> Criterios
          </button>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <Plus size={18} /> Registrar Merma
          </button>
        </div>
      </div>

      {/* Configuración de criterios */}
      {mostrarConfig && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Criterios para Merma</h2>
          <p className="text-sm text-gray-500 mb-4">
            Marca los criterios que quieres usar. Al registrar una merma, solo se mostrarán los productos que califiquen según los criterios activos.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {CRITERIOS_MERMA.map((criterio) => (
              <label
                key={criterio}
                className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  checked={!!configCriterios[criterio]}
                  onChange={() => toggleCriterio(criterio)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm text-gray-700">{criterio}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarConfig(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={guardarConfig}
              disabled={guardandoConfig}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2"
            >
              {guardandoConfig ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Mermas</p>
          <p className="text-2xl font-bold text-gray-800">{mermas.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pérdida Estimada</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalMermas)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Productos Afectados</p>
          <p className="text-2xl font-bold text-gray-800">{new Set(mermas.map((m) => m.productoId)).size}</p>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Nueva Merma</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <select
                value={form.productoId}
                onChange={(e) => setForm({ ...form, productoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Seleccionar...</option>
                {productosFiltrados.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (stockActual: {p.stockActual} {p.unidad})
                  </option>
                ))}
              </select>
              {CRITERIOS_MERMA.filter((c) => configCriterios[c]).length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Mostrando {productosFiltrados.length} producto(s) según criterios activos
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <select
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              >
                {MOTIVOS_MERMA.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <input
                type="text"
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Opcional"
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
              onClick={handleGuardar}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Registrar Merma
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3">Motivo</th>
              <th className="text-right px-4 py-3">Cantidad</th>
              <th className="text-right px-4 py-3">Pérdida</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mermas.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-600">{formatDate(m.createdAt)}</td>
                <td className="px-4 py-2">{m.productoNombre}</td>
                <td className="px-4 py-2">{m.motivo}</td>
                <td className="px-4 py-2 text-right">{m.cantidad} {m.unidad}</td>
                <td className="px-4 py-2 text-right font-medium text-red-600">{formatCurrency(m.perdidaEstimada)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleEliminar(m.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mermas.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle size={40} className="mx-auto mb-2" />
            <p>No hay mermas registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}

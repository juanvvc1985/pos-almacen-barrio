import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { productsService } from "../services/firestoreProducts";
import { configService } from "../services/firestoreConfig";
import { CRITERIOS_OFERTA, DIAS_POR_VENCER_DEFAULT } from "../types/index";
import { formatCurrency } from "../utils/format";
import { Tag, Plus, Loader2, Settings, Check, Calendar } from "lucide-react";

export default function Offers() {
  const { almacenId } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [configCriterios, setConfigCriterios] = useState({});
  const [diasPorVencer, setDiasPorVencer] = useState(DIAS_POR_VENCER_DEFAULT);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [form, setForm] = useState({ productoId: "", precioOferta: "", razon: "" });

  useEffect(() => {
    if (almacenId) {
      cargarProductos();
      cargarConfig();
    }
  }, [almacenId]);

  async function cargarProductos() {
    setLoading(true);
    const data = await productsService.getProducts(almacenId);
    setProductos(data);
    setLoading(false);
  }

  async function cargarConfig() {
    const cfg = await configService.getConfig(almacenId);
    setConfigCriterios(cfg.ofertasCriterios || {});
    if (cfg.diasPorVencer) setDiasPorVencer(cfg.diasPorVencer);
  }

  async function guardarConfig() {
    setGuardandoConfig(true);
    try {
      const cfg = await configService.getConfig(almacenId);
      await configService.updateConfig(almacenId, {
        ...cfg,
        ofertasCriterios: configCriterios,
        diasPorVencer: Number(diasPorVencer) || DIAS_POR_VENCER_DEFAULT,
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
    const activos = CRITERIOS_OFERTA.filter((c) => configCriterios[c]);
    if (activos.length === 0) return true;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(hoy);
    limite.setDate(hoy.getDate() + (Number(diasPorVencer) || DIAS_POR_VENCER_DEFAULT));

    return activos.some((criterio) => {
      switch (criterio) {
        case "Por vencer":
          return (
            producto.perecedero &&
            producto.lotes?.some((l) => {
              const fv = new Date(l.fechaVencimiento);
              fv.setHours(0, 0, 0, 0);
              return fv >= hoy && fv <= limite;
            })
          );
        case "Embalaje dañado":
        case "Daño menor / deterioro estético":
        case "Sobrestock":
        case "Otro":
          return true;
        default:
          return false;
      }
    });
  }

  const productosFiltrados = productos.filter((p) => !p.enOferta && productoCalifica(p));

  async function handleCrearOferta() {
    const producto = productos.find((p) => p.id === form.productoId);
    if (!producto) {
      alert("Selecciona un producto");
      return;
    }
    const precioOferta = Number(form.precioOferta);
    if (isNaN(precioOferta) || precioOferta <= 0 || precioOferta >= producto.precioVenta) {
      alert("El precio de oferta debe ser menor al precio normal");
      return;
    }

    try {
      await productsService.updateProduct(producto.id, {
        enOferta: true,
        precioOferta,
        razonOferta: form.razon || null,
      });
      await cargarProductos();
      setMostrarForm(false);
      setForm({ productoId: "", precioOferta: "", razon: "" });
    } catch (err) {
      alert("Error al crear oferta");
    }
  }

  async function handleQuitarOferta(productoId) {
    if (!confirm("¿Quitar esta oferta?")) return;
    try {
      await productsService.updateProduct(productoId, {
        enOferta: false,
        precioOferta: null,
        razonOferta: null,
      });
      await cargarProductos();
    } catch (err) {
      alert("Error al quitar oferta");
    }
  }

  const productosEnOferta = productos.filter((p) => p.enOferta);

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
          <Tag className="w-6 h-6 text-red-600" />
          Ofertas Especiales
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
            <Plus size={18} /> Nueva Oferta
          </button>
        </div>
      </div>

      {/* Configuración de criterios */}
      {mostrarConfig && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Criterios para Ofertas</h2>
          <p className="text-sm text-gray-500 mb-4">
            Marca los criterios que quieres usar. Al crear una oferta, solo se mostrarán los productos que califiquen según los criterios activos.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {CRITERIOS_OFERTA.map((criterio) => (
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
          {configCriterios["Por vencer"] && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <label className="flex items-center gap-2 text-sm font-medium text-orange-800">
                <Calendar size={16} />
                Días para considerar "por vencer"
              </label>
              <input
                type="number"
                value={diasPorVencer}
                onChange={(e) => setDiasPorVencer(e.target.value)}
                className="mt-2 w-32 px-3 py-2 border border-orange-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-400"
                min="1"
                max="90"
              />
            </div>
          )}
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

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Crear Oferta</h2>
          <div className="grid md:grid-cols-3 gap-4">
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
                    {p.nombre} - {formatCurrency(p.precioVenta)}
                  </option>
                ))}
              </select>
              {CRITERIOS_OFERTA.filter((c) => configCriterios[c]).length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Mostrando {productosFiltrados.length} producto(s) según criterios activos
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio de oferta</label>
              <input
                type="number"
                value={form.precioOferta}
                onChange={(e) => setForm({ ...form, precioOferta: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Razón (opcional)</label>
              <input
                type="text"
                value={form.razon}
                onChange={(e) => setForm({ ...form, razon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Ej: Daño menor en embalaje"
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
              onClick={handleCrearOferta}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Crear Oferta
            </button>
          </div>
        </div>
      )}

      {/* Ofertas activas */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {productosEnOferta.map((p) => {
          const ahorro = p.precioVenta - p.precioOferta;
          const porcentaje = Math.round((ahorro / p.precioVenta) * 100);
          return (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-red-200 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                -{porcentaje}%
              </div>
              <h3 className="font-bold text-gray-800 pr-16">{p.nombre}</h3>
              {p.razonOferta && (
                <p className="text-sm text-gray-500 mt-1">{p.razonOferta}</p>
              )}
              <div className="flex items-end gap-2 mt-3">
                <span className="text-2xl font-bold text-red-600">{formatCurrency(p.precioOferta)}</span>
                <span className="text-sm text-gray-400 line-through">{formatCurrency(p.precioVenta)}</span>
              </div>
              <p className="text-sm text-green-600 mt-1">Ahorro: {formatCurrency(ahorro)}</p>
              <button
                onClick={() => handleQuitarOferta(p.id)}
                className="mt-3 w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Quitar oferta
              </button>
            </div>
          );
        })}
      </div>

      {productosEnOferta.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Tag size={40} className="mx-auto mb-2" />
          <p>No hay ofertas activas</p>
        </div>
      )}
    </div>
  );
}

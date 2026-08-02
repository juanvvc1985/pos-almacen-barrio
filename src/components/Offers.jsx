import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { productsService } from "../services/firestoreProducts";
import { formatCurrency } from "../utils/format";
import { Tag, Plus, X, Check, Loader2, Percent } from "lucide-react";

export default function Offers() {
  const { almacenId } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ productoId: "", precioOferta: "", razon: "" });

  useEffect(() => {
    if (almacenId) cargarProductos();
  }, [almacenId]);

  async function cargarProductos() {
    setLoading(true);
    const data = await productsService.getProducts(almacenId);
    setProductos(data);
    setLoading(false);
  }

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
  const productosSinOferta = productos.filter((p) => !p.enOferta);

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
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <Plus size={18} /> Nueva Oferta
        </button>
      </div>

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
                {productosSinOferta.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} - {formatCurrency(p.precioVenta)}
                  </option>
                ))}
              </select>
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

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { productsService } from "../services/firestoreProducts";
import { UNIDADES, CATEGORIAS, DIAS_ALERTA_VENCIMIENTO } from "../types/index";
import { formatCurrency } from "../utils/format";
import BarcodeScanner from "./BarcodeScanner";
import InventoryAlert from "./InventoryAlert";
import {
  Search, Plus, Edit2, Trash2, Package, X, Check, ScanLine,
  Loader2
} from "lucide-react";

export default function ProductManager() {
  const { almacenId, isDueño } = useAuth();
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mostrarScanner, setMostrarScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState("");
  const [productoStock, setProductoStock] = useState(null);
  const [cantidadStock, setCantidadStock] = useState("");
  const [loteVencimiento, setLoteVencimiento] = useState("");

  const [form, setForm] = useState({
    nombre: "", codigoBarras: "", precioVenta: "", precioCompra: "",
    stock: "", stockCritico: "", unidad: "unidad", categoria: "Abarrotes",
    perecedero: false, diasAlertaVencimiento: 3, enOferta: false, precioOferta: "", lotes: [],
  });

  useEffect(() => {
    if (almacenId) cargarProductos();
  }, [almacenId]);

  async function cargarProductos() {
    setLoading(true);
    const data = await productsService.getProducts(almacenId);
    setProductos(data);
    setLoading(false);
  }

  const productosFiltrados = search.trim()
    ? productos.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
          p.codigoBarras?.includes(search) ||
          p.categoria?.toLowerCase().includes(search.toLowerCase())
      )
    : productos;

  function resetForm() {
    setForm({
      nombre: "", codigoBarras: "", precioVenta: "", precioCompra: "",
      stock: "", stockCritico: "", unidad: "unidad", categoria: "Abarrotes",
      perecedero: false, diasAlertaVencimiento: 3, enOferta: false, precioOferta: "", lotes: [],
    });
    setEditando(null);
  }

  function handleEditar(producto) {
    if (!isDueño) return;
    setForm({
      nombre: producto.nombre || "", codigoBarras: producto.codigoBarras || "",
      precioVenta: producto.precioVenta?.toString() || "",
      precioCompra: producto.precioCompra?.toString() || "",
      stock: producto.stock?.toString() || "",
      stockCritico: producto.stockCritico?.toString() || "",
      unidad: producto.unidad || "unidad", categoria: producto.categoria || "Abarrotes",
      perecedero: producto.perecedero || false,
      diasAlertaVencimiento: producto.diasAlertaVencimiento || 3,
      enOferta: producto.enOferta || false,
      precioOferta: producto.precioOferta?.toString() || "", lotes: producto.lotes || [],
    });
    setEditando(producto.id);
    setMostrarForm(true);
  }

  async function handleGuardar() {
    if (!isDueño) return;
    const data = {
      nombre: form.nombre.trim(), codigoBarras: form.codigoBarras.trim() || null,
      precioVenta: Number(form.precioVenta) || 0, precioCompra: Number(form.precioCompra) || 0,
      stock: Number(form.stock) || 0, stockCritico: Number(form.stockCritico) || 0,
      unidad: form.unidad, categoria: form.categoria,
      perecedero: form.perecedero, diasAlertaVencimiento: Number(form.diasAlertaVencimiento) || 3,
      enOferta: form.enOferta, precioOferta: form.enOferta ? Number(form.precioOferta) || 0 : null,
      lotes: form.lotes || [],
    };
    if (!data.nombre) { alert("El nombre es obligatorio"); return; }
    try {
      if (editando) await productsService.updateProduct(editando, data);
      else await productsService.createProduct(almacenId, data);
      await cargarProductos();
      setMostrarForm(false); resetForm();
    } catch (err) { alert("Error al guardar: " + err.message); }
  }

  async function handleEliminar(id) {
    if (!isDueño) return;
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    await productsService.deleteProduct(id);
    await cargarProductos();
  }

  async function handleAgregarStock(producto) {
    setProductoStock(producto);
    setCantidadStock(""); setLoteVencimiento("");
  }

  async function confirmarAgregarStock() {
    if (!productoStock || !cantidadStock) return;
    const cantidad = Number(cantidadStock);
    if (isNaN(cantidad) || cantidad <= 0) { alert("Ingresa una cantidad válida"); return; }
    const loteData = productoStock.perecedero && loteVencimiento ? { fechaVencimiento: loteVencimiento } : null;
    try {
      await productsService.addStock(productoStock.id, cantidad, loteData);
      await cargarProductos();
      setProductoStock(null); setCantidadStock(""); setLoteVencimiento("");
    } catch (err) { alert("Error al agregar stock"); }
  }

  async function handleScan(code) {
    if (scannerMode === "nuevo") setForm({ ...form, codigoBarras: code });
    else if (scannerMode === "stock") {
      const producto = await productsService.getProductByBarcode(almacenId, code);
      if (producto) { setProductoStock(producto); setCantidadStock(""); setLoteVencimiento(""); }
      else alert("Producto no encontrado");
    }
    setMostrarScanner(false); setScannerMode("");
  }

  function getStockStatus(producto) {
    if (producto.stock === 0) return { label: "Sin stock", bg: "bg-red-50", text: "text-red-700" };
    if (producto.stockCritico && producto.stock <= producto.stockCritico) return { label: "Crítico", bg: "bg-orange-50", text: "text-orange-700" };
    return { label: "OK", bg: "bg-green-50", text: "text-green-700" };
  }

  return (
    <div>
      <InventoryAlert />
      {mostrarScanner && <BarcodeScanner onScan={handleScan} onClose={() => { setMostrarScanner(false); setScannerMode(""); }} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" /> Productos
        </h1>
        <div className="flex gap-2">
          {isDueño && (
            <button onClick={() => { resetForm(); setMostrarForm(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
              <Plus size={18} /> Nuevo Producto
            </button>
          )}
          <button onClick={() => { setScannerMode("stock"); setMostrarScanner(true); }}
            className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
            <ScanLine size={18} /> Escanear Stock
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código o categoría..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      {mostrarForm && isDueño && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">{editando ? "Editar Producto" : "Nuevo Producto"}</h2>
            <button onClick={() => { setMostrarForm(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Harina 1kg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de barras</label>
              <div className="flex gap-2">
                <input type="text" value={form.codigoBarras} onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Escanea o escribe" />
                <button onClick={() => { setScannerMode("nuevo"); setMostrarScanner(true); }} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><ScanLine size={18} /></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta *</label>
              <input type="number" value={form.precioVenta} onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio de compra (costo)</label>
              <input type="number" value={form.precioCompra} onChange={(e) => setForm({ ...form, precioCompra: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock inicial</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock crítico (alerta)</label>
              <input type="number" value={form.stockCritico} onChange={(e) => setForm({ ...form, stockCritico: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="5" min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.perecedero} onChange={(e) => setForm({ ...form, perecedero: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Producto perecedero</span>
              </label>
            </div>
            {form.perecedero && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Días de alerta antes de vencer</label>
                <select value={form.diasAlertaVencimiento} onChange={(e) => setForm({ ...form, diasAlertaVencimiento: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  {DIAS_ALERTA_VENCIMIENTO.map((d) => <option key={d} value={d}>{d} días</option>)}
                </select>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.enOferta} onChange={(e) => setForm({ ...form, enOferta: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Producto en oferta</span>
              </label>
            </div>
            {form.enOferta && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de oferta</label>
                <input type="number" value={form.precioOferta} onChange={(e) => setForm({ ...form, precioOferta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" min="0" />
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setMostrarForm(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleGuardar}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"><Check size={18} /> {editando ? "Actualizar" : "Guardar"}</button>
          </div>
        </div>
      )}

      {productoStock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-1">Agregar stock</h3>
            <p className="text-sm text-gray-500 mb-4">{productoStock.nombre}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a agregar</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={cantidadStock} onChange={(e) => setCantidadStock(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-lg font-mono text-center outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0" min="0" step="0.01" autoFocus />
                  <span className="text-gray-500 text-sm">{productoStock.unidad}</span>
                </div>
              </div>
              {productoStock.perecedero && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento del lote</label>
                  <input type="date" value={loteVencimiento} onChange={(e) => setLoteVencimiento(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setProductoStock(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmarAgregarStock}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"><Plus size={16} /> Agregar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productosFiltrados.map((p) => {
                  const status = getStockStatus(p);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{p.nombre}</p>
                          <p className="text-xs text-gray-400">{p.categoria} • {p.unidad}</p>
                          {p.codigoBarras && <p className="text-xs text-gray-400 font-mono">{p.codigoBarras}</p>}
                          {p.enOferta && <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">OFERTA: {formatCurrency(p.precioOferta)}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-bold text-gray-800">{formatCurrency(p.precioVenta)}</p>
                        <p className="text-xs text-gray-400">Costo: {formatCurrency(p.precioCompra)}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-medium text-gray-800">{p.stock} {p.unidad}</p>
                        {p.stockCritico > 0 && <p className="text-xs text-gray-400">Mín: {p.stockCritico}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleAgregarStock(p)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Agregar stock"><Plus size={16} /></button>
                          {isDueño && (
                            <>
                              <button onClick={() => handleEditar(p)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar"><Edit2 size={16} /></button>
                              <button onClick={() => handleEliminar(p.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar"><Trash2 size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {productosFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-400"><Package size={40} className="mx-auto mb-2" /><p>No hay productos</p></div>
          )}
        </div>
      )}
    </div>
  );
}

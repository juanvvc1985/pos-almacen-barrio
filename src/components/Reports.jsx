import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { salesService } from "../services/firestoreSales";
import { fiadosService } from "../services/firestoreFiados";
import { mermasService } from "../services/firestoreMermas";
import { productsService } from "../services/firestoreProducts";
import { formatCurrency, formatDate } from "../utils/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart3, Download, Calendar, TrendingUp, Package,
  DollarSign, CreditCard, Smartphone, Users, AlertTriangle,
  Loader2, Search, ArrowUpDown
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"];

export default function Reports() {
  const { almacenId } = useAuth();
  const [activeTab, setActiveTab] = useState("ventas");
  const [ventas, setVentas] = useState([]);
  const [fiados, setFiados] = useState([]);
  const [mermas, setMermas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTiempo, setFiltroTiempo] = useState("hoy");
  const [searchInv, setSearchInv] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "nombre", direction: "asc" });

  useEffect(() => {
    if (almacenId) cargarDatos();
  }, [almacenId]);

  async function cargarDatos() {
    setLoading(true);
    const [v, f, m, p] = await Promise.all([
      salesService.getSales(almacenId),
      fiadosService.getFiados(almacenId),
      mermasService.getMermas(almacenId),
      productsService.getProducts(almacenId),
    ]);
    setVentas(v);
    setFiados(f);
    setMermas(m);
    setProductos(p);
    setLoading(false);
  }

  function getFechaFiltro() {
    const hoy = new Date();
    switch (filtroTiempo) {
      case "hoy":
        return hoy.toISOString().split("T")[0];
      case "semana":
        const semana = new Date(hoy);
        semana.setDate(hoy.getDate() - 7);
        return semana.toISOString().split("T")[0];
      case "mes":
        const mes = new Date(hoy);
        mes.setDate(hoy.getDate() - 30);
        return mes.toISOString().split("T")[0];
      default:
        return null;
    }
  }

  const fechaFiltro = getFechaFiltro();
  const ventasFiltradas = fechaFiltro
    ? ventas.filter((v) => v.createdAt >= fechaFiltro)
    : ventas;

  const totalVentas = ventasFiltradas.reduce((s, v) => s + (v.total || 0), 0);
  const porMetodo = {};
  ventasFiltradas.forEach((v) => {
    porMetodo[v.metodoPago] = (porMetodo[v.metodoPago] || 0) + (v.total || 0);
  });
  const chartData = Object.entries(porMetodo).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Fiados
  const fiadosPendientes = fiados.filter((f) => f.estado === "pendiente" || f.estado === "parcial");
  const totalFiadoPendiente = fiadosPendientes.reduce((s, f) => s + ((f.total || 0) - (f.pagos?.reduce((p, pay) => p + (pay.monto || 0), 0) || 0)), 0);
  const totalRecuperado = fiados.reduce((s, f) => s + (f.pagos?.reduce((p, pay) => p + (pay.monto || 0), 0) || 0), 0);
  const fiadosAtrasadas = fiados.filter((f) => {
    const dias = Math.floor((new Date() - new Date(f.createdAt)) / (1000 * 60 * 60 * 24));
    return (f.estado === "pendiente" || f.estado === "parcial") && dias > 7;
  });

  // Mermas
  const totalMermas = mermas.reduce((s, m) => s + (m.perdidaEstimada || 0), 0);
  const porMotivo = {};
  mermas.forEach((m) => {
    porMotivo[m.motivo] = (porMotivo[m.motivo] || 0) + (m.perdidaEstimada || 0);
  });
  const mermaChartData = Object.entries(porMotivo).map(([name, value]) => ({ name, value }));

  // Inventario
  const totalProductos = productos.length;
  const valorStockCosto = productos.reduce((s, p) => s + (p.precioCompra || 0) * (p.stock || 0), 0);
  const valorStockVenta = productos.reduce((s, p) => s + (p.precioVenta || 0) * (p.stock || 0), 0);
  const stockCritico = productos.filter((p) => p.stockCritico && p.stock <= p.stockCritico && p.stock > 0).length;

  const productosFiltrados = search.trim()
    ? productos.filter((p) =>
        p.nombre?.toLowerCase().includes(searchInv.toLowerCase()) ||
        p.codigoBarras?.includes(searchInv) ||
        p.categoria?.toLowerCase().includes(searchInv.toLowerCase())
      )
    : productos;

  const sortedProductos = [...productosFiltrados].sort((a, b) => {
    const aVal = a[sortConfig.key] || 0;
    const bVal = b[sortConfig.key] || 0;
    if (sortConfig.direction === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  function toggleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function exportarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Inventario - POS Almacén de Barrio", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 30);
    doc.text(`Total productos: ${totalProductos}`, 14, 38);
    doc.text(`Valor stock (costo): ${formatCurrency(valorStockCosto)}`, 14, 46);
    doc.text(`Valor stock (venta): ${formatCurrency(valorStockVenta)}`, 14, 54);

    const body = sortedProductos.map((p) => [
      p.nombre,
      p.categoria,
      p.stock + " " + p.unidad,
      formatCurrency(p.precioVenta),
      formatCurrency(p.precioCompra),
      p.stock <= (p.stockCritico || 0) ? "Crítico" : "OK",
    ]);

    autoTable(doc, {
      head: [["Producto", "Categoría", "Stock", "Precio Venta", "Precio Costo", "Estado"]],
      body,
      startY: 62,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("inventario.pdf");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        Informes
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {[
          { id: "ventas", label: "Ventas", icon: TrendingUp },
          { id: "fiados", label: "Fiados", icon: Users },
          { id: "mermas", label: "Mermas", icon: AlertTriangle },
          { id: "inventario", label: "Inventario", icon: Package },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ventas */}
      {activeTab === "ventas" && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {[
              { value: "hoy", label: "Hoy" },
              { value: "semana", label: "Última semana" },
              { value: "mes", label: "Último mes" },
              { value: "todo", label: "Todo" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltroTiempo(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filtroTiempo === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalVentas)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Efectivo</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(porMetodo.efectivo || 0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Tarjeta</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(porMetodo.tarjeta || 0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Transferencia</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(porMetodo.transferencia || 0)}</p>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Ventas por método de pago</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `$${v.toLocaleString("es-CL")}`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Vendedor</th>
                  <th className="text-left px-4 py-3">Método</th>
                  <th className="text-right px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventasFiltradas.slice(0, 50).map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{formatDate(v.createdAt)}</td>
                    <td className="px-4 py-2">{v.vendedorNombre}</td>
                    <td className="px-4 py-2">
                      <span className="capitalize px-2 py-0.5 rounded-full text-xs bg-gray-100">{v.metodoPago}</span>
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fiados */}
      {activeTab === "fiados" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Pendiente</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalFiadoPendiente)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Recuperado</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRecuperado)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Deudas Atrasadas</p>
              <p className="text-2xl font-bold text-red-600">{fiadosAtrasadas.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Clientes Deudores</p>
              <p className="text-2xl font-bold text-gray-800">{fiadosPendientes.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-right px-4 py-3">Pagado</th>
                  <th className="text-center px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fiados.map((f) => {
                  const pagado = f.pagos?.reduce((s, p) => s + (p.monto || 0), 0) || 0;
                  return (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{f.clienteNombre}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(f.total)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(pagado)}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          f.estado === "pagada" ? "bg-green-100 text-green-700" :
                          f.estado === "parcial" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {f.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mermas */}
      {activeTab === "mermas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Mermas</p>
              <p className="text-2xl font-bold text-red-600">{mermas.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Pérdida Estimada</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalMermas)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Productos Afectados</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(mermas.map((m) => m.productoId)).size}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Promedio</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(mermas.length ? totalMermas / mermas.length : 0)}
              </p>
            </div>
          </div>

          {mermaChartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Mermas por motivo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={mermaChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {mermaChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Producto</th>
                  <th className="text-left px-4 py-3">Motivo</th>
                  <th className="text-right px-4 py-3">Cantidad</th>
                  <th className="text-right px-4 py-3">Pérdida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mermas.slice(0, 50).map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-2">{m.productoNombre}</td>
                    <td className="px-4 py-2">{m.motivo}</td>
                    <td className="px-4 py-2 text-right">{m.cantidad}</td>
                    <td className="px-4 py-2 text-right font-medium text-red-600">{formatCurrency(m.perdidaEstimada)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventario */}
      {activeTab === "inventario" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Productos</p>
              <p className="text-2xl font-bold text-gray-800">{totalProductos}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Valor Stock (Costo)</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(valorStockCosto)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Valor Stock (Venta)</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(valorStockVenta)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Stock Crítico</p>
              <p className="text-2xl font-bold text-orange-600">{stockCritico}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchInv}
                onChange={(e) => setSearchInv(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={exportarPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              <Download size={16} /> Exportar PDF
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort("nombre")}>
                    Producto <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="text-left px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort("categoria")}>
                    Categoría <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="text-right px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort("stock")}>
                    Stock <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="text-right px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort("precioVenta")}>
                    Precio <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="text-center px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedProductos.map((p) => {
                  const status = p.stock === 0
                    ? { label: "Sin stock", class: "bg-red-100 text-red-700" }
                    : p.stockCritico && p.stock <= p.stockCritico
                    ? { label: "Crítico", class: "bg-orange-100 text-orange-700" }
                    : { label: "OK", class: "bg-green-100 text-green-700" };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{p.nombre}</td>
                      <td className="px-4 py-2 text-gray-500">{p.categoria}</td>
                      <td className="px-4 py-2 text-right">{p.stock} {p.unidad}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(p.precioVenta)}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${status.class}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

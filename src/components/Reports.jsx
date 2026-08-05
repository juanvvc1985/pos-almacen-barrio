import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { salesService } from "../services/firestoreSales";
import { fiadosService } from "../services/firestoreFiados";
import { mermasService } from "../services/firestoreMermas";
import { productsService } from "../services/firestoreProducts";
import { getPlan } from "../services/planLimits";
import { formatCurrency, formatDate, formatShortDate } from "../utils/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart3, Download, Calendar, TrendingUp, Package,
  DollarSign, CreditCard, Smartphone, Users, AlertTriangle,
  Loader2, Search, ArrowUpDown, Repeat, BookOpen, Crown, Lock
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"];

export default function Reports() {
  const { almacenId, userData } = useAuth();
  const [activeTab, setActiveTab] = useState("ventas");
  const [ventas, setVentas] = useState([]);
  const [fiados, setFiados] = useState([]);
  const [mermas, setMermas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTiempo, setFiltroTiempo] = useState("hoy");
  const [searchInv, setSearchInv] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "nombre", direction: "asc" });
  const [plan, setPlan] = useState("basico");
  const [mesLibro, setMesLibro] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (almacenId) {
      cargarDatos();
      getPlan(almacenId).then(setPlan);
    }
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
      case "hoy": return hoy.toISOString().split("T")[0];
      case "semana": { const s = new Date(hoy); s.setDate(hoy.getDate() - 7); return s.toISOString().split("T")[0]; }
      case "mes": { const m = new Date(hoy); m.setDate(hoy.getDate() - 30); return m.toISOString().split("T")[0]; }
      default: return null;
    }
  }

  const fechaFiltro = getFechaFiltro();
  const ventasFiltradas = fechaFiltro ? ventas.filter((v) => v.createdAt >= fechaFiltro) : ventas;
  const ventasNormales = ventasFiltradas.filter((v) => v.tipo !== "fiado-recuperado");
  const recuperacionesFiado = ventasFiltradas.filter((v) => v.tipo === "fiado-recuperado");

  const porMetodoVentas = { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 };
  ventasNormales.forEach((v) => { if (porMetodoVentas[v.metodoPago] !== undefined) porMetodoVentas[v.metodoPago] += v.total || 0; });

  const porMetodoRecuperacion = { efectivo: 0, tarjeta: 0, transferencia: 0 };
  recuperacionesFiado.forEach((v) => { if (porMetodoRecuperacion[v.metodoPago] !== undefined) porMetodoRecuperacion[v.metodoPago] += v.total || 0; });

  const totalVentasNormales = ventasNormales.reduce((s, v) => s + (v.total || 0), 0);
  const totalRecuperaciones = recuperacionesFiado.reduce((s, v) => s + (v.total || 0), 0);
  const totalVentasGlobal = totalVentasNormales + totalRecuperaciones;

  const chartData = [
    { name: "Efectivo", venta: porMetodoVentas.efectivo || 0, recuperacion: porMetodoRecuperacion.efectivo || 0 },
    { name: "Tarjeta", venta: porMetodoVentas.tarjeta || 0, recuperacion: porMetodoRecuperacion.tarjeta || 0 },
    { name: "Transferencia", venta: porMetodoVentas.transferencia || 0, recuperacion: porMetodoRecuperacion.transferencia || 0 },
  ];

  const fiadosPendientes = fiados.filter((f) => f.estado === "pendiente" || f.estado === "parcial");
  const totalFiadoPendiente = fiadosPendientes.reduce((s, f) => s + ((f.total || 0) - (f.pagos?.reduce((p, pay) => p + (pay.monto || 0), 0) || 0)), 0);
  const totalRecuperado = fiados.reduce((s, f) => s + (f.pagos?.reduce((p, pay) => p + (pay.monto || 0), 0) || 0), 0);
  const fiadosAtrasadas = fiados.filter((f) => {
    const dias = Math.floor((new Date() - new Date(f.createdAt)) / (1000 * 60 * 60 * 24));
    return (f.estado === "pendiente" || f.estado === "parcial") && dias > 7;
  });

  const totalMermas = mermas.reduce((s, m) => s + (m.perdidaEstimada || 0), 0);
  const porMotivo = {};
  mermas.forEach((m) => { porMotivo[m.motivo] = (porMotivo[m.motivo] || 0) + (m.perdidaEstimada || 0); });
  const mermaChartData = Object.entries(porMotivo).map(([name, value]) => ({ name, value }));

  const totalProductos = productos.length;
  const valorStockCosto = productos.reduce((s, p) => s + (p.precioCompra || 0) * (p.stock || 0), 0);
  const valorStockVenta = productos.reduce((s, p) => s + (p.precioVenta || 0) * (p.stock || 0), 0);
  const stockCritico = productos.filter((p) => p.stockCritico && p.stock <= p.stockCritico && p.stock > 0).length;

  const productosFiltrados = searchInv.trim() ? productos.filter((p) =>
    p.nombre?.toLowerCase().includes(searchInv.toLowerCase()) ||
    p.codigoBarras?.includes(searchInv) ||
    p.categoria?.toLowerCase().includes(searchInv.toLowerCase())
  ) : productos;

  const sortedProductos = [...productosFiltrados].sort((a, b) => {
    const aVal = a[sortConfig.key] || 0;
    const bVal = b[sortConfig.key] || 0;
    if (sortConfig.direction === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  function toggleSort(key) {
    setSortConfig((prev) => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
  }

  function exportarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Inventario - POS Almacen de Barrio", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 30);
    doc.text(`Total productos: ${totalProductos}`, 14, 38);
    doc.text(`Valor stock (costo): ${formatCurrency(valorStockCosto)}`, 14, 46);
    doc.text(`Valor stock (venta): ${formatCurrency(valorStockVenta)}`, 14, 54);

    const body = sortedProductos.map((p) => [
      p.nombre, p.categoria, p.stock + " " + p.unidad,
      formatCurrency(p.precioVenta), formatCurrency(p.precioCompra),
      p.stock <= (p.stockCritico || 0) ? "Critico" : "OK",
    ]);

    autoTable(doc, {
      head: [["Producto", "Categoria", "Stock", "Precio Venta", "Precio Costo", "Estado"]],
      body, startY: 62, styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save("inventario.pdf");
  }

  // ===== LIBRO DE VENTAS =====
  function getVentasMes(anioMes) {
    return ventas.filter((v) => v.createdAt?.startsWith(anioMes));
  }

  function generarLibroVentasPDF() {
    const ventasMes = getVentasMes(mesLibro);
    const normales = ventasMes.filter((v) => v.tipo !== "fiado-recuperado");
    const recups = ventasMes.filter((v) => v.tipo === "fiado-recuperado");

    const totNorm = normales.reduce((s, v) => s + (v.total || 0), 0);
    const totRec = recups.reduce((s, v) => s + (v.total || 0), 0);

    const porMet = { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 };
    normales.forEach((v) => { if (porMet[v.metodoPago] !== undefined) porMet[v.metodoPago] += v.total || 0; });

    const fiadosMes = fiados.filter((f) => f.createdAt?.startsWith(mesLibro));
    const fiadosEmitidos = fiadosMes.reduce((s, f) => s + (f.total || 0), 0);
    const fiadosRecuperados = fiadosMes.reduce((s, f) => s + (f.pagos?.reduce((p, pay) => p + (pay.monto || 0), 0) || 0), 0);

    const mermasMes = mermas.filter((m) => m.createdAt?.startsWith(mesLibro));
    const totalMermasMes = mermasMes.reduce((s, m) => s + (m.perdidaEstimada || 0), 0);

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("LIBRO DE VENTAS", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(userData?.nombreAlmacen || "Almacen de Barrio", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Periodo: ${mesLibro}`, 105, 34, { align: "center" });
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 105, 39, { align: "center" });

    let y = 50;
    doc.setFontSize(12);
    doc.text("1. RESUMEN DE VENTAS", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Ventas normales: ${formatCurrency(totNorm)}`, 14, y); y += 6;
    doc.text(`Recuperacion fiados: ${formatCurrency(totRec)}`, 14, y); y += 6;
    doc.text(`TOTAL VENTAS: ${formatCurrency(totNorm + totRec)}`, 14, y); y += 10;

    doc.setFontSize(12);
    doc.text("2. DESGLOSE POR METODO DE PAGO", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Efectivo: ${formatCurrency(porMet.efectivo)}`, 14, y); y += 6;
    doc.text(`Tarjeta: ${formatCurrency(porMet.tarjeta)}`, 14, y); y += 6;
    doc.text(`Transferencia: ${formatCurrency(porMet.transferencia)}`, 14, y); y += 6;
    doc.text(`Fiado (credito): ${formatCurrency(porMet.fiado)}`, 14, y); y += 10;

    doc.setFontSize(12);
    doc.text("3. FIADOS", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Fiados emitidos: ${formatCurrency(fiadosEmitidos)}`, 14, y); y += 6;
    doc.text(`Fiados recuperados: ${formatCurrency(fiadosRecuperados)}`, 14, y); y += 6;
    doc.text(`Saldo pendiente: ${formatCurrency(fiadosEmitidos - fiadosRecuperados)}`, 14, y); y += 10;

    doc.setFontSize(12);
    doc.text("4. MERMAS", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Perdida estimada: ${formatCurrency(totalMermasMes)}`, 14, y); y += 6;
    doc.text(`Cantidad de mermas: ${mermasMes.length}`, 14, y); y += 10;

    doc.setFontSize(12);
    doc.text("5. VENTAS NETAS", 14, y);
    y += 8;
    doc.setFontSize(10);
    const ventasNetas = (totNorm + totRec) - totalMermasMes;
    doc.text(`Ventas netas (ventas - mermas): ${formatCurrency(ventasNetas)}`, 14, y);

    doc.save(`libro-ventas-${mesLibro}.pdf`);
  }

  // ===== INFORME DE VENTAS PDF (Plan Básico y Pro) =====
  function getMesActual() {
    return new Date().toISOString().slice(0, 7);
  }

  function puedeDescargarInformeVentas() {
    if (plan === "pro") return true;
    const mes = getMesActual();
    return !localStorage.getItem(`informe_ventas_${mes}`);
  }

  function marcarInformeVentasDescargado() {
    const mes = getMesActual();
    localStorage.setItem(`informe_ventas_${mes}`, "1");
  }

  function exportarVentasPDF() {
    if (!puedeDescargarInformeVentas()) {
      alert("Ya usaste tu informe gratuito de este mes. Upgrade a Pro para informes ilimitados.");
      return;
    }

    const doc = new jsPDF();
    const periodoLabel = {
      hoy: "Hoy",
      semana: "Última semana",
      mes: "Último mes",
      todo: "Todo el historial",
    }[filtroTiempo];

    doc.setFontSize(18);
    doc.text("Informe de Ventas", 14, 20);
    doc.setFontSize(11);
    doc.text(`Período: ${periodoLabel}`, 14, 28);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 34);
    doc.text(`Almacén: ${userData?.nombreAlmacen || "Almacén de Barrio"}`, 14, 40);

    let y = 50;
    doc.setFontSize(12);
    doc.text("1. RESUMEN", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Total Ventas: ${formatCurrency(totalVentasGlobal)}`, 14, y); y += 6;
    doc.text(`Ventas Normales: ${formatCurrency(totalVentasNormales)}`, 14, y); y += 6;
    doc.text(`Recuperación Fiados: ${formatCurrency(totalRecuperaciones)}`, 14, y); y += 6;
    doc.text(`Fiados (crédito): ${formatCurrency(porMetodoVentas.fiado || 0)}`, 14, y); y += 10;

    doc.setFontSize(12);
    doc.text("2. DESGLOSE POR MÉTODO DE PAGO", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Efectivo (ventas): ${formatCurrency(porMetodoVentas.efectivo)}`, 14, y); y += 6;
    doc.text(`Tarjeta (ventas): ${formatCurrency(porMetodoVentas.tarjeta)}`, 14, y); y += 6;
    doc.text(`Transferencia (ventas): ${formatCurrency(porMetodoVentas.transferencia)}`, 14, y); y += 6;
    doc.text(`Efectivo (recuperación): ${formatCurrency(porMetodoRecuperacion.efectivo)}`, 14, y); y += 6;
    doc.text(`Tarjeta (recuperación): ${formatCurrency(porMetodoRecuperacion.tarjeta)}`, 14, y); y += 6;
    doc.text(`Transferencia (recuperación): ${formatCurrency(porMetodoRecuperacion.transferencia)}`, 14, y); y += 10;

    if (ventasFiltradas.length > 0) {
      doc.setFontSize(12);
      doc.text("3. DETALLE DE VENTAS", 14, y);
      y += 7;
      const body = ventasFiltradas.slice(0, 100).map((v) => [
        formatDate(v.createdAt),
        v.vendedorNombre || "-",
        v.metodoPago,
        v.tipo === "fiado-recuperado" ? "Recuperación" : v.metodoPago === "fiado" ? "Venta fiado" : "Venta normal",
        formatCurrency(v.total),
      ]);
      autoTable(doc, {
        head: [["Fecha", "Vendedor", "Método", "Tipo", "Total"]],
        body,
        startY: y,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    doc.save(`informe-ventas-${filtroTiempo}-${new Date().toISOString().split("T")[0]}.pdf`);
    marcarInformeVentasDescargado();
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

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {[
          { id: "ventas", label: "Ventas", icon: TrendingUp },
          { id: "fiados", label: "Fiados", icon: Users },
          { id: "mermas", label: "Mermas", icon: AlertTriangle },
          { id: "inventario", label: "Inventario", icon: Package },
          { id: "libro", label: "Libro Ventas", icon: BookOpen, pro: true },
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
            {tab.pro && (
              <span className="ml-1">
                {plan === "pro" ? <Crown size={12} className="text-purple-600" /> : <Lock size={12} className="text-gray-400" />}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "ventas" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "hoy", label: "Hoy" },
                { value: "semana", label: "Ultima semana" },
                { value: "mes", label: "Ultimo mes" },
                { value: "todo", label: "Todo" },
              ].map((f) => (
                <button key={f.value} onClick={() => setFiltroTiempo(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    filtroTiempo === f.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>{f.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {plan === "basico" && (
                <span className={`text-xs px-2 py-1 rounded border ${
                  puedeDescargarInformeVentas()
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}>
                  {puedeDescargarInformeVentas() ? "1 informe gratis este mes" : "Informe gratuito usado"}
                </span>
              )}
              <button
                onClick={exportarVentasPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
              >
                <Download size={16} /> Descargar PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalVentasGlobal)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Ventas Normales</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalVentasNormales)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Recuperacion Fiados</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRecuperaciones)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Fiados (credito)</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(porMetodoVentas.fiado || 0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Desglose por metodo de pago</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700 font-medium">Efectivo — Ventas</p>
                <p className="text-xl font-bold text-green-800">{formatCurrency(porMetodoVentas.efectivo)}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700 font-medium">Efectivo — Recuperacion</p>
                <p className="text-xl font-bold text-green-800">{formatCurrency(porMetodoRecuperacion.efectivo)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium">Tarjeta — Ventas</p>
                <p className="text-xl font-bold text-blue-800">{formatCurrency(porMetodoVentas.tarjeta)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium">Tarjeta — Recuperacion</p>
                <p className="text-xl font-bold text-blue-800">{formatCurrency(porMetodoRecuperacion.tarjeta)}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-700 font-medium">Transferencia — Ventas</p>
                <p className="text-xl font-bold text-purple-800">{formatCurrency(porMetodoVentas.transferencia)}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-700 font-medium">Transferencia — Recuperacion</p>
                <p className="text-xl font-bold text-purple-800">{formatCurrency(porMetodoRecuperacion.transferencia)}</p>
              </div>
            </div>
          </div>

          {chartData.some((d) => d.venta > 0 || d.recuperacion > 0) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Ventas vs Recuperacion por metodo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `$${v.toLocaleString("es-CL")}`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="venta" name="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recuperacion" name="Recuperacion fiado" fill="#10b981" radius={[4, 4, 0, 0]} />
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
                  <th className="text-left px-4 py-3">Metodo</th>
                  <th className="text-left px-4 py-3">Tipo</th>
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
                    <td className="px-4 py-2">
                      {v.tipo === "fiado-recuperado" ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <Repeat size={12} /> Recuperacion fiado
                        </span>
                      ) : v.metodoPago === "fiado" ? (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Venta fiado</span>
                      ) : (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Venta normal</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                        }`}>{f.estado}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "mermas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Mermas</p>
              <p className="text-2xl font-bold text-red-600">{mermas.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Perdida Estimada</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalMermas)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Productos Afectados</p>
              <p className="text-2xl font-bold text-gray-800">{new Set(mermas.map((m) => m.productoId)).size}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Promedio</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(mermas.length ? totalMermas / mermas.length : 0)}</p>
            </div>
          </div>

          {mermaChartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Mermas por motivo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={mermaChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
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
                  <th className="text-right px-4 py-3">Perdida</th>
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
              <p className="text-sm text-gray-500">Stock Critico</p>
              <p className="text-2xl font-bold text-orange-600">{stockCritico}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" value={searchInv} onChange={(e) => setSearchInv(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button onClick={exportarPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">
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
                    Categoria <ArrowUpDown size={12} className="inline" />
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
                    ? { label: "Critico", class: "bg-orange-100 text-orange-700" }
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

      {activeTab === "libro" && (
        <div>
          {plan !== "pro" ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Lock size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">Libro de Ventas — Plan Pro</h3>
              <p className="text-gray-500 max-w-md mb-6">
                El Libro de Ventas para tu contador esta disponible exclusivamente en el Plan Pro.
                Genera informes mensuales en PDF listos para entregar.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 max-w-sm w-full">
                <div className="flex items-center gap-2 mb-3">
                  <Crown size={20} className="text-purple-600" />
                  <span className="font-bold text-purple-800">Plan Pro</span>
                </div>
                <ul className="text-sm text-purple-700 space-y-1 mb-4 text-left">
                  <li>• Libro de ventas mensual en PDF</li>
                  <li>• Productos ilimitados</li>
                  <li>• Vendedores ilimitados</li>
                  <li>• Exportacion CSV/Excel</li>
                </ul>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition">
                  Actualizar a Pro
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400" />
                  <input
                    type="month"
                    value={mesLibro}
                    onChange={(e) => setMesLibro(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={generarLibroVentasPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                >
                  <Download size={16} /> Descargar PDF para Contador
                </button>
              </div>

              <LibroVentasResumen mes={mesLibro} ventas={ventas} fiados={fiados} mermas={mermas} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LibroVentasResumen({ mes, ventas, fiados, mermas }) {
  const ventasMes = ventas.filter((v) => v.createdAt?.startsWith(mes));
  const normales = ventasMes.filter((v) => v.tipo !== "fiado-recuperado");
  const recups = ventasMes.filter((v) => v.tipo === "fiado-recuperado");
  const totNorm = normales.reduce((s, v) => s + (v.total || 0), 0);
  const totRec = recups.reduce((s, v) => s + (v.total || 0), 0);

  const porMet = { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 };
  normales.forEach((v) => { if (porMet[v.metodoPago] !== undefined) porMet[v.metodoPago] += v.total || 0; });

  const fiadosMes = fiados.filter((f) => f.createdAt?.startsWith(mes));
  const fiadosEmitidos = fiadosMes.reduce((s, f) => s + (f.total || 0), 0);
  const fiadosRecuperados = fiadosMes.reduce((s, f) => s + (f.pagos?.reduce((p, pay) => p + (pay.monto || 0), 0) || 0), 0);

  const mermasMes = mermas.filter((m) => m.createdAt?.startsWith(mes));
  const totalMermasMes = mermasMes.reduce((s, m) => s + (m.perdidaEstimada || 0), 0);
  const ventasNetas = (totNorm + totRec) - totalMermasMes;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Ventas Normales</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totNorm)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Recuperacion Fiados</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totRec)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Mermas del Mes</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalMermasMes)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Ventas Netas</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(ventasNetas)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Desglose por Metodo de Pago</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700 font-medium">Efectivo</p>
            <p className="text-xl font-bold text-green-800">{formatCurrency(porMet.efectivo)}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 font-medium">Tarjeta</p>
            <p className="text-xl font-bold text-blue-800">{formatCurrency(porMet.tarjeta)}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-purple-700 font-medium">Transferencia</p>
            <p className="text-xl font-bold text-purple-800">{formatCurrency(porMet.transferencia)}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-700 font-medium">Fiado</p>
            <p className="text-xl font-bold text-orange-800">{formatCurrency(porMet.fiado)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Fiados del Mes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-lg p-3 bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">Fiados Emitidos</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(fiadosEmitidos)}</p>
          </div>
          <div className="rounded-lg p-3 bg-green-50 border border-green-200">
            <p className="text-xs text-green-700 font-medium">Fiados Recuperados</p>
            <p className="text-xl font-bold text-green-800">{formatCurrency(fiadosRecuperados)}</p>
          </div>
          <div className="rounded-lg p-3 bg-orange-50 border border-orange-200">
            <p className="text-xs text-orange-700 font-medium">Saldo Pendiente</p>
            <p className="text-xl font-bold text-orange-800">{formatCurrency(fiadosEmitidos - fiadosRecuperados)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

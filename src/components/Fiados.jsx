import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fiadosService } from "../services/firestoreFiados";
import { salesService } from "../services/firestoreSales";
import { METODOS_PAGO } from "../types/index";
import { formatCurrency, formatDate } from "../utils/format";
import { Users, Trash2, DollarSign, CreditCard, Smartphone, Loader2, Search, CheckCircle } from "lucide-react";

export default function Fiados() {
  const { almacenId, isDueño } = useAuth();
  const [fiados, setFiados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [search, setSearch] = useState("");
  const [fiadoPago, setFiadoPago] = useState(null);
  const [pagoData, setPagoData] = useState({ monto: "", metodoPago: "efectivo" });

  useEffect(() => {
    if (almacenId) cargarFiados();
  }, [almacenId]);

  async function cargarFiados() {
    setLoading(true);
    const data = await fiadosService.getFiados(almacenId);
    setFiados(data);
    setLoading(false);
  }

  const fiadosFiltrados = fiados.filter((f) => {
    if (filtro !== "todas" && f.estado !== filtro) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return f.clienteNombre?.toLowerCase().includes(term) || f.clienteTelefono?.includes(term);
    }
    return true;
  });

  async function handlePagar() {
    if (!fiadoPago || !pagoData.monto) return;
    const monto = Number(pagoData.monto);
    if (isNaN(monto) || monto <= 0) { alert("Ingresa un monto válido"); return; }
    try {
      await fiadosService.addPago(fiadoPago.id, { monto, metodoPago: pagoData.metodoPago, fecha: new Date().toISOString() });
      await salesService.createSale(almacenId, {
        productos: [{ nombre: `Recuperación fiado - ${fiadoPago.clienteNombre}`, cantidad: 1, precioUnitario: monto, total: monto }],
        total: monto, metodoPago: pagoData.metodoPago, tipo: "fiado-recuperado",
        fiadoId: fiadoPago.id, vendedorNombre: "Sistema",
      });
      await cargarFiados();
      setFiadoPago(null); setPagoData({ monto: "", metodoPago: "efectivo" });
    } catch (err) { alert("Error al registrar pago"); }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Eliminar esta deuda?")) return;
    await fiadosService.deleteFiado(id);
    await cargarFiados();
  }

  const totalPendiente = fiados.filter((f) => f.estado === "pendiente" || f.estado === "parcial")
    .reduce((s, f) => s + ((f.total || 0) - (f.pagos?.reduce((p, pay) => p + (pay.monto || 0), 0) || 0)), 0);
  const totalPagado = fiados.reduce((s, f) => s + (f.pagos?.reduce((p, pay) => p + (pay.monto || 0), 0) || 0), 0);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Users className="w-6 h-6 text-orange-600" /> Fiados / Ventas a Crédito</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Pendiente</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPendiente)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Recuperado</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPagado)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Deudas Activas</p>
          <p className="text-2xl font-bold text-gray-800">{fiados.filter((f) => f.estado !== "pagada").length}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {[{ value: "todas", label: "Todas" }, { value: "pendiente", label: "Pendientes" }, { value: "parcial", label: "Parciales" }, { value: "pagada", label: "Pagadas" }].map((f) => (
            <button key={f.value} onClick={() => setFiltro(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${filtro === f.value ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f.label}</button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
        </div>
      </div>
      <div className="space-y-4">
        {fiadosFiltrados.map((f) => {
          const pagado = f.pagos?.reduce((s, p) => s + (p.monto || 0), 0) || 0;
          const restante = (f.total || 0) - pagado;
          const porcentaje = f.total ? (pagado / f.total) * 100 : 0;
          const dias = Math.floor((new Date() - new Date(f.createdAt)) / (1000 * 60 * 60 * 24));
          const atrasada = dias > 7 && f.estado !== "pagada";
          return (
            <div key={f.id} className={`bg-white rounded-xl shadow-sm border p-4 ${atrasada ? "border-red-300" : "border-gray-200"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800">{f.clienteNombre}</h3>
                    {atrasada && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Atrasada ({dias} días)</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.estado === "pagada" ? "bg-green-100 text-green-700" : f.estado === "parcial" ? "bg-yellow-100 text-yellow-700" : "bg-orange-100 text-orange-700"}`}>{f.estado}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{f.clienteTelefono && `${f.clienteTelefono} • `}{formatDate(f.createdAt)}</p>
                  <div className="mt-2 space-y-1">{f.productos?.map((prod, i) => <p key={i} className="text-sm text-gray-600">{prod.cantidad}x {prod.nombre} = {formatCurrency(prod.total)}</p>)}</div>
                </div>
                <div className="text-right min-w-[140px]">
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(f.total)}</p>
                  <p className="text-sm text-gray-500">Pagado: {formatCurrency(pagado)}</p>
                  {f.estado !== "pagada" && <p className="text-sm font-medium text-orange-600">Resta: {formatCurrency(restante)}</p>}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(porcentaje, 100)}%` }} /></div>
                </div>
              </div>
              {f.pagos?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Historial de pagos:</p>
                  <div className="space-y-1">{f.pagos.map((pago, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{formatDate(pago.fecha)} • {pago.metodoPago}</span>
                      <span className="font-medium text-green-600">{formatCurrency(pago.monto)}</span>
                    </div>
                  ))}</div>
                </div>
              )}
              {f.estado !== "pagada" && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <button onClick={() => { setFiadoPago(f); setPagoData({ monto: restante.toString(), metodoPago: "efectivo" }); }}
                    className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 rounded-lg text-sm font-medium transition">Registrar Pago</button>
                  {isDueño && (
                    <button onClick={() => handleEliminar(f.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {fiadosFiltrados.length === 0 && <div className="text-center py-8 text-gray-400"><Users size={40} className="mx-auto mb-2" /><p>No hay deudas en esta categoría</p></div>}

      {fiadoPago && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-1">Registrar Pago</h3>
            <p className="text-sm text-gray-500 mb-4">{fiadoPago.clienteNombre}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input type="number" value={pagoData.monto} onChange={(e) => setPagoData({ ...pagoData, monto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-mono text-center outline-none focus:ring-2 focus:ring-orange-500" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {METODOS_PAGO.filter((m) => m.value !== "fiado").map((mp) => (
                    <button key={mp.value} onClick={() => setPagoData({ ...pagoData, metodoPago: mp.value })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition border ${pagoData.metodoPago === mp.value ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-gray-200 text-gray-600"}`}>
                      {mp.value === "efectivo" && <DollarSign size={16} />}{mp.value === "tarjeta" && <CreditCard size={16} />}{mp.value === "transferencia" && <Smartphone size={16} />}{mp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setFiadoPago(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handlePagar} className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"><CheckCircle size={16} /> Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

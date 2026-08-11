import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useOffline } from "../hooks/useOffline";
import { productsService } from "../services/firestoreProducts";
import { salesService } from "../services/firestoreSales";
import { fiadosService } from "../services/firestoreFiados";
import { METODOS_PAGO } from "../types/index";
import { formatCurrency } from "../utils/format";
import BarcodeScanner from "./BarcodeScanner";
import InventoryAlert from "./InventoryAlert";
import {
  Search, ScanLine, Trash2, Plus, Minus, ShoppingCart,
  Package, Clock, DollarSign, CreditCard, Smartphone, User,
  X, Check, Printer, Scale, Loader2, WifiOff
} from "lucide-react";

const METODO_STYLES = {
  efectivo: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700" },
  tarjeta: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
  transferencia: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
  fiado: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" },
};

export default function POS() {
  const { almacenId, user, userData } = useAuth();
  const { isOnline, addToQueue } = useOffline();
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [turno, setTurno] = useState(null);
  const [mostrarScanner, setMostrarScanner] = useState(false);
  const [mostrarFiado, setMostrarFiado] = useState(false);
  const [fiadoData, setFiadoData] = useState({ nombre: "", telefono: "", direccion: "" });
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [productoEditando, setProductoEditando] = useState(null);
  const [cantidadEditando, setCantidadEditando] = useState("");
  const searchRef = useRef(null);

  const [mostrarAbrirTurno, setMostrarAbrirTurno] = useState(false);
  const [montoInicial, setMontoInicial] = useState("");
  const [mostrarCerrarTurno, setMostrarCerrarTurno] = useState(false);
  const [resumenCierre, setResumenCierre] = useState(null);

  useEffect(() => {
    if (almacenId) {
      cargarProductos();
      cargarTurno();
    }
  }, [almacenId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && document.activeElement === searchRef.current) {
        e.preventDefault();
        const filtrados = search.trim()
          ? productos.filter(
              (p) =>
                p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
                p.codigoBarras?.includes(search)
            )
          : productos.slice(0, 20);
        if (filtrados.length > 0) {
          agregarAlCarrito(filtrados[0]);
          setSearch("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [search, productos]);

  async function cargarProductos() {
    setLoadingProductos(true);
    const data = await productsService.getProducts(almacenId);
    setProductos(data);
    setLoadingProductos(false);
  }

  async function cargarTurno() {
    const t = await salesService.getTurnoActivo(almacenId);
    setTurno(t);
  }

  const productosFiltrados = search.trim()
    ? productos.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
          p.codigoBarras?.includes(search)
      )
    : productos.slice(0, 20);

  function agregarAlCarrito(producto) {
    const existente = carrito.find((c) => c.id === producto.id);
    if (existente) {
      setCarrito(
        carrito.map((c) =>
          c.id === producto.id ? { ...c, cantidad: c.cantidad + 1 } : c
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          ...producto,
          cantidad: producto.unidad === "kg" || producto.unidad === "g" ? 0.1 : 1,
        },
      ]);
    }
  }

  function actualizarCantidad(id, delta) {
    setCarrito(
      carrito.map((c) => {
        if (c.id !== id) return c;
        const step = c.unidad === "kg" || c.unidad === "g" ? 0.1 : 1;
        const nueva = Math.max(step, c.cantidad + delta);
        return { ...c, cantidad: nueva };
      })
    );
  }

  function setCantidadManual(id, valor) {
    const num = parseFloat(valor);
    if (isNaN(num) || num <= 0) return;
    setCarrito(carrito.map((c) => (c.id === id ? { ...c, cantidad: num } : c)));
  }

  function eliminarDelCarrito(id) {
    setCarrito(carrito.filter((c) => c.id !== id));
  }

  const total = carrito.reduce((sum, c) => sum + c.precioVenta * c.cantidad, 0);

  async function handleAbrirTurno() {
    const monto = Number(montoInicial) || 0;
    const nuevo = await salesService.createTurno(almacenId, {
      estado: "abierto",
      vendedorId: user.uid,
      vendedorNombre: userData?.nombre || user.email,
      montoInicial: monto,
      ventas: { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 },
    });
    setTurno(nuevo);
    setMostrarAbrirTurno(false);
    setMontoInicial("");
    mostrarMensaje("Turno abierto");
  }

  async function handleCerrarTurno() {
    if (!turno) return;
    const ventasHoy = await salesService.getTodaySales(almacenId);
    const resumen = { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 };
    ventasHoy.forEach((v) => {
      if (resumen[v.metodoPago] !== undefined) resumen[v.metodoPago] += v.total;
    });
    const totalVentas = Object.values(resumen).reduce((a, b) => a + b, 0);
    const efectivoEnCaja = (turno.montoInicial || 0) + (resumen.efectivo || 0);

    setResumenCierre({
      ...resumen,
      totalVentas,
      efectivoEnCaja,
      montoInicial: turno.montoInicial || 0,
    });
    setMostrarCerrarTurno(true);
  }

  async function confirmarCerrarTurno() {
    if (!turno || !resumenCierre) return;
    await salesService.updateTurno(turno.id, {
      estado: "cerrado",
      cerradoEn: new Date().toISOString(),
      ventas: {
        efectivo: resumenCierre.efectivo,
        tarjeta: resumenCierre.tarjeta,
        transferencia: resumenCierre.transferencia,
        fiado: resumenCierre.fiado,
      },
    });
    setTurno(null);
    setMostrarCerrarTurno(false);
    setResumenCierre(null);
    mostrarMensaje("Turno cerrado");
  }

  async function handleVender() {
    if (carrito.length === 0) return;
    if (!turno) {
      alert("Debes abrir un turno primero");
      return;
    }

    setLoading(true);
    try {
      for (const item of carrito) {
        const prod = await productsService.getProduct(item.id);
        if (!prod || (prod.stock || 0) < item.cantidad) {
          alert(`Stock insuficiente: ${item.nombre}`);
          setLoading(false);
          return;
        }
      }

      for (const item of carrito) {
        await productsService.discountStock(item.id, item.cantidad);
      }

      const venta = {
        productos: carrito.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          cantidad: c.cantidad,
          precioUnitario: c.precioVenta,
          total: c.precioVenta * c.cantidad,
        })),
        total,
        metodoPago,
        vendedorId: user.uid,
        vendedorNombre: userData?.nombre || user.email,
        turnoId: turno.id,
      };

      if (metodoPago === "fiado") {
        if (!fiadoData.nombre.trim()) {
          alert("Ingresa el nombre del cliente para fiado");
          setLoading(false);
          return;
        }
        const fiadoPayload = {
          ...venta,
          clienteNombre: fiadoData.nombre,
          clienteTelefono: fiadoData.telefono,
          clienteDireccion: fiadoData.direccion,
          estado: "pendiente",
        };
        if (!isOnline) {
          addToQueue({ type: "fiado", almacenId, data: fiadoPayload });
          mostrarMensaje("Fiado guardado localmente (offline)");
        } else {
          await fiadosService.createFiado(almacenId, fiadoPayload);
          mostrarMensaje("Fiado registrado");
        }
        setMostrarFiado(false);
        setFiadoData({ nombre: "", telefono: "", direccion: "" });
      } else {
        if (!isOnline) {
          addToQueue({ type: "venta", almacenId, data: venta });
          mostrarMensaje("Venta guardada localmente (offline)");
        } else {
          await salesService.createSale(almacenId, venta);
          mostrarMensaje("Venta registrada");
        }
      }

      setCarrito([]);
      await cargarProductos();
    } catch (err) {
      console.error(err);
      alert("Error al registrar la venta");
    } finally {
      setLoading(false);
    }
  }

  function mostrarMensaje(texto) {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  }

  async function handleScan(code) {
    const producto = await productsService.getProductByBarcode(almacenId, code);
    if (producto) {
      agregarAlCarrito(producto);
      mostrarMensaje(`Agregado: ${producto.nombre}`);
    } else {
      alert("Producto no encontrado");
    }
  }

  const productosRapidos = productos
    .filter((p) => !search.trim() || p.nombre?.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 12);

  return (
    <div>
      <InventoryAlert />

      {mensaje && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          {mensaje}
        </div>
      )}

      {!isOnline && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <WifiOff size={16} />
          <span>Estás offline. Las ventas se guardarán localmente y se sincronizarán al reconectar.</span>
        </div>
      )}

      {mostrarScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setMostrarScanner(false)} />
      )}

      {mostrarAbrirTurno && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-1">Abrir Turno</h3>
            <p className="text-sm text-gray-500 mb-4">Ingresa el efectivo inicial en caja</p>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={18} className="text-gray-400" />
              <input
                type="number"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-lg font-mono text-center outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                min="0"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMostrarAbrirTurno(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleAbrirTurno} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                <Check size={16} /> Abrir Turno
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarCerrarTurno && resumenCierre && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-1">Cerrar Turno</h3>
            <p className="text-sm text-gray-500 mb-4">Resumen del turno para cuadrar caja</p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Efectivo inicial:</span><span className="font-medium">{formatCurrency(resumenCierre.montoInicial)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ventas efectivo:</span><span className="font-medium text-green-600">{formatCurrency(resumenCierre.efectivo)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ventas tarjeta:</span><span className="font-medium text-blue-600">{formatCurrency(resumenCierre.tarjeta)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transferencias:</span><span className="font-medium text-purple-600">{formatCurrency(resumenCierre.transferencia)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fiados:</span><span className="font-medium text-orange-600">{formatCurrency(resumenCierre.fiado)}</span></div>
              <div className="border-t pt-2 flex justify-between text-base font-bold"><span>Total ventas:</span><span>{formatCurrency(resumenCierre.totalVentas)}</span></div>
              <div className="flex justify-between text-base font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <span>Efectivo en caja:</span><span>{formatCurrency(resumenCierre.efectivoEnCaja)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMostrarCerrarTurno(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={confirmarCerrarTurno} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                <Check size={16} /> Cerrar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${turno ? "text-green-600" : "text-gray-400"}`} />
          <div>
            <p className="font-medium text-gray-800">
              {turno ? `Turno abierto - ${turno.vendedorNombre}` : "Sin turno activo"}
            </p>
            {turno && (
              <p className="text-sm text-gray-500">
                Abierto: {new Date(turno.createdAt).toLocaleTimeString("es-CL")}
                {turno.montoInicial > 0 && ` • Efectivo inicial: ${formatCurrency(turno.montoInicial)}`}
              </p>
            )}
          </div>
        </div>
        {turno ? (
          <button
            onClick={handleCerrarTurno}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Cerrar Turno
          </button>
        ) : (
          <button
            onClick={() => setMostrarAbrirTurno(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Abrir Turno
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto o escanear código..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={() => setMostrarScanner(true)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-lg transition"
              >
                <ScanLine size={20} />
              </button>
            </div>
          </div>

          {loadingProductos ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {productosRapidos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => agregarAlCarrito(p)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-left hover:shadow-md hover:border-blue-300 transition active:scale-95"
                >
                  <p className="font-medium text-gray-800 text-sm truncate">{p.nombre}</p>
                  <p className="text-blue-600 font-bold text-sm mt-1">
                    {formatCurrency(p.precioVenta)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Stock: {p.stock} {p.unidad}
                  </p>
                  {p.enOferta && (
                    <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                      OFERTA
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-fit">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-800">Carrito</h2>
            <span className="ml-auto text-sm text-gray-500">{carrito.length} items</span>
          </div>

          {carrito.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={40} className="mx-auto mb-2" />
              <p>Agrega productos</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
              {carrito.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.precioVenta)} / {item.unidad}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => actualizarCantidad(item.id, -(item.unidad === "kg" || item.unidad === "g" ? 0.1 : 1))}
                      className="p-1 hover:bg-gray-200 rounded transition"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setProductoEditando(item.id);
                        setCantidadEditando(item.cantidad.toString());
                      }}
                      className="w-16 text-center text-sm font-medium bg-white border border-gray-300 rounded px-1 py-0.5"
                    >
                      {item.cantidad}
                    </button>
                    <button
                      onClick={() => actualizarCantidad(item.id, item.unidad === "kg" || item.unidad === "g" ? 0.1 : 1)}
                      className="p-1 hover:bg-gray-200 rounded transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="text-sm font-bold text-gray-800 w-20 text-right">
                    {formatCurrency(item.precioVenta * item.cantidad)}
                  </p>

                  <button
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {carrito.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {METODOS_PAGO.map((mp) => {
                    const style = METODO_STYLES[mp.value];
                    const active = metodoPago === mp.value;
                    return (
                      <button
                        key={mp.value}
                        onClick={() => setMetodoPago(mp.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition border ${
                          active
                            ? `${style.bg} ${style.border} ${style.text}`
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {mp.value === "efectivo" && <DollarSign size={16} />}
                        {mp.value === "tarjeta" && <CreditCard size={16} />}
                        {mp.value === "transferencia" && <Smartphone size={16} />}
                        {mp.value === "fiado" && <User size={16} />}
                        {mp.label}
                      </button>
                    );
                  })}
                </div>

                {metodoPago === "fiado" && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 space-y-2">
                    <p className="text-sm font-medium text-orange-800">Datos del cliente</p>
                    <input
                      type="text"
                      placeholder="Nombre del cliente *"
                      value={fiadoData.nombre}
                      onChange={(e) => setFiadoData({ ...fiadoData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-300 rounded text-sm outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      type="text"
                      placeholder="Teléfono"
                      value={fiadoData.telefono}
                      onChange={(e) => setFiadoData({ ...fiadoData, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-300 rounded text-sm outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                      type="text"
                      placeholder="Dirección"
                      value={fiadoData.direccion}
                      onChange={(e) => setFiadoData({ ...fiadoData, direccion: e.target.value })}
                      className="w-full px-3 py-2 border border-orange-300 rounded text-sm outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                )}

                <button
                  onClick={handleVender}
                  disabled={loading || !turno}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={20} />}
                  {loading ? "Procesando..." : isOnline ? "Confirmar Venta" : "Guardar Venta (Offline)"}
                </button>
                {!turno && (
                  <p className="text-xs text-red-500 text-center mt-2">Abre un turno para vender</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {productoEditando && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-xs">
            <h3 className="font-bold text-gray-800 mb-3">Ingresar cantidad</h3>
            <div className="flex items-center gap-2 mb-4">
              <Scale size={18} className="text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={cantidadEditando}
                onChange={(e) => setCantidadEditando(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-lg font-mono text-center outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <span className="text-gray-500 text-sm">
                {carrito.find((c) => c.id === productoEditando)?.unidad}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setProductoEditando(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setCantidadManual(productoEditando, cantidadEditando);
                  setProductoEditando(null);
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

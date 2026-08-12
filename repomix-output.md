This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
public/
  manifest.json
src/
  components/
    BarcodeScanner.jsx
    Fiados.jsx
    InventoryAlert.jsx
    Mermas.jsx
    Navbar.jsx
    Offers.jsx
    PlanBadge.jsx
    POS.jsx
    ProductManager.jsx
    Reports.jsx
  firebase/
    config.js
    firebase.js
  hooks/
    useAuth.jsx
    useOffline.js
    useTurno.js
  pages/
    AdminVendedores.jsx
    ConfiguracionAlmacen.jsx
    Dashboard.jsx
    Login.jsx
    Register.jsx
    RegisterVendedor.jsx
  services/
    firestoreConfig.js
    firestoreFiados.js
    firestoreMermas.js
    firestoreProducts.js
    firestoreSales.js
    firestoreUsers.js
    planLimits.js
  types/
    index.js
  utils/
    format.js
  App.jsx
  index.css
  main.jsx
.gitattributes
.gitignore
CAPACITOR_APK.md
COMPILAR_Y_VER.bat
CREAR_APK.bat
DIAGNOSTICO.bat
firebase.json
firestore.indexes.json
firestore.rules
fix-stock.cjs
index.html
INICIAR_SIMPLE.cmd
INICIAR.bat
INSTRUCCIONES_v5.md
INSTRUCCIONES.txt
package.json
postcss.config.js
README_BRAND_APK.md
README_FIX.md
README.md
tailwind.config.js
vite.config.js
````

# Files

## File: public/manifest.json
````json
{
  "name": "Negocio",
  "short_name": "Negocio",
  "description": "Sistema de punto de venta",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
````

## File: src/components/BarcodeScanner.jsx
````javascript
import { useState, useRef, useCallback, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { X, Camera, Scan, AlertTriangle, Keyboard } from 'lucide-react';

const createZXingReader = () => {
  const hints = new Map();
  const formats = [
    BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E, BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93, BarcodeFormat.ITF, BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
  ];
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  hints.set(DecodeHintType.TRY_HARDER, true);
  const reader = new BrowserMultiFormatReader(hints);
  reader.timeBetweenDecodingAttempts = 100;
  return reader;
};

export default function BarcodeScanner({ onScan, onClose, products = [] }) {
  const [activeTab, setActiveTab] = useState('camera');
  const [error, setError] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const [manualCode, setManualCode] = useState('');
  
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const pauseRef = useRef(false);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onScanRef.current = onScan; }, [onScan]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const stopLiveScanner = useCallback(() => {
    if (controlsRef.current) {
      try { controlsRef.current.stop(); } catch {}
      controlsRef.current = null;
    }
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    setScannerReady(false);
  }, []);

  const handleCodeFound = useCallback((code) => {
    stopLiveScanner();
    onScanRef.current(code);
    onCloseRef.current();
  }, [stopLiveScanner]);

  const startLiveScanner = useCallback(async () => {
    setError('');
    try {
      const reader = createZXingReader();
      const controls = await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: 'environment' } },
        videoRef.current,
        (result) => {
          if (result && !pauseRef.current) {
            pauseRef.current = true;
            handleCodeFound(result.getText());
          }
        }
      );
      controlsRef.current = controls;
      setScannerReady(true);
    } catch (err) {
      console.error('[SCANNER] Error:', err);
      setError('No se pudo iniciar la cámara. Intenta recargar la página.');
      setScannerReady(false);
    }
  }, [handleCodeFound]);

  useEffect(() => {
    startLiveScanner();
    return () => stopLiveScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'camera') {
      startLiveScanner();
    } else {
      stopLiveScanner();
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Escanear código
          </h2>
          <button onClick={() => { stopLiveScanner(); onClose(); }} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => handleTabChange('camera')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'camera' ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Cámara en vivo
          </button>
          <button
            onClick={() => handleTabChange('manual')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'manual' ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </p>
          </div>
        )}

        <div className="p-4">
          {activeTab === 'camera' && (
            <div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-square bg-black rounded-lg object-cover"
              />
              {!scannerReady && !error && (
                <p className="text-center text-gray-400 text-sm mt-3">
                  Iniciando cámara...
                </p>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Escribe el código de barras
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ej: 7804682632213"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Buscar producto
              </button>
            </form>
          )}
        </div>

        <div className="px-4 pb-4 text-center">
          <p className="text-gray-500 text-xs">
            Carrito · {products.length} items
          </p>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/Fiados.jsx
````javascript
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
````

## File: src/components/InventoryAlert.jsx
````javascript
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { productsService } from "../services/firestoreProducts";
import { AlertTriangle, X } from "lucide-react";
import { diasHastaVencimiento } from "../utils/format";

export default function InventoryAlert() {
  const { almacenId } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [cerradas, setCerradas] = useState(() => {
    return JSON.parse(localStorage.getItem("alertas_cerradas") || "[]");
  });

  useEffect(() => {
    if (!almacenId) return;
    cargarAlertas();
  }, [almacenId]);

  async function cargarAlertas() {
    const productos = await productsService.getProducts(almacenId);
    const alertasList = [];

    productos.forEach((p) => {
      // Stock crítico
      if (p.stockCritico && p.stock <= p.stockCritico && p.stock > 0) {
        alertasList.push({
          id: `stock-${p.id}`,
          tipo: "stock",
          mensaje: `${p.nombre}: Stock bajo (${p.stock} ${p.unidad})`,
          producto: p,
        });
      }
      if (p.stock === 0) {
        alertasList.push({
          id: `sin-stock-${p.id}`,
          tipo: "sin-stock",
          mensaje: `${p.nombre}: Sin stock`,
          producto: p,
        });
      }

      // Vencimientos
      if (p.perecedero && p.lotes) {
        p.lotes.forEach((lote) => {
          const dias = diasHastaVencimiento(lote.fechaVencimiento);
          if (dias !== null && dias <= (p.diasAlertaVencimiento || 3) && dias >= 0) {
            alertasList.push({
              id: `venc-${p.id}-${lote.id}`,
              tipo: "vencimiento",
              mensaje: `${p.nombre}: Vence en ${dias} días`,
              producto: p,
            });
          }
          if (dias !== null && dias < 0) {
            alertasList.push({
              id: `vencido-${p.id}-${lote.id}`,
              tipo: "vencido",
              mensaje: `${p.nombre}: Producto vencido`,
              producto: p,
            });
          }
        });
      }
    });

    setAlertas(alertasList);
  }

  function cerrarAlerta(id) {
    const nuevas = [...cerradas, id];
    setCerradas(nuevas);
    localStorage.setItem("alertas_cerradas", JSON.stringify(nuevas));
  }

  const alertasVisibles = alertas.filter((a) => !cerradas.includes(a.id));
  if (alertasVisibles.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alertasVisibles.map((alerta) => (
        <div
          key={alerta.id}
          className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm ${
            alerta.tipo === "vencido"
              ? "bg-red-50 border border-red-200 text-red-700"
              : alerta.tipo === "sin-stock"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-orange-50 border border-orange-200 text-orange-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{alerta.mensaje}</span>
          </div>
          <button
            onClick={() => cerrarAlerta(alerta.id)}
            className="p-1 hover:bg-black/5 rounded transition"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
````

## File: src/components/Mermas.jsx
````javascript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { mermasService } from "../services/firestoreMermas";
import { productsService } from "../services/firestoreProducts";
import { MOTIVOS_MERMA } from "../types/index";
import { formatCurrency, formatDate } from "../utils/format";
import { AlertTriangle, Plus, Trash2, Tag, Loader2 } from "lucide-react";

export default function Mermas() {
  const { almacenId } = useAuth();
  const [productos, setProductos] = useState([]);
  const [mermas, setMermas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    productoId: "",
    cantidad: "",
    motivo: MOTIVOS_MERMA[0],
    notas: "",
  });

  useEffect(() => {
    if (almacenId) cargarDatos();
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
    if (cantidad > producto.stock) {
      alert(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    const perdidaEstimada = (producto.precioCompra || 0) * cantidad;

    try {
      // Descontar stock
      await productsService.discountStock(producto.id, cantidad);

      // Registrar merma
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
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <Plus size={18} /> Registrar Merma
        </button>
      </div>

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
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Stock: {p.stock} {p.unidad})
                  </option>
                ))}
              </select>
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
````

## File: src/components/Navbar.jsx
````javascript
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useOffline } from "../hooks/useOffline";
import { salesService } from "../services/firestoreSales";
import { formatCurrency } from "../utils/format";
import PlanBadge from "../components/PlanBadge";
import { 
  ShoppingCart, Package, BarChart3, AlertTriangle, 
  Users, Tag, LogOut, Menu, X, UserPlus, Settings,
  Wifi, WifiOff, RefreshCw, Store
} from "lucide-react";
import { useState, useEffect } from "react";
import { configService } from "../services/firestoreConfig";

export default function Navbar() {
  const { isDueño, isVendedor, userData, logout, almacenId } = useAuth();
  const { isOnline, pendingCount, syncing } = useOffline();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarCierreLogout, setMostrarCierreLogout] = useState(false);
  const [resumenLogout, setResumenLogout] = useState(null);
  const [nombreNegocio, setNombreNegocio] = useState("Negocio");
  const location = useLocation();

  useEffect(() => {
    if (!almacenId) return;
    // Cargar nombre del negocio
    configService.getAlmacenData(almacenId).then(data => {
      if (data) {
        const nombre = data.nombreFiscal || data.nombre || "Negocio";
        setNombreNegocio(nombre);
        localStorage.setItem("pos_negocio_nombre", nombre);
      }
    });
  }, [almacenId]);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/vender", label: "Vender", icon: ShoppingCart, show: true },
    { path: "/productos", label: "Productos", icon: Package, show: true },
    { path: "/fiados", label: "Fiados", icon: Users, show: true },
    { path: "/ofertas", label: "Ofertas", icon: Tag, show: isDueño },
    { path: "/mermas", label: "Mermas", icon: AlertTriangle, show: isDueño },
    { path: "/informes", label: "Informes", icon: BarChart3, show: isDueño },
    { path: "/vendedores", label: "Vendedores", icon: UserPlus, show: isDueño },
    { path: "/configuracion", label: "Configuración", icon: Settings, show: isDueño },
  ];

  async function handleLogout() {
    if (!almacenId) {
      logout();
      return;
    }
    const turno = await salesService.getTurnoActivo(almacenId);
    if (turno) {
      const ventasHoy = await salesService.getTodaySales(almacenId);
      const resumen = { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 };
      ventasHoy.forEach((v) => {
        if (resumen[v.metodoPago] !== undefined) resumen[v.metodoPago] += v.total;
      });
      const totalVentas = Object.values(resumen).reduce((a, b) => a + b, 0);
      setResumenLogout({
        ...resumen,
        totalVentas,
        efectivoEnCaja: (turno.montoInicial || 0) + (resumen.efectivo || 0),
        montoInicial: turno.montoInicial || 0,
        turnoId: turno.id,
      });
      setMostrarCierreLogout(true);
    } else {
      logout();
    }
  }

  async function confirmarCerrarYLogout() {
    if (!resumenLogout) return;
    await salesService.updateTurno(resumenLogout.turnoId, {
      estado: "cerrado",
      cerradoEn: new Date().toISOString(),
      ventas: {
        efectivo: resumenLogout.efectivo,
        tarjeta: resumenLogout.tarjeta,
        transferencia: resumenLogout.transferencia,
        fiado: resumenLogout.fiado,
      },
    });
    setMostrarCierreLogout(false);
    setResumenLogout(null);
    logout();
  }

  return (
    <>
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs text-center py-1 px-4 font-medium flex items-center justify-center gap-2">
          <WifiOff size={14} />
          Sin conexión a internet. Trabajando en modo offline.
          {pendingCount > 0 && <span>• {pendingCount} operaciones pendientes</span>}
        </div>
      )}
      {isOnline && pendingCount > 0 && (
        <div className="bg-blue-500 text-white text-xs text-center py-1 px-4 font-medium flex items-center justify-center gap-2">
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sincronizando..." : `Hay ${pendingCount} operación(es) pendiente(s) de sincronizar`}
        </div>
      )}

      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-bold text-xl text-blue-600 flex items-center gap-2">
              <Store size={20} />
              <span className="truncate max-w-[140px] sm:max-w-xs">{nombreNegocio}</span>
              {isOnline ? (
                <Wifi size={14} className="text-green-500 shrink-0" />
              ) : (
                <WifiOff size={14} className="text-amber-500 shrink-0" />
              )}
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.filter(i => i.show).map((item) => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}>
                  <item.icon size={18} /> {item.label}
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-4">
              <PlanBadge />
              <span className="text-sm text-gray-500">
                {userData?.nombre} • {isDueño ? "Dueño" : "Vendedor"}
              </span>
              <button onClick={handleLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition text-sm">
                <LogOut size={18} /> Salir
              </button>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.filter(i => i.show).map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                    isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  <item.icon size={18} /> {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-500">
                  {userData?.nombre} • {isDueño ? "Dueño" : "Vendedor"}
                </div>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 text-red-600 text-sm font-medium w-full">
                  <LogOut size={18} /> Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {mostrarCierreLogout && resumenLogout && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-1">Hay un turno activo</h3>
            <p className="text-sm text-gray-500 mb-4">Cuadra la caja antes de salir</p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Efectivo inicial:</span><span className="font-medium">{formatCurrency(resumenLogout.montoInicial)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ventas efectivo:</span><span className="font-medium text-green-600">{formatCurrency(resumenLogout.efectivo)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ventas tarjeta:</span><span className="font-medium text-blue-600">{formatCurrency(resumenLogout.tarjeta)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transferencias:</span><span className="font-medium text-purple-600">{formatCurrency(resumenLogout.transferencia)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fiados:</span><span className="font-medium text-orange-600">{formatCurrency(resumenLogout.fiado)}</span></div>
              <div className="border-t pt-2 flex justify-between text-base font-bold"><span>Total ventas:</span><span>{formatCurrency(resumenLogout.totalVentas)}</span></div>
              <div className="flex justify-between text-base font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <span>Efectivo en caja:</span><span>{formatCurrency(resumenLogout.efectivoEnCaja)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMostrarCierreLogout(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={confirmarCerrarYLogout} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                <LogOut size={16} /> Cerrar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
````

## File: src/components/Offers.jsx
````javascript
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
    if (isNaN(precioOferta) || precioOferta <= 0) {
      alert("Ingresa un precio de oferta válido mayor a 0");
      return;
    }
    if (precioOferta >= producto.precioVenta) {
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
````

## File: src/components/PlanBadge.jsx
````javascript
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getPlan, contarProductos, contarVendedores, LIMITES } from "../services/planLimits";
import { Crown, Package, Users } from "lucide-react";

export default function PlanBadge() {
  const { almacenId, isDueño } = useAuth();
  const [plan, setPlan] = useState("basico");
  const [stats, setStats] = useState({ productos: 0, vendedores: 0 });

  useEffect(() => {
    if (!almacenId || !isDueño) return;
    let mounted = true;
    async function cargar() {
      const p = await getPlan(almacenId);
      const prod = await contarProductos(almacenId);
      const ven = await contarVendedores(almacenId);
      if (mounted) {
        setPlan(p);
        setStats({ productos: prod, vendedores: ven });
      }
    }
    cargar();
    return () => { mounted = false; };
  }, [almacenId, isDueño]);

  if (!isDueño) return null;

  const esPro = plan === "pro";
  const limProd = LIMITES[plan]?.productos ?? 500;
  const limVen = LIMITES[plan]?.vendedores ?? 1;

  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium border ${
      esPro ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-gray-50 border-gray-200 text-gray-600"
    }`}>
      <Crown size={14} className={esPro ? "text-purple-600" : "text-gray-400"} />
      <span className="uppercase tracking-wide">{plan}</span>
      <span className="hidden sm:inline text-gray-300">|</span>
      <span className="hidden sm:flex items-center gap-1">
        <Package size={12} /> {stats.productos}/{limProd === Infinity ? "∞" : limProd}
      </span>
      <span className="hidden sm:flex items-center gap-1">
        <Users size={12} /> {stats.vendedores}/{limVen === Infinity ? "∞" : limVen}
      </span>
    </div>
  );
}
````

## File: src/components/POS.jsx
````javascript
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
  const { isOnline, addToQueue, saveOfflineTurno, getOfflineTurno, clearOfflineTurno } = useOffline();
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
    try {
      let data = await productsService.getProducts(almacenId);

      // Aplicar descuentos de stock de operaciones pendientes (offline)
      const queue = JSON.parse(localStorage.getItem("pos_offline_queue") || "[]");
      const pendingDiscounts = {};
      queue.forEach(op => {
        if ((op.type === "venta" || op.type === "fiado") && op.data?.productos) {
          op.data.productos.forEach(p => {
            pendingDiscounts[p.id] = (pendingDiscounts[p.id] || 0) + (p.cantidad || 0);
          });
        }
      });

      if (Object.keys(pendingDiscounts).length > 0) {
        data = data.map(p => {
          if (pendingDiscounts[p.id]) {
            return { ...p, stock: Math.max(0, (p.stock || 0) - pendingDiscounts[p.id]) };
          }
          return p;
        });
      }

      setProductos(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
      const cached = productsService.getCachedProducts(almacenId);
      if (cached) setProductos(cached);
    } finally {
      setLoadingProductos(false);
    }
  }

  async function cargarTurno() {
    if (!isOnline) {
      const offlineTurno = getOfflineTurno();
      if (offlineTurno) {
        setTurno(offlineTurno);
        return;
      }
    }
    const t = await salesService.getTurnoActivo(almacenId);
    setTurno(t);
    if (t) saveOfflineTurno(t);
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
    const turnoData = {
      estado: "abierto",
      vendedorId: user.uid,
      vendedorNombre: userData?.nombre || user.email,
      montoInicial: monto,
      ventas: { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 },
    };

    if (!isOnline) {
      const tempId = `offline_${Date.now()}`;
      const nuevo = { id: tempId, ...turnoData, createdAt: new Date().toISOString() };
      setTurno(nuevo);
      saveOfflineTurno(nuevo);
      addToQueue({ type: "turno_abrir", almacenId, tempId, data: turnoData });
      setMostrarAbrirTurno(false);
      setMontoInicial("");
      mostrarMensaje("Turno abierto (offline)");
      return;
    }

    const nuevo = await salesService.createTurno(almacenId, turnoData);
    setTurno(nuevo);
    saveOfflineTurno(nuevo);
    setMostrarAbrirTurno(false);
    setMontoInicial("");
    mostrarMensaje("Turno abierto");
  }

  async function handleCerrarTurno() {
    if (!turno) return;

    if (!isOnline) {
      const cerrado = { ...turno, estado: "cerrado", cerradoEn: new Date().toISOString() };
      setTurno(null);
      clearOfflineTurno();
      addToQueue({ type: "turno_cerrar", turnoId: turno.id, data: cerrado });
      mostrarMensaje("Turno cerrado (se sincronizará al reconectar)");
      return;
    }

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
    clearOfflineTurno();
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
        const prod = productos.find(p => p.id === item.id);
        if (!prod || (prod.stock || 0) < item.cantidad) {
          alert(`Stock insuficiente: ${item.nombre}`);
          setLoading(false);
          return;
        }
      }

      for (const item of carrito) {
        const prod = productos.find(p => p.id === item.id);
        if (prod) prod.stock -= item.cantidad;
      }
      setProductos([...productos]);

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
          try {
            await fiadosService.createFiado(almacenId, fiadoPayload);
            mostrarMensaje("Fiado registrado");
          } catch (err) {
            addToQueue({ type: "fiado", almacenId, data: fiadoPayload });
            mostrarMensaje("Fiado guardado localmente (error de red)");
          }
        }
        setMostrarFiado(false);
        setFiadoData({ nombre: "", telefono: "", direccion: "" });
      } else {
        if (!isOnline) {
          addToQueue({ type: "venta", almacenId, data: venta });
          mostrarMensaje("Venta guardada localmente (offline)");
        } else {
          try {
            await salesService.createSale(almacenId, venta);
            mostrarMensaje("Venta registrada");
          } catch (err) {
            addToQueue({ type: "venta", almacenId, data: venta });
            mostrarMensaje("Venta guardada localmente (error de red)");
          }
        }
      }

      setCarrito([]);
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
    try {
      const producto = await productsService.getProductByBarcode(almacenId, code);
      if (producto) {
        agregarAlCarrito(producto);
        mostrarMensaje(`Agregado: ${producto.nombre}`);
      } else {
        alert("Producto no encontrado");
      }
    } catch (err) {
      console.error("Error escaneando:", err);
      alert("Error al buscar producto. ¿Estás offline?");
    }
  }

  const productosRapidos = productos
    .filter((p) => !search.trim() || p.nombre?.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 12);

  return (
    <div>
      <InventoryAlert />

      {mensaje && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-40">
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
````

## File: src/components/ProductManager.jsx
````javascript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { productsService } from "../services/firestoreProducts";
import { puedeCrearProducto, LIMITES } from "../services/planLimits";
import { UNIDADES, CATEGORIAS, DIAS_ALERTA_VENCIMIENTO } from "../types/index";
import { formatCurrency } from "../utils/format";
import BarcodeScanner from "./BarcodeScanner";
import InventoryAlert from "./InventoryAlert";
import {
  Search, Plus, Edit2, Trash2, Package, X, Check, ScanLine,
  Loader2, Crown, AlertTriangle
} from "lucide-react";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
  const [planInfo, setPlanInfo] = useState({ plan: "basico", usados: 0, limite: 500, permitido: true });

  const [form, setForm] = useState({
    nombre: "", codigoBarras: "", precioVenta: "", precioCompra: "",
    stock: "", stockCritico: "", unidad: "unidad", categoria: "Abarrotes",
    perecedero: false, diasAlertaVencimiento: 3, enOferta: false, precioOferta: "", lotes: [],
    fechaVencimiento: "",
  });

  useEffect(() => {
    if (almacenId) {
      cargarProductos();
      cargarPlanInfo();
    }
  }, [almacenId]);

  async function cargarProductos() {
    setLoading(true);
    const data = await productsService.getProducts(almacenId);
    setProductos(data);
    setLoading(false);
  }

  async function cargarPlanInfo() {
    const r = await puedeCrearProducto(almacenId);
    setPlanInfo({
      plan: r.plan || "basico",
      usados: r.usados ?? productos.length,
      limite: r.limite ?? LIMITES.basico.productos,
      permitido: r.permitido,
    });
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
      fechaVencimiento: "",
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
      fechaVencimiento: "",
    });
    setEditando(producto.id);
    setMostrarForm(true);
  }

  async function handleGuardar() {
    const data = {
      nombre: form.nombre.trim(), codigoBarras: form.codigoBarras.trim() || null,
      precioVenta: Number(form.precioVenta) || 0, precioCompra: Number(form.precioCompra) || 0,
      stock: Number(form.stock) || 0, stockCritico: Number(form.stockCritico) || 0,
      unidad: form.unidad, categoria: form.categoria,
      perecedero: form.perecedero, diasAlertaVencimiento: Number(form.diasAlertaVencimiento) || 3,
      enOferta: form.enOferta, precioOferta: form.enOferta ? Number(form.precioOferta) || 0 : null,
      lotes: form.lotes || [],
    };

    if (form.perecedero && form.fechaVencimiento) {
      data.lotes = [{
        id: generateId(),
        cantidad: data.stock,
        fechaVencimiento: form.fechaVencimiento,
        fechaIngreso: new Date().toISOString(),
      }];
    }

    if (!data.nombre) { alert("El nombre es obligatorio"); return; }
    try {
      if (editando) {
        if (!isDueño) { alert("Solo el dueño puede editar productos"); return; }
        await productsService.updateProduct(editando, data);
      } else {
        await productsService.createProduct(almacenId, data);
      }
      await cargarProductos();
      await cargarPlanInfo();
      setMostrarForm(false); resetForm();
    } catch (err) { alert("Error al guardar: " + err.message); }
  }

  async function handleEliminar(id) {
    if (!isDueño) return;
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    await productsService.deleteProduct(id);
    await cargarProductos();
    await cargarPlanInfo();
  }

  async function handleAgregarStock(producto) {
    setProductoStock(producto);
    setCantidadStock(""); setLoteVencimiento("");
  }

  async function confirmarAgregarStock() {
    if (!productoStock || !cantidadStock) return;
    const cantidad = Number(cantidadStock);
    if (isNaN(cantidad) || cantidad <= 0) { alert("Ingresa una cantidad valida"); return; }
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
    if (producto.stockCritico && producto.stock <= producto.stockCritico) return { label: "Critico", bg: "bg-orange-50", text: "text-orange-700" };
    return { label: "OK", bg: "bg-green-50", text: "text-green-700" };
  }

  const alLimite = planInfo.usados >= planInfo.limite && planInfo.limite !== Infinity;

  return (
    <div>
      <InventoryAlert />
      {mostrarScanner && <BarcodeScanner onScan={handleScan} onClose={() => { setMostrarScanner(false); setScannerMode(""); }} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" /> Productos
        </h1>
        <div className="flex gap-2">
          <button onClick={() => { resetForm(); setMostrarForm(true); }}
            disabled={alLimite && !editando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
            <Plus size={18} /> Nuevo Producto
          </button>
          <button onClick={() => { setScannerMode("stock"); setMostrarScanner(true); }}
            className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
            <ScanLine size={18} /> Escanear Stock
          </button>
        </div>
      </div>

      <div className={`flex items-center justify-between mb-4 p-3 rounded-lg border text-sm ${
        planInfo.plan === "pro"
          ? "bg-purple-50 border-purple-200 text-purple-700"
          : "bg-gray-50 border-gray-200 text-gray-600"
      }`}>
        <div className="flex items-center gap-2">
          <Crown size={16} />
          <span className="font-medium">Plan {planInfo.plan.toUpperCase()}</span>
          <span>• Productos: {planInfo.usados} / {planInfo.limite === Infinity ? "∞" : planInfo.limite}</span>
        </div>
        {planInfo.plan === "basico" && (
          <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
            Upgrade a Pro para productos ilimitados
          </span>
        )}
      </div>

      {alLimite && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          Has alcanzado el limite de productos de tu plan. Elimina productos o actualiza a Pro.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, codigo o categoria..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      {mostrarForm && (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Codigo de barras</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock critico (alerta)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
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
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dias de alerta antes de vencer</label>
                  <select value={form.diasAlertaVencimiento} onChange={(e) => setForm({ ...form, diasAlertaVencimiento: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    {DIAS_ALERTA_VENCIMIENTO.map((d) => <option key={d} value={d}>{d} dias</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento del producto</label>
                  <input type="date" value={form.fechaVencimiento} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </>
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
                        {p.stockCritico > 0 && <p className="text-xs text-gray-400">Min: {p.stockCritico}</p>}
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
````

## File: src/components/Reports.jsx
````javascript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { salesService } from "../services/firestoreSales";
import { fiadosService } from "../services/firestoreFiados";
import { mermasService } from "../services/firestoreMermas";
import { productsService } from "../services/firestoreProducts";
import { getPlan } from "../services/planLimits";
import { configService } from "../services/firestoreConfig";
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

  // ===== OBTENER DATOS DEL ALMACÉN =====
  async function getAlmacenInfo() {
    if (!almacenId) return { nombre: "Almacén de Barrio", rut: "", direccion: "", telefono: "", giro: "" };
    try {
      const data = await configService.getAlmacenData(almacenId);
      if (data) {
        return {
          nombre: data.nombreFiscal || data.nombre || "Almacén de Barrio",
          rut: data.rut || "",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
          giro: data.giro || "",
        };
      }
    } catch (e) {
      console.error("Error cargando datos almacén:", e);
    }
    return { nombre: "Almacén de Barrio", rut: "", direccion: "", telefono: "", giro: "" };
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

  async function exportarPDF() {
    const almacen = await getAlmacenInfo();
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Inventario - ${almacen.nombre}`, 14, 20);
    doc.setFontSize(10);
    if (almacen.rut) doc.text(`RUT: ${almacen.rut}`, 14, 28);
    if (almacen.direccion) doc.text(`Dirección: ${almacen.direccion}`, 14, 34);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, almacen.direccion ? 40 : 34);
    doc.text(`Total productos: ${totalProductos}`, 14, almacen.direccion ? 46 : 40);
    doc.text(`Valor stock (costo): ${formatCurrency(valorStockCosto)}`, 14, almacen.direccion ? 52 : 46);
    doc.text(`Valor stock (venta): ${formatCurrency(valorStockVenta)}`, 14, almacen.direccion ? 58 : 52);

    const body = sortedProductos.map((p) => [
      p.nombre, p.categoria, p.stock + " " + p.unidad,
      formatCurrency(p.precioVenta), formatCurrency(p.precioCompra),
      p.stock <= (p.stockCritico || 0) ? "Critico" : "OK",
    ]);

    autoTable(doc, {
      head: [["Producto", "Categoria", "Stock", "Precio Venta", "Precio Costo", "Estado"]],
      body, startY: almacen.direccion ? 64 : 58, styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save("inventario.pdf");
  }

  // ===== LIBRO DE VENTAS =====
  function getVentasMes(anioMes) {
    return ventas.filter((v) => v.createdAt?.startsWith(anioMes));
  }

  async function generarLibroVentasPDF() {
    const almacen = await getAlmacenInfo();
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
    doc.text(almacen.nombre, 105, 28, { align: "center" });
    if (almacen.rut) doc.text(`RUT: ${almacen.rut}`, 105, 33, { align: "center" });
    if (almacen.direccion) doc.text(almacen.direccion, 105, 38, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Periodo: ${mesLibro}`, 105, almacen.direccion ? 44 : 39, { align: "center" });
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 105, almacen.direccion ? 49 : 44, { align: "center" });

    let y = almacen.direccion ? 58 : 53;
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

  async function exportarVentasPDF() {
    if (!puedeDescargarInformeVentas()) {
      alert("Ya usaste tu informe gratuito de este mes. Upgrade a Pro para informes ilimitados.");
      return;
    }

    const almacen = await getAlmacenInfo();
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
    doc.text(`Almacén: ${almacen.nombre}`, 14, 40);
    if (almacen.rut) doc.text(`RUT: ${almacen.rut}`, 14, 46);

    let y = almacen.rut ? 56 : 50;
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
````

## File: src/firebase/config.js
````javascript
// Configuración de Firebase - usa firebase.js para inicialización
export const firebaseConfig = {
  apiKey: "AIzaSyAQUD8KyWSPYNz73RTrdSy-jZ3Lf2QiF3c",
  authDomain: "almacen-de-barrio-a947a.firebaseapp.com",
  projectId: "almacen-de-barrio-a947a",
  storageBucket: "almacen-de-barrio-a947a.firebasestorage.app",
  messagingSenderId: "1014856587704",
  appId: "1:1014856587704:web:a4dbcdfaea21e88388974d"
};
````

## File: src/firebase/firebase.js
````javascript
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQUD8KyWSPYNz73RTrdSy-jZ3Lf2QiF3c",
  authDomain: "almacen-de-barrio-a947a.firebaseapp.com",
  projectId: "almacen-de-barrio-a947a",
  storageBucket: "almacen-de-barrio-a947a.firebasestorage.app",
  messagingSenderId: "1014856587704",
  appId: "1:1014856587704:web:a4dbcdfaea21e88388974d"
};

const app = initializeApp(firebaseConfig);

// Auth con persistencia local (IndexedDB del navegador)
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Firestore con cache persistente + multi-tab desde el arranque
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

export { auth, db };
export default app;
````

## File: src/hooks/useAuth.jsx
````javascript
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const AuthContext = createContext(null);

export const ROLES = {
  DUEÑO: "dueño",
  VENDEDOR: "vendedor",
};

export const PLANES = {
  BASICO: "basico",
  PRO: "pro",
};

const FIREBASE_API_KEY = "AIzaSyAQUD8KyWSPYNz73RTrdSy-jZ3Lf2QiF3c";
const OFFLINE_SESSION_KEY = "pos_offline_session";
const OFFLINE_USERS_KEY = "pos_offline_users";

function getOfflineSession() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_SESSION_KEY));
  } catch { return null; }
}

function saveOfflineSession(user, userData) {
  localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    userData,
    savedAt: new Date().toISOString(),
  }));
}

function clearOfflineSession() {
  localStorage.removeItem(OFFLINE_SESSION_KEY);
}

function saveOfflineUser(uid, data) {
  const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || "{}");
  users[uid] = { ...data, _offlineSavedAt: new Date().toISOString() };
  localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const offline = getOfflineSession();
    if (offline && offline.userData) {
      setUser({
        uid: offline.uid,
        email: offline.email,
        displayName: offline.displayName,
        photoURL: offline.photoURL,
      });
      setUserData(offline.userData);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();

          if (data.passwordPending && data.role === "vendedor") {
            try {
              await updatePassword(firebaseUser, data.passwordPending);
              await updateDoc(doc(db, "users", firebaseUser.uid), {
                passwordPending: null,
                passwordUpdatedAt: new Date().toISOString(),
              });
              console.log("Contraseña actualizada desde panel del dueño");
            } catch (err) {
              console.error("No se pudo actualizar contraseña pendiente:", err);
            }
          }

          setUserData(data);
          saveOfflineSession(firebaseUser, data);
          saveOfflineUser(firebaseUser.uid, data);
        } else {
          setUserData(null);
        }
      } else {
        const stillOffline = getOfflineSession();
        if (!stillOffline) {
          setUser(null);
          setUserData(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function findEmailByUsername(username) {
    const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || "{}");
    for (const uid in users) {
      if (users[uid].username === username.trim().toLowerCase()) {
        return users[uid].email;
      }
    }
    if (navigator.onLine) {
      const snap = await getDoc(doc(db, "publicUsernames", username.trim().toLowerCase()));
      if (snap.exists()) return snap.data().email;
    }
    return null;
  }

  const login = async (identifier, password) => {
    let email = identifier.trim();
    if (!email.includes("@")) {
      const foundEmail = await findEmailByUsername(email);
      if (!foundEmail) {
        throw new Error("Usuario no encontrado");
      }
      email = foundEmail;
    }

    if (!navigator.onLine) {
      const offline = getOfflineSession();
      if (offline && offline.email === email) {
        setUser({
          uid: offline.uid,
          email: offline.email,
          displayName: offline.displayName,
          photoURL: offline.photoURL,
        });
        setUserData(offline.userData);
        return { user: offline, offline: true };
      }
      throw new Error("Sin conexión. Primero inicia sesión con internet al menos una vez.");
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.activo === false) {
        await signOut(auth);
        throw new Error("Usuario desactivado. Contacta al dueño.");
      }
      setUserData(data);
      saveOfflineSession(result.user, data);
      saveOfflineUser(result.user.uid, data);
    }
    return result;
  };

  const registerDueño = async (email, password, nombre, nombreAlmacen) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: nombre });
    const almacenRef = doc(collection(db, "almacenes"));
    await setDoc(almacenRef, {
      nombre: nombreAlmacen,
      dueñoId: result.user.uid,
      plan: PLANES.BASICO,
      createdAt: new Date().toISOString(),
    });
    await setDoc(doc(db, "users", result.user.uid), {
      email, nombre, role: ROLES.DUEÑO,
      almacenId: almacenRef.id, plan: PLANES.BASICO,
      createdAt: new Date().toISOString(),
    });
    const newUserData = {
      email, nombre, role: ROLES.DUEÑO,
      almacenId: almacenRef.id, plan: PLANES.BASICO,
    };
    setUserData(newUserData);
    saveOfflineSession(result.user, newUserData);
    saveOfflineUser(result.user.uid, newUserData);
    return result;
  };

  const logout = async () => {
    clearOfflineSession();
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const isDueño = userData?.role === ROLES.DUEÑO;
  const isVendedor = userData?.role === ROLES.VENDEDOR;
  const almacenId = userData?.almacenId || null;

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, login, registerDueño, logout,
        isDueño, isVendedor, almacenId, isAuthenticated: !!userData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}

export async function crearVendedorDirecto(almacenId, nombre, username, password) {
  const cleanUser = username.toLowerCase().trim();
  const email = `vendedor.${cleanUser}.${almacenId}@pos-almacen.local`;
  const snapCheck = await getDoc(doc(db, "publicUsernames", cleanUser));
  if (snapCheck.exists()) throw new Error("El nombre de usuario ya existe");

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await response.json();
  if (data.error) {
    if (data.error.message === "EMAIL_EXISTS") throw new Error("El usuario ya existe");
    if (data.error.message === "WEAK_PASSWORD") throw new Error("Contraseña muy débil (mínimo 6 caracteres)");
    throw new Error(data.error.message);
  }
  const uid = data.localId;
  await setDoc(doc(db, "users", uid), {
    email, nombre, username: cleanUser, role: ROLES.VENDEDOR,
    almacenId, activo: true, createdAt: new Date().toISOString(),
  });
  await setDoc(doc(db, "publicUsernames", cleanUser), {
    email, almacenId, uid,
  });
  return { uid, email, username: cleanUser };
}

export async function toggleVendedorEstado(vendedorId, activo) {
  await updateDoc(doc(db, "users", vendedorId), {
    activo, updatedAt: new Date().toISOString(),
  });
}

export async function getVendedores(almacenId) {
  const q = query(collection(db, "users"), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.role === "vendedor");
}

export async function sendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
}
````

## File: src/hooks/useOffline.js
````javascript
import { useState, useEffect, useCallback } from "react";
import { salesService } from "../services/firestoreSales";
import { fiadosService } from "../services/firestoreFiados";
import { productsService } from "../services/firestoreProducts";

const SYNC_KEY = "pos_offline_queue";
const OFFLINE_TURNO_KEY = "pos_offline_turno";

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    setPendingCount(queue.length);
  }, [isOnline, syncing]);

  // Sincronizar cola automáticamente al reconectar
  useEffect(() => {
    if (!isOnline) return;

    async function syncQueue() {
      const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
      if (queue.length === 0) return;

      setSyncing(true);
      const remaining = [];
      const turnoIdMap = {}; // Mapeo: tempId -> realId

      for (const op of queue) {
        try {
          if (op.type === "turno_abrir") {
            // Crear turno en Firestore primero (obtiene ID real)
            const nuevoTurno = await salesService.createTurno(op.almacenId, op.data);
            turnoIdMap[op.tempId] = nuevoTurno.id;
            // Actualizar turno offline guardado con el ID real
            const offlineTurno = JSON.parse(localStorage.getItem(OFFLINE_TURNO_KEY) || "null");
            if (offlineTurno && offlineTurno.id === op.tempId) {
              localStorage.setItem(OFFLINE_TURNO_KEY, JSON.stringify({
                ...offlineTurno,
                id: nuevoTurno.id,
              }));
            }
          } else if (op.type === "venta") {
            const turnoId = turnoIdMap[op.data.turnoId] || op.data.turnoId;
            await productsService.discountStockBatch(op.data.productos.map(p => ({
              id: p.id,
              cantidad: p.cantidad
            })));
            await salesService.createSale(op.almacenId, { ...op.data, turnoId });
          } else if (op.type === "fiado") {
            const turnoId = turnoIdMap[op.data.turnoId] || op.data.turnoId;
            await productsService.discountStockBatch(op.data.productos.map(p => ({
              id: p.id,
              cantidad: p.cantidad
            })));
            await fiadosService.createFiado(op.almacenId, { ...op.data, turnoId });
          } else if (op.type === "turno_cerrar") {
            const turnoId = turnoIdMap[op.turnoId] || op.turnoId;
            await salesService.updateTurno(turnoId, op.data);
            // Limpiar turno offline si se cerró correctamente
            localStorage.removeItem(OFFLINE_TURNO_KEY);
          }
        } catch (err) {
          console.error("Error sincronizando operación:", err);
          remaining.push(op);
        }
      }

      localStorage.setItem(SYNC_KEY, JSON.stringify(remaining));
      setPendingCount(remaining.length);
      setSyncing(false);
    }

    syncQueue();
  }, [isOnline]);

  const addToQueue = useCallback((operation) => {
    const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    queue.push({ ...operation, timestamp: new Date().toISOString() });
    localStorage.setItem(SYNC_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  }, []);

  const clearQueue = useCallback(() => {
    localStorage.removeItem(SYNC_KEY);
    setPendingCount(0);
  }, []);

  const getQueue = useCallback(() => {
    return JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
  }, []);

  const removeFromQueue = useCallback((index) => {
    const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
    queue.splice(index, 1);
    localStorage.setItem(SYNC_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  }, []);

  const saveOfflineTurno = useCallback((turno) => {
    localStorage.setItem(OFFLINE_TURNO_KEY, JSON.stringify(turno));
  }, []);

  const getOfflineTurno = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_TURNO_KEY));
    } catch { return null; }
  }, []);

  const clearOfflineTurno = useCallback(() => {
    localStorage.removeItem(OFFLINE_TURNO_KEY);
  }, []);

  return {
    isOnline,
    syncing,
    setSyncing,
    pendingCount,
    addToQueue,
    clearQueue,
    getQueue,
    removeFromQueue,
    saveOfflineTurno,
    getOfflineTurno,
    clearOfflineTurno,
  };
}
````

## File: src/hooks/useTurno.js
````javascript
import { useState, useEffect, useCallback } from "react";
import {
  getActiveTurno,
  closeTurno as closeTurnoService,
  openTurno as openTurnoService,
} from "../services/firestoreSales";

export function useTurno(almacenId, vendedorId) {
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!almacenId || !vendedorId) {
      setTurno(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const t = await getActiveTurno(almacenId, vendedorId);
      setTurno(t);
    } catch (e) {
      console.error(e);
      setError("No se pudo verificar el turno");
    } finally {
      setLoading(false);
    }
  }, [almacenId, vendedorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const abrir = useCallback(
    async (efectivoInicial, vendedorNombre) => {
      if (!almacenId || !vendedorId) {
        throw new Error("Falta almacenId o vendedorId");
      }
      setLoading(true);
      setError("");
      try {
        const res = await openTurnoService(
          almacenId,
          vendedorId,
          vendedorNombre,
          efectivoInicial
        );
        await refresh();
        return res;
      } catch (e) {
        console.error(e);
        setError(e.message || "Error al abrir turno");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [almacenId, vendedorId, refresh]
  );

  const cerrar = useCallback(async () => {
    if (!almacenId || !vendedorId) {
      throw new Error("Falta almacenId o vendedorId");
    }
    setLoading(true);
    setError("");
    try {
      const resumen = await closeTurnoService(almacenId, vendedorId);
      setTurno(null);
      return resumen;
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cerrar turno");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [almacenId, vendedorId]);

  return { turno, loading, error, refresh, abrir, cerrar };
}
````

## File: src/pages/AdminVendedores.jsx
````javascript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usersService } from "../services/firestoreUsers";
import { puedeCrearVendedor, LIMITES } from "../services/planLimits";
import { UserPlus, Trash2, UserCheck, UserX, Loader2, Crown, AlertTriangle, KeyRound } from "lucide-react";

export default function AdminVendedores() {
  const { userData } = useAuth();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", nombre: "" });
  const [error, setError] = useState("");
  const [planInfo, setPlanInfo] = useState({ plan: "basico", usados: 0, limite: 1, permitido: true });
  const [cambiandoPwd, setCambiandoPwd] = useState(null);
  const [nuevaPwd, setNuevaPwd] = useState("");

  useEffect(() => {
    if (userData?.almacenId) {
      cargarTodo();
    }
  }, [userData]);

  async function cargarTodo() {
    setLoading(true);
    const data = await usersService.getVendedores(userData.almacenId);
    setVendedores(data);
    await cargarPlanInfo(data.length);
    setLoading(false);
  }

  async function cargarPlanInfo(cantidadActual = null) {
    const r = await puedeCrearVendedor(userData.almacenId);
    setPlanInfo({
      plan: r.plan || "basico",
      usados: r.usados ?? cantidadActual ?? vendedores.length,
      limite: r.limite ?? LIMITES.basico.vendedores,
      permitido: r.permitido,
    });
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError("");
    try {
      await usersService.createVendedor({
        username: form.username.trim(),
        password: form.password,
        nombre: form.nombre.trim(),
        almacenId: userData.almacenId,
      });
      setForm({ username: "", password: "", nombre: "" });
      setMostrarForm(false);
      await cargarTodo();
    } catch (err) {
      setError(err.message || "Error al crear vendedor");
    }
  }

  async function toggleActivo(vendedor) {
    await usersService.updateVendedor(vendedor.id, { activo: !vendedor.activo });
    await cargarTodo();
  }

  async function handleEliminar(vendedor) {
    if (!confirm(`¿Eliminar permanentemente a ${vendedor.nombre}?\n\nEsta acción no se puede deshacer.`)) return;
    try {
      await usersService.deleteVendedor(vendedor.id, vendedor.username);
      await cargarTodo();
    } catch (err) {
      alert("Error al eliminar: " + (err.message || "Verifica las reglas de Firestore"));
      console.error(err);
    }
  }

  async function handleCambiarPassword(vendedor) {
    if (!nuevaPwd || nuevaPwd.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      await usersService.cambiarPasswordVendedor(vendedor.id, nuevaPwd);
      setCambiandoPwd(null);
      setNuevaPwd("");
      alert(`Contraseña de ${vendedor.nombre} actualizada. El cambio se aplicará la próxima vez que inicie sesión.`);
      await cargarTodo();
    } catch (err) {
      alert("Error al cambiar contraseña: " + err.message);
    }
  }

  const alLimite = planInfo.usados >= planInfo.limite && planInfo.limite !== Infinity;

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
          <UserPlus className="w-6 h-6 text-blue-600" /> Vendedores
        </h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          disabled={alLimite}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <UserPlus size={18} /> Nuevo Vendedor
        </button>
      </div>

      <div className={`flex items-center justify-between mb-4 p-3 rounded-lg border text-sm ${
        planInfo.plan === "pro"
          ? "bg-purple-50 border-purple-200 text-purple-700"
          : "bg-gray-50 border-gray-200 text-gray-600"
      }`}>
        <div className="flex items-center gap-2">
          <Crown size={16} />
          <span className="font-medium">Plan {planInfo.plan.toUpperCase()}</span>
          <span>• Vendedores: {planInfo.usados} / {planInfo.limite === Infinity ? "∞" : planInfo.limite}</span>
        </div>
        {planInfo.plan === "basico" && (
          <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
            Upgrade a Pro para vendedores ilimitados
          </span>
        )}
      </div>

      {alLimite && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          Has alcanzado el límite de vendedores de tu plan. Elimina uno o actualiza a Pro.
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Crear Vendedor</h2>
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (login)</label>
              <input type="text" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required minLength={6} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setMostrarForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
              Crear Vendedor
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Usuario</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendedores.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{v.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{v.username}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${v.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {v.activo ? <UserCheck size={12} /> : <UserX size={12} />}
                    {v.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => toggleActivo(v)}
                      className={`p-1.5 rounded-lg transition ${v.activo ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                      title={v.activo ? "Desactivar" : "Activar"}>
                      {v.activo ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button onClick={() => setCambiandoPwd(v)}
                      className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Cambiar contraseña">
                      <KeyRound size={16} />
                    </button>
                    <button onClick={() => handleEliminar(v)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendedores.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <UserPlus size={40} className="mx-auto mb-2" />
            <p>No hay vendedores registrados</p>
          </div>
        )}
      </div>

      {cambiandoPwd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-1">Cambiar contraseña</h3>
            <p className="text-sm text-gray-500 mb-4">{cambiandoPwd.nombre}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  value={nuevaPwd}
                  onChange={(e) => setNuevaPwd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setCambiandoPwd(null); setNuevaPwd(""); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleCambiarPassword(cambiandoPwd)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <KeyRound size={16} /> Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
````

## File: src/pages/ConfiguracionAlmacen.jsx
````javascript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { configService } from "../services/firestoreConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Settings, Save, Store, FileText, MapPin, Phone, Image, Loader2 } from "lucide-react";

export default function ConfiguracionAlmacen() {
  const { almacenId, isDueño } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState({
    nombreFiscal: "",
    rut: "",
    direccion: "",
    telefono: "",
    giro: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (almacenId) cargarConfig();
  }, [almacenId]);

  async function cargarConfig() {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "almacenes", almacenId));
      if (snap.exists()) {
        const d = snap.data();
        setForm({
          nombreFiscal: d.nombreFiscal || d.nombre || "",
          rut: d.rut || "",
          direccion: d.direccion || "",
          telefono: d.telefono || "",
          giro: d.giro || "",
          logoUrl: d.logoUrl || "",
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    if (!isDueño) {
      alert("Solo el dueño puede modificar la configuración");
      return;
    }
    setSaving(true);
    try {
      const nombreGuardar = form.nombreFiscal.trim() || "Negocio";
      await updateDoc(doc(db, "almacenes", almacenId), {
        nombreFiscal: nombreGuardar,
        rut: form.rut.trim(),
        direccion: form.direccion.trim(),
        telefono: form.telefono.trim(),
        giro: form.giro.trim(),
        logoUrl: form.logoUrl.trim(),
        updatedAt: new Date().toISOString(),
      });
      // Guardar en localStorage para que aparezca en login y navbar
      localStorage.setItem("pos_negocio_nombre", nombreGuardar);
      setMensaje("Configuración guardada correctamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Configuración del Negocio</h1>
      </div>

      {mensaje && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {mensaje}
        </div>
      )}

      <form onSubmit={handleGuardar} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Store size={14} /> Nombre del negocio / Razón social *
          </label>
          <input
            type="text"
            value={form.nombreFiscal}
            onChange={(e) => setForm({ ...form, nombreFiscal: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: Almacén La Esquina"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Este nombre aparecerá en la app y en los PDFs.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FileText size={14} /> RUT
          </label>
          <input
            type="text"
            value={form.rut}
            onChange={(e) => setForm({ ...form, rut: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: 76.123.456-K"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <MapPin size={14} /> Dirección
          </label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: Av. Principal 123, Santiago"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Phone size={14} /> Teléfono
          </label>
          <input
            type="text"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: +56 9 1234 5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giro</label>
          <input
            type="text"
            value={form.giro}
            onChange={(e) => setForm({ ...form, giro: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: Almacén y despacho de bebidas"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Image size={14} /> URL del Logo (opcional)
          </label>
          <input
            type="url"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Puedes subir una imagen a Imgur o Firebase Storage y pegar el enlace aquí.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
            {saving ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </form>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">¿Por qué es importante?</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>El nombre del negocio aparece en la app, login y PDFs.</li>
          <li>Los PDFs de informes mostrarán el nombre fiscal y RUT.</li>
          <li>El contador o el SII pueden exigir estos datos.</li>
        </ul>
      </div>
    </div>
  );
}
````

## File: src/pages/Dashboard.jsx
````javascript
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import POS from "../components/POS";
import ProductManager from "../components/ProductManager";
import Reports from "../components/Reports";
import Mermas from "../components/Mermas";
import Fiados from "../components/Fiados";
import Offers from "../components/Offers";
import AdminVendedores from "./AdminVendedores";
import ConfiguracionAlmacen from "./ConfiguracionAlmacen";

export default function Dashboard() {
  const { isDueño, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/vender" element={<POS />} />
          <Route path="/productos" element={<ProductManager />} />
          <Route path="/fiados" element={<Fiados />} />
          {isDueño && (
            <>
              <Route path="/ofertas" element={<Offers />} />
              <Route path="/mermas" element={<Mermas />} />
              <Route path="/informes" element={<Reports />} />
              <Route path="/vendedores" element={<AdminVendedores />} />
              <Route path="/configuracion" element={<ConfiguracionAlmacen />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
````

## File: src/pages/Login.jsx
````javascript
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, sendPasswordReset } from "../hooks/useAuth";
import { Store, Eye, EyeOff, Loader2, Mail, WifiOff } from "lucide-react";

const MAX_EMAIL_LEN = 100;
const MAX_PASSWORD_LEN = 50;
const MAX_USERNAME_LEN = 30;

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [recuperando, setRecuperando] = useState(false);
  const [mensajeRecuperar, setMensajeRecuperar] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("Tu Negocio");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("pos_negocio_nombre");
    if (saved) setNombreNegocio(saved);
  }, []);

  function sanitizeInput(value, maxLen) {
    return value.slice(0, maxLen).replace(/[<>'"&]/g, "");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanIdentifier = sanitizeInput(identifier, identifier.includes("@") ? MAX_EMAIL_LEN : MAX_USERNAME_LEN);
    const cleanPassword = sanitizeInput(password, MAX_PASSWORD_LEN);

    if (!cleanIdentifier.trim()) {
      setError("Ingresa tu usuario o correo");
      return;
    }
    if (cleanPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await login(cleanIdentifier, cleanPassword);
      navigate("/");
    } catch (err) {
      let msg = "Error al iniciar sesión";

      // Errores offline específicos
      if (err.message?.includes("Sin conexión")) {
        msg = err.message;
      } else if (err.message === "Usuario no encontrado") {
        msg = "Usuario no encontrado";
      } else if (err.code === "auth/user-not-found") {
        msg = "Usuario no encontrado";
      } else if (err.code === "auth/wrong-password") {
        msg = "Contraseña incorrecta";
      } else if (err.code === "auth/invalid-credential") {
        msg = "Usuario o contraseña incorrectos";
      } else if (err.code === "auth/invalid-email") {
        msg = "Formato de usuario/correo inválido";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Demasiados intentos. Intenta más tarde.";
      } else if (err.code === "auth/network-request-failed") {
        msg = "Sin conexión a internet. Si ya iniciaste sesión antes en este dispositivo, inténtalo de nuevo. Si es la primera vez, necesitas internet.";
      } else if (err.message) {
        // Mostrar mensaje original si no coincide con los anteriores
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  async function handleRecuperar(e) {
    e.preventDefault();
    setMensajeRecuperar("");
    const email = sanitizeInput(emailRecuperar, MAX_EMAIL_LEN);
    if (!email.includes("@")) {
      setMensajeRecuperar("Ingresa un correo válido");
      return;
    }
    setRecuperando(true);
    try {
      await sendPasswordReset(email);
      setMensajeRecuperar("Te enviamos un correo para recuperar tu contraseña. Revisa tu bandeja de entrada.");
      setEmailRecuperar("");
    } catch (err) {
      let msg = "Error al enviar correo";
      if (err.code === "auth/user-not-found") msg = "No existe una cuenta con ese correo";
      setMensajeRecuperar(msg);
    } finally {
      setRecuperando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{nombreNegocio}</h1>
          <p className="text-gray-500 mt-1">Inicia sesión en tu cuenta</p>
        </div>

        {!navigator.onLine && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <WifiOff size={16} />
            <span>Sin internet. Si es la primera vez en este dispositivo, necesitas conectarte una vez para guardar la sesión.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!mostrarRecuperar ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario o Correo electrónico
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(sanitizeInput(e.target.value, MAX_EMAIL_LEN))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="juan o juan@email.com"
                maxLength={MAX_EMAIL_LEN}
                autoComplete="username"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Vendedores: usa tu nombre de usuario. Dueños: usa tu correo.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(sanitizeInput(e.target.value, MAX_PASSWORD_LEN))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
                  placeholder="••••••••"
                  maxLength={MAX_PASSWORD_LEN}
                  minLength={6}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMostrarRecuperar(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRecuperar} className="space-y-4">
            <div className="text-center mb-4">
              <Mail className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <h2 className="text-lg font-bold text-gray-800">Recuperar contraseña</h2>
              <p className="text-sm text-gray-500">Ingresa tu correo de dueño y te enviaremos un enlace</p>
            </div>

            {mensajeRecuperar && (
              <div className={`border px-4 py-3 rounded-lg text-sm ${mensajeRecuperar.includes("enviamos") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {mensajeRecuperar}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={emailRecuperar}
                onChange={(e) => setEmailRecuperar(sanitizeInput(e.target.value, MAX_EMAIL_LEN))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="tu@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={recuperando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {recuperando ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar correo de recuperación"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setMostrarRecuperar(false); setMensajeRecuperar(""); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Volver al login
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta de dueño?{" "}
            <Link to="/registro" className="text-blue-600 hover:text-blue-700 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
````

## File: src/pages/Register.jsx
````javascript
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Store, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

const MAX_LEN = 100;
const MAX_PASS = 50;

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombreAlmacen, setNombreAlmacen] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nombreNegocio, setNombreNegocio] = useState("Tu Negocio");
  const { registerDueño } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("pos_negocio_nombre");
    if (saved) setNombreNegocio(saved);
  }, []);

  function sanitize(value, max) {
    return value.slice(0, max).replace(/[<>'"&]/g, "");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanNombre = sanitize(nombre, MAX_LEN);
    const cleanEmail = sanitize(email, MAX_LEN);
    const cleanPass = sanitize(password, MAX_PASS);
    const cleanAlmacen = sanitize(nombreAlmacen, MAX_LEN);

    if (cleanPass.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (cleanPass !== sanitize(confirmPassword, MAX_PASS)) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Ingresa un correo válido");
      return;
    }

    setLoading(true);
    try {
      await registerDueño(cleanEmail, cleanPass, cleanNombre, cleanAlmacen);
      // Guardar nombre para que aparezca en login la próxima vez
      localStorage.setItem("pos_negocio_nombre", cleanAlmacen || "Negocio");
      navigate("/");
    } catch (err) {
      let msg = "Error al registrar";
      if (err.code === "auth/email-already-in-use") msg = "Este email ya está registrado";
      else if (err.code === "auth/invalid-email") msg = "Email inválido";
      else if (err.code === "auth/weak-password") msg = "Contraseña muy débil";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm">
            <ArrowLeft size={16} className="mr-1" /> Volver al login
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Crear Cuenta de Dueño</h1>
          <p className="text-gray-500 mt-1">Registra tu negocio y comienza a vender</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(sanitize(e.target.value, MAX_LEN))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Juan Pérez"
              maxLength={MAX_LEN}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio</label>
            <input
              type="text"
              value={nombreAlmacen}
              onChange={(e) => setNombreAlmacen(sanitize(e.target.value, MAX_LEN))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Almacén La Esquina"
              maxLength={MAX_LEN}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(sanitize(e.target.value, MAX_LEN))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="tu@email.com"
              maxLength={MAX_LEN}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(sanitize(e.target.value, MAX_PASS))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none pr-10"
                placeholder="Mínimo 6 caracteres"
                maxLength={MAX_PASS}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(sanitize(e.target.value, MAX_PASS))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Repite tu contraseña"
              maxLength={MAX_PASS}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear Cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
````

## File: src/pages/RegisterVendedor.jsx
````javascript
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserPlus, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function RegisterVendedor() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerVendedor } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (codigo.length < 4) {
      setError("Ingresa un código de invitación válido");
      return;
    }

    setLoading(true);
    try {
      await registerVendedor(email, password, nombre, codigo.toUpperCase());
      navigate("/");
    } catch (err) {
      let msg = err.message || "Error al registrar";
      if (err.code === "auth/email-already-in-use") msg = "Este email ya está registrado";
      else if (err.code === "auth/invalid-email") msg = "Email inválido";
      else if (err.code === "auth/weak-password") msg = "Contraseña muy débil";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm">
            <ArrowLeft size={16} className="mr-1" /> Volver al login
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Unirse como Vendedor</h1>
          <p className="text-gray-500 mt-1">Ingresa el código que te dio el dueño</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código de invitación
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition uppercase tracking-widest font-mono text-center text-lg"
              placeholder="ABC123"
              maxLength={10}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tu nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              placeholder="Pedro Gómez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition pr-10"
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Unirse al Almacén"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Eres dueño?{" "}
          <Link to="/registro" className="text-purple-600 hover:text-purple-700 font-medium">
            Registra tu almacén
          </Link>
        </p>
      </div>
    </div>
  );
}
````

## File: src/services/firestoreConfig.js
````javascript
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function getConfig(almacenId) {
  if (!almacenId) return {};
  const snap = await getDoc(doc(db, "almacenes", almacenId));
  if (snap.exists()) return snap.data().config || {};
  return {};
}

export async function updateConfig(almacenId, config) {
  if (!almacenId) throw new Error("Falta almacenId");
  await updateDoc(doc(db, "almacenes", almacenId), { config });
}

export async function getAlmacenData(almacenId) {
  if (!almacenId) return null;
  const snap = await getDoc(doc(db, "almacenes", almacenId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export const configService = { getConfig, updateConfig, getAlmacenData };
````

## File: src/services/firestoreFiados.js
````javascript
import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
} from "firebase/firestore";

const COLLECTION = "fiados";

export async function createFiado(almacenId, fiadoData) {
  const data = {
    ...fiadoData, almacenId, estado: "pendiente", pagos: [],
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
}

export async function getFiados(almacenId, filters = {}) {
  if (!almacenId) return [];
  const q = query(collection(db, COLLECTION), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  let fiados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  fiados.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (filters.estado) fiados = fiados.filter((f) => f.estado === filters.estado);
  if (filters.search) {
    const term = filters.search.toLowerCase();
    fiados = fiados.filter((f) =>
      f.clienteNombre?.toLowerCase().includes(term) || f.clienteTelefono?.includes(term)
    );
  }
  return fiados;
}

export async function getFiado(fiadoId) {
  const snap = await getDoc(doc(db, COLLECTION, fiadoId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export async function addPago(fiadoId, pagoData) {
  const fiado = await getFiado(fiadoId);
  if (!fiado) throw new Error("Fiado no encontrado");
  const pagos = [...(fiado.pagos || []), pagoData];
  const totalPagado = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);
  const estado = totalPagado >= fiado.total ? "pagada" : totalPagado > 0 ? "parcial" : "pendiente";
  await updateDoc(doc(db, COLLECTION, fiadoId), {
    pagos, estado, updatedAt: new Date().toISOString(),
  });
  return { ...fiado, pagos, estado };
}

export async function deleteFiado(fiadoId) {
  await deleteDoc(doc(db, COLLECTION, fiadoId));
}

export const fiadosService = {
  createFiado, getFiados, getFiado, addPago, deleteFiado,
};
````

## File: src/services/firestoreMermas.js
````javascript
import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
} from "firebase/firestore";

const COLLECTION = "mermas";

export async function createMerma(almacenId, mermaData) {
  const data = { ...mermaData, almacenId, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
}

export async function getMermas(almacenId, filters = {}) {
  if (!almacenId) return [];
  const q = query(collection(db, COLLECTION), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  let mermas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  mermas.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (filters.desde) mermas = mermas.filter((m) => new Date(m.createdAt) >= new Date(filters.desde));
  if (filters.hasta) mermas = mermas.filter((m) => new Date(m.createdAt) <= new Date(filters.hasta));
  if (filters.motivo) mermas = mermas.filter((m) => m.motivo === filters.motivo);
  return mermas;
}

export async function deleteMerma(mermaId) {
  await deleteDoc(doc(db, COLLECTION, mermaId));
}

export const mermasService = {
  createMerma, getMermas, deleteMerma,
};
````

## File: src/services/firestoreProducts.js
````javascript
import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, addDoc,
  runTransaction,
} from "firebase/firestore";
import { puedeCrearProducto } from "./planLimits";

const COLLECTION = "productos";
const PRODUCTS_CACHE_KEY = "pos_products_cache";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCacheKey(almacenId) {
  return `${PRODUCTS_CACHE_KEY}_${almacenId}`;
}

export function saveProductsToCache(almacenId, products) {
  try {
    localStorage.setItem(getCacheKey(almacenId), JSON.stringify({
      products,
      timestamp: new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Error guardando productos en cache:", e);
  }
}

export function getCachedProducts(almacenId) {
  try {
    const raw = localStorage.getItem(getCacheKey(almacenId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.products || null;
  } catch (e) {
    console.error("Error leyendo productos de cache:", e);
    return null;
  }
}

export async function getProducts(almacenId) {
  if (!almacenId) return [];

  try {
    const q = query(
      collection(db, COLLECTION),
      where("almacenId", "==", almacenId)
    );
    const snap = await getDocs(q);
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const sorted = products.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));

    // Guardar en cache para uso offline
    saveProductsToCache(almacenId, sorted);
    return sorted;
  } catch (err) {
    console.warn("Error cargando productos de Firestore, usando cache local:", err.message);
    const cached = getCachedProducts(almacenId);
    if (cached) return cached;
    throw err;
  }
}

export async function getProduct(productId) {
  const snap = await getDoc(doc(db, COLLECTION, productId));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export async function createProduct(almacenId, productData) {
  const check = await puedeCrearProducto(almacenId);
  if (!check.permitido) throw new Error(check.mensaje);

  const data = {
    ...productData,
    almacenId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
}

export async function updateProduct(productId, updates) {
  const data = { ...updates, updatedAt: new Date().toISOString() };
  await updateDoc(doc(db, COLLECTION, productId), data);
  return { id: productId, ...updates };
}

export async function deleteProduct(productId) {
  await deleteDoc(doc(db, COLLECTION, productId));
}

export async function addStock(productId, cantidad, loteData = null) {
  const productRef = doc(db, COLLECTION, productId);

  return await runTransaction(db, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error("Producto no encontrado");

    const product = productSnap.data();
    const nuevoStock = (product.stock || 0) + cantidad;
    const updates = { stock: nuevoStock, updatedAt: new Date().toISOString() };

    if (product.perecedero && loteData) {
      const lotes = product.lotes ? [...product.lotes] : [];
      lotes.push({
        id: generateId(),
        cantidad,
        fechaVencimiento: loteData.fechaVencimiento,
        fechaIngreso: new Date().toISOString(),
      });
      updates.lotes = lotes;
    }

    transaction.update(productRef, updates);
    return { id: productId, ...product, ...updates };
  });
}

export async function discountStock(productId, cantidad) {
  const productRef = doc(db, COLLECTION, productId);

  return await runTransaction(db, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error("Producto no encontrado");

    const product = productSnap.data();

    if ((product.stock || 0) < cantidad) {
      throw new Error(`Stock insuficiente: ${product.nombre || productId}`);
    }

    const nuevoStock = (product.stock || 0) - cantidad;
    const updates = {
      stock: nuevoStock,
      updatedAt: new Date().toISOString(),
    };

    if (product.perecedero && product.lotes) {
      let restante = cantidad;
      const lotes = [...product.lotes].sort(
        (a, b) => new Date(a.fechaIngreso) - new Date(b.fechaIngreso)
      );
      for (let i = 0; i < lotes.length && restante > 0; i++) {
        if (lotes[i].cantidad <= restante) {
          restante -= lotes[i].cantidad;
          lotes[i].cantidad = 0;
        } else {
          lotes[i].cantidad -= restante;
          restante = 0;
        }
      }
      updates.lotes = lotes.filter((l) => l.cantidad > 0);
    }

    transaction.update(productRef, updates);
    return { id: productId, ...product, ...updates };
  });
}

export async function discountStockBatch(carritoItems) {
  const results = [];
  for (const item of carritoItems) {
    const res = await discountStock(item.id, item.cantidad);
    results.push(res);
  }
  return results;
}

export async function getProductByBarcode(almacenId, barcode) {
  if (!almacenId || !barcode) return null;
  try {
    const q = query(
      collection(db, COLLECTION),
      where("almacenId", "==", almacenId),
      where("codigoBarras", "==", barcode)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
    return null;
  } catch (err) {
    // Fallback: buscar en cache local
    const cached = getCachedProducts(almacenId);
    if (cached) {
      return cached.find(p => p.codigoBarras === barcode) || null;
    }
    throw err;
  }
}

export async function searchProducts(almacenId, searchTerm) {
  if (!almacenId) return [];
  const products = await getProducts(almacenId);
  if (!searchTerm) return products;
  const term = searchTerm.toLowerCase();
  return products.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(term) ||
      p.codigoBarras?.includes(term) ||
      p.categoria?.toLowerCase().includes(term)
  );
}

export const productsService = {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addStock, discountStock, discountStockBatch, getProductByBarcode, searchProducts,
  getCachedProducts, saveProductsToCache,
};
````

## File: src/services/firestoreSales.js
````javascript
import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs, addDoc,
} from "firebase/firestore";

const COLLECTION_VENTAS = "ventas";
const COLLECTION_TURNOS = "turnos";

export async function createSale(almacenId, saleData) {
  const data = { ...saleData, almacenId, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, COLLECTION_VENTAS), data);
  return { id: ref.id, ...data };
}

export async function getSales(almacenId, filters = {}) {
  if (!almacenId) return [];
  const q = query(
    collection(db, COLLECTION_VENTAS),
    where("almacenId", "==", almacenId)
  );
  const snap = await getDocs(q);
  let sales = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  sales.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (filters.desde) sales = sales.filter((s) => new Date(s.createdAt) >= new Date(filters.desde));
  if (filters.hasta) sales = sales.filter((s) => new Date(s.createdAt) <= new Date(filters.hasta));
  if (filters.metodoPago) sales = sales.filter((s) => s.metodoPago === filters.metodoPago);
  if (filters.tipo) sales = sales.filter((s) => s.tipo === filters.tipo);
  return sales;
}

export async function getTodaySales(almacenId) {
  const hoy = new Date().toISOString().split("T")[0];
  const sales = await getSales(almacenId);
  return sales.filter((s) => s.createdAt?.startsWith(hoy));
}

export async function createTurno(almacenId, turnoData) {
  const data = { ...turnoData, almacenId, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, COLLECTION_TURNOS), data);
  return { id: ref.id, ...data };
}

export async function updateTurno(turnoId, updates) {
  await updateDoc(doc(db, COLLECTION_TURNOS, turnoId), {
    ...updates, updatedAt: new Date().toISOString(),
  });
}

export async function getTurnoActivo(almacenId) {
  if (!almacenId) return null;
  const q = query(
    collection(db, COLLECTION_TURNOS),
    where("almacenId", "==", almacenId),
    where("estado", "==", "abierto")
  );
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  return null;
}

export async function getTurnos(almacenId) {
  if (!almacenId) return [];
  const q = query(collection(db, COLLECTION_TURNOS), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  const turnos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return turnos.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export const salesService = {
  createSale, getSales, getTodaySales, createTurno, updateTurno, getTurnoActivo, getTurnos,
};
````

## File: src/services/firestoreUsers.js
````javascript
import { db } from "../firebase/firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
} from "firebase/firestore";
import { puedeCrearVendedor } from "./planLimits";

const API_KEY = "AIzaSyAQUD8KyWSPYNz73RTrdSy-jZ3Lf2QiF3c";

export const usersService = {
  async getUserData(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async createVendedor({ username, password, nombre, almacenId }) {
    const check = await puedeCrearVendedor(almacenId);
    if (!check.permitido) throw new Error(check.mensaje);

    const email = `vendedor.${username}.${almacenId}@pos-almacen.local`;

    // 1. Intentar crear usuario en Firebase Auth
    let res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    let data = await res.json();

    // 2. Si EMAIL_EXISTS, intentar recuperar el UID haciendo login
    if (!res.ok && data.error?.message === "EMAIL_EXISTS") {
      const loginRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );
      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        if (loginData.error?.message === "INVALID_PASSWORD") {
          throw new Error(
            `El usuario "${username}" ya existe con otra contraseña.\n\n` +
            "Si fue creado antes y no aparece en la lista, elimínalo desde " +
            "Firebase Console → Authentication → Users, y vuelve a intentar."
          );
        }
        throw new Error(loginData.error?.message || "Error al verificar usuario existente");
      }

      // Login exitoso = reutilizar UID existente
      data = loginData;
    } else if (!res.ok) {
      if (data.error?.message === "WEAK_PASSWORD") {
        throw new Error("Contraseña muy débil (mínimo 6 caracteres)");
      }
      throw new Error(data.error?.message || "Error al crear vendedor");
    }

    const uid = data.localId;

    // 3. Crear documento en Firestore
    await setDoc(doc(db, "users", uid), {
      uid,
      nombre,
      username,
      email,
      role: "vendedor",
      almacenId,
      activo: true,
      createdAt: new Date().toISOString(),
    });

    // 4. Registrar username público
    await setDoc(doc(db, "publicUsernames", username), {
      uid,
      almacenId,
      createdAt: new Date().toISOString(),
    });

    return { uid, email };
  },

  async getVendedores(almacenId) {
    const q = query(
      collection(db, "users"),
      where("almacenId", "==", almacenId),
      where("role", "==", "vendedor")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async updateVendedor(uid, data) {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
  },

  async deleteVendedor(uid, username) {
    if (username) {
      await deleteDoc(doc(db, "publicUsernames", username));
    }
    await deleteDoc(doc(db, "users", uid));
  },

  async cambiarPasswordVendedor(uid, nuevaPassword) {
    // Guardamos la nueva contraseña en el documento del vendedor
    // El hook useAuth la aplicará automáticamente al siguiente login del vendedor
    const ref = doc(db, "users", uid);
    await updateDoc(ref, {
      passwordPending: nuevaPassword,
      updatedAt: new Date().toISOString(),
    });
  },
};
````

## File: src/services/planLimits.js
````javascript
import { db } from "../firebase/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export const LIMITES = {
  basico: { productos: 500, vendedores: 1 },
  pro:    { productos: Infinity, vendedores: Infinity },
};

export async function getPlan(almacenId) {
  if (!almacenId) return "basico";
  const snap = await getDoc(doc(db, "almacenes", almacenId));
  if (snap.exists()) return snap.data().plan || "basico";
  return "basico";
}

export async function contarProductos(almacenId) {
  if (!almacenId) return 0;
  const q = query(collection(db, "productos"), where("almacenId", "==", almacenId));
  const snap = await getDocs(q);
  return snap.size;
}

export async function contarVendedores(almacenId) {
  if (!almacenId) return 0;
  const q = query(collection(db, "users"), where("almacenId", "==", almacenId), where("role", "==", "vendedor"));
  const snap = await getDocs(q);
  return snap.size;
}

export async function puedeCrearProducto(almacenId) {
  const plan = await getPlan(almacenId);
  const limite = LIMITES[plan]?.productos ?? LIMITES.basico.productos;
  const actuales = await contarProductos(almacenId);
  if (limite === Infinity) {
    return { permitido: true, plan, usados: actuales, limite: Infinity };
  }
  if (actuales >= limite) {
    return {
      permitido: false,
      plan,
      usados: actuales,
      limite,
      mensaje: `Limite alcanzado: Plan ${plan.toUpperCase()} permite maximo ${limite} productos. Actual: ${actuales}.`,
    };
  }
  return { permitido: true, plan, usados: actuales, limite };
}

export async function puedeCrearVendedor(almacenId) {
  const plan = await getPlan(almacenId);
  const limite = LIMITES[plan]?.vendedores ?? LIMITES.basico.vendedores;
  const actuales = await contarVendedores(almacenId);
  if (limite === Infinity) {
    return { permitido: true, plan, usados: actuales, limite: Infinity };
  }
  if (actuales >= limite) {
    return {
      permitido: false,
      plan,
      usados: actuales,
      limite,
      mensaje: `Limite alcanzado: Plan ${plan.toUpperCase()} permite maximo ${limite} vendedor(es). Actual: ${actuales}.`,
    };
  }
  return { permitido: true, plan, usados: actuales, limite };
}
````

## File: src/types/index.js
````javascript
export const UNIDADES = ["unidad", "kg", "g", "l", "ml", "m", "cm"];

export const CATEGORIAS = [
  "Abarrotes",
  "Bebidas",
  "Lácteos",
  "Carnes",
  "Frutas",
  "Verduras",
  "Panadería",
  "Limpieza",
  "Higiene",
  "Otros",
];

export const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo", color: "green" },
  { value: "tarjeta", label: "Tarjeta", color: "blue" },
  { value: "transferencia", label: "Transferencia", color: "purple" },
  { value: "fiado", label: "Fiado", color: "orange" },
];

export const MOTIVOS_MERMA = [
  "Vencido",
  "Dañado",
  "Roto",
  "Robado",
  "Descomposición",
  "Embalaje defectuoso",
  "Otro",
];

export const ESTADOS_DEUDA = {
  PENDIENTE: "pendiente",
  PARCIAL: "parcial",
  PAGADA: "pagada",
  ATRASADA: "atrasada",
};

export const ROLES = {
  DUEÑO: "dueño",
  VENDEDOR: "vendedor",
};

export const PLANES = {
  BASICO: "basico",
  PRO: "pro",
};

export const DIAS_ALERTA_VENCIMIENTO = [1, 3, 5, 7, 10, 14, 30];
````

## File: src/utils/format.js
````javascript
export function formatCurrency(value) {
  if (value === undefined || value === null) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function diasHastaVencimiento(fechaVencimiento) {
  if (!fechaVencimiento) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaVencimiento);
  venc.setHours(0, 0, 0, 0);
  const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
  return diff;
}

export function estadoVencimiento(fechaVencimiento, diasAlerta = 3) {
  const dias = diasHastaVencimiento(fechaVencimiento);
  if (dias === null) return null;
  if (dias < 0) return { estado: "vencido", label: "Vencido", color: "red" };
  if (dias <= diasAlerta) return { estado: "proximo", label: `Vence en ${dias} días`, color: "orange" };
  return { estado: "ok", label: `Vence en ${dias} días`, color: "green" };
}
````

## File: src/App.jsx
````javascript
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function PrivateRoute({ children, requireDueño = false }) {
  const { isAuthenticated, isDueño, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireDueño && !isDueño) return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  const { userData } = useAuth();

  useEffect(() => {
    // Cambiar título de la pestaña según el negocio configurado
    const saved = localStorage.getItem("pos_negocio_nombre");
    if (saved) {
      document.title = saved;
    } else if (userData?.nombre) {
      document.title = userData.nombre;
    }
  }, [userData]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/*" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
````

## File: src/index.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-tap-highlight-color: transparent;
  }
}
````

## File: src/main.jsx
````javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
````

## File: .gitattributes
````
* text=auto
````

## File: .gitignore
````
# Dependencias
node_modules
dist
dist-ssr
*.local

# Firebase
.firebase/
.firebaserc

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Variables de entorno
.env
.env.local
.env.*.local

# OneDrive residuos
*.tmp
````

## File: CAPACITOR_APK.md
````markdown
# GUÍA: Crear APK para Android (Beta en celular del dueño)

## Opción A: Instalar como PWA (MÁS FÁCIL, recomendada primero)

No necesitas APK. El dueño abre la URL de la app en Chrome del celular y:

1. Abre Chrome → ve a la URL de tu app (ej: `https://tuproyecto.web.app`)
2. Toca los **3 puntos** (menú) → **"Agregar a pantalla de inicio"**
3. Aparece un icono en el celular como si fuera una app nativa
4. Funciona offline (gracias al Service Worker de la PWA)

**Ventajas:** Sin Android Studio, sin compilar, actualizas la web y el celular se actualiza solo.

---

## Opción B: APK real con Capacitor (para distribuir el .apk)

Si el dueño quiere un archivo `.apk` para instalar sin depender del navegador, sigue estos pasos.

### Requisitos

1. **Node.js** (ya lo tienes)
2. **Android Studio** (descarga gratis de [developer.android.com/studio](https://developer.android.com/studio))
3. **Java JDK 17** (Android Studio suele instalarlo solo, o baja de Oracle)
4. **Variables de entorno** en Windows:
   - `ANDROID_HOME` → apuntando a `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk`
   - Agregar al PATH: `%ANDROID_HOME%\platform-tools`

### Paso 1: Instalar Capacitor en tu proyecto

Abre CMD o PowerShell en la carpeta del proyecto y ejecuta:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Paso 2: Compilar la app web

```bash
npm run build
```

Esto genera la carpeta `dist/` con todos los archivos estáticos.

### Paso 3: Inicializar Capacitor

```bash
npx cap init "NombreNegocio" "com.tuempresa.nombreapp" --web-dir dist
```

Ejemplo:
```bash
npx cap init "Almacen La Esquina" "com.esquina.pos" --web-dir dist
```

Esto crea el archivo `capacitor.config.json`.

### Paso 4: Agregar Android

```bash
npx cap add android
```

Esto crea la carpeta `android/` con todo el proyecto Android.

### Paso 5: Sincronizar cambios

Cada vez que hagas `npm run build`, ejecuta:

```bash
npx cap sync
```

Esto copia los archivos de `dist/` al proyecto Android.

### Paso 6: Abrir en Android Studio

```bash
npx cap open android
```

Se abre Android Studio. La primera vez tardará en descargar dependencias (Gradle).

### Paso 7: Generar la APK

En Android Studio:

1. Espera que termine de cargar (barra de progreso abajo)
2. Arriba a la derecha donde dice el nombre del proyecto, selecciona **"app"**
3. Menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. Espera unos minutos
5. Abajo derecha aparece "Build Analyzer" o un aviso. Toca **"locate"** o ve a:
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

### Paso 8: Instalar en el celular

**Opción A - Por cable:**
1. Conecta el celular por USB
2. Activa "Modo desarrollador" y "Depuración USB" en el celular
3. En Android Studio, toca el botón verde **"Run"** (▶️) arriba
4. Elige tu celular de la lista → se instala automáticamente

**Opción B - Enviar el .apk:**
1. Copia el archivo `app-debug.apk` al celular (WhatsApp, email, cable)
2. En el celular, toca el archivo → "Instalar"
3. Si pide permiso: Configuración → Permitir instalar de esta fuente

---

## Script automático para Windows (CREAR_APK.bat)

Haz doble clic en `CREAR_APK.bat` (incluido en este ZIP) después de haber instalado Android Studio. El script hará:

1. `npm install` de Capacitor
2. `npm run build`
3. `cap init` (si no existe)
4. `cap add android` (si no existe)
5. `cap sync`
6. `cap open android`

Luego en Android Studio solo presionas **Build → Build APK**.

---

## Personalizar el nombre de la app en el celular

El nombre que aparece debajo del icono en el celular sale de `capacitor.config.json`:

```json
{
  "appId": "com.tuempresa.nombreapp",
  "appName": "Almacen La Esquina",
  "webDir": "dist"
}
```

Cambia `appName` al nombre del negocio, luego ejecuta `npx cap sync`.

---

## Icono de la app en el celular

Capacitor usa los iconos de `public/icon-192x192.png` y `public/icon-512x512.png`.

Para generar iconos Android de todos los tamaños automáticamente:

```bash
npm install @capacitor/assets
npx capacitor-assets generate --android
```

Esto crea los iconos en `android/app/src/main/res/` en todos los tamaños necesarios.

---

## Actualizar la app después de cambios

1. Haces cambios en el código
2. `npm run build`
3. `npx cap sync`
4. En Android Studio: **Build → Build APK** o presiona **Run**

Si usas la Opción A (PWA), solo haces `firebase deploy` y el celular se actualiza solo al abrir la app.

---

## Resumen: ¿Qué opción elegir?

| | PWA (Opción A) | APK (Opción B) |
|---|---|---|
| Esfuerzo | 0 minutos | 30-60 min primera vez |
| Instalación | Agregar a inicio desde Chrome | Instalar .apk |
| Actualizaciones | Automáticas (deploy web) | Hay que generar APK nueva |
| Offline | ✅ Sí | ✅ Sí |
| Escáner cámara | ✅ Funciona | ✅ Funciona |
| Recomendado para | Beta rápida | Cliente final que no entiende de URLs |

**Mi recomendación:** Empieza con la Opción A (PWA). Es inmediata y el dueño puede probar hoy mismo. Si luego quiere un .apk "de verdad", pasas a la Opción B.
````

## File: COMPILAR_Y_VER.bat
````batch
@echo off
chcp 1252 >nul
title POS Almacen - Compilar
color 0E
cls

echo ==========================================
echo    COMPILANDO POS ALMACEN BARRIO
echo ==========================================
echo.

cd /d "%~dp0"

echo Instalando dependencias (si faltan)...
call npm install
echo.

echo Compilando para produccion...
call npm run build
echo.

echo Compilacion lista. Abriendo en navegador...
start http://localhost:4173/
echo.
echo Servidor de prueba iniciado.
call npx serve dist -l 4173
pause
````

## File: CREAR_APK.bat
````batch
@echo off
chcp 65001 >nul
title Crear APK - POS Negocio
color 0B
cls

echo ==========================================
echo    CREAR APK PARA ANDROID
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no encontrado. Instálalo primero.
    pause
    exit /b 1
)

echo [2/6] Instalando Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/android
if errorlevel 1 (
    echo [ERROR] Fallo al instalar Capacitor.
    pause
    exit /b 1
)

echo [3/6] Compilando app web...
call npm run build
if errorlevel 1 (
    echo [ERROR] Fallo al compilar. Revisa errores arriba.
    pause
    exit /b 1
)

echo [4/6] Inicializando Capacitor (si es primera vez)...
if not exist "capacitor.config.json" (
    echo Creando capacitor.config.json...
    call npx cap init "Negocio" "com.negocio.pos" --web-dir dist
)

echo [5/6] Agregando Android (si es primera vez)...
if not exist "android" (
    call npx cap add android
)

echo [6/6] Sincronizando archivos...
call npx cap sync

echo.
echo ==========================================
echo    LISTO. Abriendo Android Studio...
echo ==========================================
echo.
echo Pasos finales en Android Studio:
echo 1. Espera que cargue (descarga Gradle la primera vez)
echo 2. Arriba a la derecha: selecciona "app"
echo 3. Build -^> Build Bundle(s)/APK(s) -^> Build APK(s)
echo 4. El APK queda en: androidppuild\outputspk\debugpp-debug.apk
echo.

call npx cap open android
pause
````

## File: DIAGNOSTICO.bat
````batch
@echo off
chcp 1252 >nul
title Diagnostico POS Almacen
color 0E
cls

echo ==========================================
echo    DIAGNOSTICO POS ALMACEN BARRIO
echo ==========================================
echo.

cd /d "%~dp0"
echo Carpeta actual: %cd%
echo.

echo --- Verificando archivos ---
if exist "package.json" (
    echo [OK] package.json     : ENCONTRADO
) else (
    echo [ERROR] package.json  : NO ENCONTRADO
)

if exist "node_modules" (
    echo [OK] node_modules     : ENCONTRADO
) else (
    echo [ERROR] node_modules  : NO ENCONTRADO (ejecuta: npm install)
)

if exist "vite.config.js" (
    echo [OK] vite.config.js   : ENCONTRADO
) else (
    echo [ERROR] vite.config.js: NO ENCONTRADO
)

echo.
echo --- Verificando Node.js ---
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] node           : NO INSTALADO
) else (
    for /f "tokens=*" %%a in ('node --version') do echo [OK] node           : %%a
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm            : NO INSTALADO
) else (
    for /f "tokens=*" %%a in ('npm --version') do echo [OK] npm            : v%%a
)

echo.
echo ==========================================
echo Si ves algun [ERROR] arriba, ese es el problema.
echo.
pause
````

## File: firebase.json
````json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
````

## File: firestore.indexes.json
````json
{
  "indexes": [],
  "fieldOverrides": []
}
````

## File: firestore.rules
````
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    function userAlmacenId() {
      return getUserData().almacenId;
    }
    function userRole() {
      return getUserData().role;
    }

    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isAuthenticated() && userRole() == "dueño" && resource.data.almacenId == userAlmacenId();
      allow update: if isAuthenticated() && userRole() == "dueño" && resource.data.almacenId == userAlmacenId() && resource.data.role == "vendedor";
    }

    match /almacenes/{almacenId} {
      allow read: if isAuthenticated() && userAlmacenId() == almacenId;
      allow write: if isAuthenticated() && userRole() == "dueño" && userAlmacenId() == almacenId;
    }

    match /productos/{productId} {
      allow read: if isAuthenticated() && resource.data.almacenId == userAlmacenId();
      allow create: if isAuthenticated() && userRole() == "dueño" && request.resource.data.almacenId == userAlmacenId();
      allow update: if isAuthenticated() && resource.data.almacenId == userAlmacenId() && 
        (userRole() == "dueño" || 
          (userRole() == "vendedor" && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['stock','updatedAt','lotes'])));
      allow delete: if isAuthenticated() && userRole() == "dueño" && resource.data.almacenId == userAlmacenId();
    }

    match /ventas/{saleId} {
      allow read: if isAuthenticated() && resource.data.almacenId == userAlmacenId();
      allow create: if isAuthenticated() && request.resource.data.almacenId == userAlmacenId();
      allow update, delete: if isAuthenticated() && userRole() == "dueño" && resource.data.almacenId == userAlmacenId();
    }

    match /turnos/{turnoId} {
      allow read, create, update: if isAuthenticated() && resource.data.almacenId == userAlmacenId();
      allow delete: if isAuthenticated() && userRole() == "dueño" && resource.data.almacenId == userAlmacenId();
    }

    match /fiados/{fiadoId} {
      allow read, create, update: if isAuthenticated() && resource.data.almacenId == userAlmacenId();
      allow delete: if isAuthenticated() && userRole() == "dueño" && resource.data.almacenId == userAlmacenId();
    }

    match /mermas/{mermaId} {
      allow read, write: if isAuthenticated() && userRole() == "dueño" && resource.data.almacenId == userAlmacenId();
      allow create: if isAuthenticated() && userRole() == "dueño" && request.resource.data.almacenId == userAlmacenId();
    }

    match /publicUsernames/{username} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
````

## File: fix-stock.cjs
````javascript
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');

let cambiosTotales = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let cambios = 0;

  // 1. Reemplazar accesos tipo objeto.stock (p.stock, prod.stock, product.stock, item.stock, c.stock, etc.)
  // Excluye stockCritico porque no tiene punto antes
  const regexAcceso = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\.stock\b(?!\w)/g;
  content = content.replace(regexAcceso, (match, objName) => {
    cambios++;
    return `${objName}.stockActual`;
  });

  // 2. Reemplazar propiedad stock: en objetos (solo en archivos de services/ y utils/seedData.js)
  // Esto es seguro porque son los únicos lugares donde se crean/actualizan productos
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  if (relPath.startsWith('src/services/') || relPath.includes('seedData')) {
    // Reemplazar stock: → stockActual:  (evita stockCritico: por el word boundary)
    const regexProp = /\bstock\b(\s*:\s*)/g;
    content = content.replace(regexProp, (match, colon) => {
      // Doble check: no reemplazar si la línea contiene stockCritico justo antes
      cambios++;
      return `stockActual${colon}`;
    });
  }

  // 3. Reemplazar stock en template strings y condiciones que quedaron sueltos
  // Casos como ${p.stock} → ${p.stockActual} (ya cubierto por regex 1, pero por si acaso)
  // Casos como p.stock) en condiciones
  const regexExtra = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\.stock\b/g;
  const matches = content.match(regexExtra);
  if (matches) {
    content = content.replace(regexExtra, (match, objName) => {
      cambios++;
      return `${objName}.stockActual`;
    });
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    cambiosTotales += cambios;
    console.log(`✅ ${relPath} — ${cambios} cambios`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) {
    console.log('❌ No se encontró la carpeta src/. Asegúrate de correr este script desde la raíz del proyecto.');
    process.exit(1);
  }
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (/\.(js|jsx)$/.test(file)) {
      processFile(fullPath);
    }
  }
}

console.log('🔧 Corrigiendo stock → stockActual en todo el proyecto...\n');
walk(SRC_DIR);
console.log(`\n🎉 Listo! Total de cambios: ${cambiosTotales}`);
console.log('Ahora solo falta: Guardar en VS Code (Ctrl+K, Ctrl+S) y probar.');
````

## File: index.html
````html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#2563eb" />
    <meta name="description" content="Sistema de punto de venta" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon-192x192.png" />
    <title>Negocio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
````

## File: INICIAR_SIMPLE.cmd
````batch
@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)
echo Iniciando servidor...
npm run dev
pause
````

## File: INICIAR.bat
````batch
@echo off
setlocal EnableDelayedExpansion
chcp 1252 >nul
title POS Almacen Barrio - Iniciando...
color 0A
cls

echo ==========================================
echo    POS ALMACEN BARRIO
echo ==========================================
echo.

cd /d "%~dp0"
echo [1/4] Carpeta: %cd%
echo.

if not exist "package.json" (
    echo [ERROR] No se encontro package.json
    echo.
    pause
    exit /b 1
)

echo [2/4] package.json OK
echo.

if not exist "node_modules" (
    echo [3/4] node_modules NO encontrado. Instalando...
    echo Esto puede tardar 1-3 minutos...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] Fallo npm install
        echo.
        pause
        exit /b 1
    )
    echo [3/4] node_modules instalado OK
) else (
    echo [3/4] node_modules OK
)
echo.

echo [4/4] Iniciando servidor Vite...
echo.
echo ------------------------------------------
echo Si todo va bien, veras "ready in X ms"
echo y la app se abrira en el navegador.
echo ------------------------------------------
echo.
echo Si hay un error, aparecera abajo:
echo.

npm run dev

set EXITCODE=%errorlevel%
echo.
echo ==========================================
if %EXITCODE% equ 0 (
    echo Servidor detenido normalmente.
) else (
    echo [ERROR] El servidor termino con codigo %EXITCODE%
    echo.
    echo Posibles causas:
    echo - Error en algun archivo .jsx o .js
    echo - Falta algun archivo del proyecto
    echo - Puerto 5173 ocupado por otra app
)
echo ==========================================
echo.
echo NO CIERRES esta ventana si necesitas ayuda.
echo Tomale una foto al error de arriba.
echo.
pause
````

## File: INSTRUCCIONES_v5.md
````markdown
# INSTRUCCIONES DE INSTALACION - POS Almacen de Barrio v5.0

## Archivos incluidos

| Archivo | Donde va | Reemplaza a |
|---------|----------|-------------|
| firestoreConfig.js | src/services/ | Archivo nuevo |
| types_index.js | src/types/index.js | El types/index.js anterior |
| Mermas.jsx | src/components/ | El Mermas.jsx anterior |
| Offers.jsx | src/components/ | El Offers.jsx anterior |
| Dashboard.jsx | src/pages/ | El Dashboard.jsx anterior |

## Pasos para instalar

### 1. Copiar archivos
- `firestoreConfig.js` → `src/services/firestoreConfig.js` (nuevo archivo)
- `types_index.js` → `src/types/index.js` (reemplazar)
- `Mermas.jsx` → `src/components/Mermas.jsx` (reemplazar)
- `Offers.jsx` → `src/components/Offers.jsx` (reemplazar)
- `Dashboard.jsx` → `src/pages/Dashboard.jsx` (reemplazar)

### 2. Eliminar archivos de datos de prueba (tienda limpia)
Si existen estos archivos, eliminarlos:
- `src/components/DevSeedButton.jsx`
- `src/utils/seedData.js`

### 3. Borrar datos de prueba de Firebase (opcional pero recomendado)
Para empezar limpio:
1. Ve a Firebase Console → Firestore Database
2. Borra las colecciones: productos, ventas, fiados, mermas, turnos
3. Deja solo: users, almacenes, publicUsernames

### 4. Guardar y probar
1. En VS Code: Ctrl + K, luego Ctrl + S (guardar todo)
2. npm run dev
3. Probar cada pestaña

### 5. Commit en GitHub
1. Abrir GitHub Desktop
2. Summary: "v5.0: Criterios configurables Mermas/Ofertas + tienda limpia"
3. Commit to main → Push origin

## Nuevas funcionalidades

### Mermas - Criterios configurables
- Boton "Criterios" arriba a la derecha
- El dueño marca con checkboxes que criterios quiere usar
- Al registrar merma, solo aparecen productos que califiquen:
  - "Vencido" → productos perecederos con lotes ya vencidos
  - Los demas criterios → todos los productos (el dueño elige)
- Los criterios se guardan en Firestore

### Ofertas - Criterios configurables
- Boton "Criterios" arriba a la derecha
- El dueño marca con checkboxes que criterios quiere usar
- "Por vencer" tiene campo para configurar los dias (default 7)
- Al crear oferta, solo aparecen productos que califiquen:
  - "Por vencer" → productos perecederos con lotes que vencen en los proximos X dias
  - Los demas criterios → todos los productos

### Diferenciacion automatica
- Producto YA vencido → va a Merma
- Producto POR vencer (proximos X dias) → va a Oferta
- Producto danado/roto → Merma
- Producto embalaje danado → Oferta
````

## File: INSTRUCCIONES.txt
````
POS ALMACEN BARRIO - Instrucciones de uso
==========================================

OPCION 1: Modo Desarrollo (recomendado para probar)
----------------------------------------------------
Haz doble clic en: INICIAR.bat

Esto abre automaticamente el servidor y la app en:
http://localhost:5173/

Ventaja: Los cambios que hagas en el codigo se ven al instante
Desventaja: Necesitas tener la ventana abierta


OPCION 2: Modo Produccion (mas rapido)
---------------------------------------
Haz doble clic en: COMPILAR_Y_VER.bat

Esto:
1. Compila la app en archivos estaticos optimizados
2. Abre un servidor ligero
3. Abre automaticamente tu navegador

Ventaja: Mas rapido
Desventaja: Si modificas el codigo, debes volver a compilar


DIAGNOSTICO
-----------
Si algo no funciona, haz doble clic en: DIAGNOSTICO.bat
Te dira exactamente que falta (Node.js, archivos, etc.)


DATOS DE ACCESO (modo demo)
---------------------------
Usuario: admin@demo.cl
Contrasena: 123456
Rol: Administrador


NOTA
----
Si Windows muestra "Windows protegio tu PC":
Haz clic en "Mas informacion" y luego "Ejecutar de todos modos"

IMPORTANTE: Firebase
--------------------
1. Sube el archivo firestore.rules a tu consola de Firebase
   (Firestore Database -> Reglas)
2. Sube el archivo firestore.indexes.json si es necesario
3. Los iconos PNG para PWA ya estan incluidos en public/
````

## File: package.json
````json
{
  "name": "pos-almacen-barrio",
  "private": true,
  "version": "3.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@zxing/browser": "^0.2.1",
    "@zxing/library": "^0.23.0",
    "date-fns": "^3.6.0",
    "firebase": "^10.12.0",
    "html5-qrcode": "^2.3.8",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "lucide-react": "^0.400.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.0",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.1",
    "vite-plugin-pwa": "^0.20.0"
  }
}
````

## File: postcss.config.js
````javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
````

## File: README_BRAND_APK.md
````markdown
# BRAND + APK - Cambios para el Negocio

## Archivos incluidos

| Archivo | Ruta en tu proyecto | Cambio |
|---------|---------------------|--------|
| Navbar.jsx | src/components/Navbar.jsx | Muestra nombre del negocio desde configuración |
| Login.jsx | src/pages/Login.jsx | Muestra nombre del negocio guardado en localStorage |
| Register.jsx | src/pages/Register.jsx | Guarda nombre del negocio en localStorage al registrar |
| ConfiguracionAlmacen.jsx | src/pages/ConfiguracionAlmacen.jsx | Guarda nombre en localStorage al configurar |
| App.jsx | src/App.jsx | Cambia document.title dinámicamente |
| manifest.json | public/manifest.json | Nombre genérico "Negocio" |
| index.html | index.html | Título genérico "Negocio" |
| CAPACITOR_APK.md | (raíz) | Guía completa para crear APK |
| CREAR_APK.bat | (raíz) | Script automático para Windows |

## Instalación

1. Copia cada archivo a su ruta correspondiente, reemplazando el anterior
2. En VS Code: Ctrl+K, luego Ctrl+S
3. `npm run build` + `npx serve dist -l 4173` para probar

## Cómo funciona el nombre del negocio

1. El dueño va a **Configuración** y escribe el nombre de su negocio
2. Al guardar, se guarda en Firestore Y en `localStorage` del navegador
3. La próxima vez que abra la app (incluso en login), aparece el nombre
4. El Navbar muestra el nombre en vivo desde Firestore
5. La pestaña del navegador cambia al nombre del negocio

## Para crear la APK

Lee `CAPACITOR_APK.md` para la guía completa. Resumen:

**Opción A (Recomendada - 0 minutos):**
- El dueño abre la URL en Chrome del celular
- Menú → "Agregar a pantalla de inicio"
- Funciona como app nativa, offline incluido

**Opción B (APK real):**
1. Instala Android Studio
2. Corre `CREAR_APK.bat` (doble clic)
3. En Android Studio: Build → Build APK
4. Pasa el archivo `app-debug.apk` al celular del dueño

## Nota sobre el manifest.json

El `manifest.json` es estático (no puede cambiar sin compilar). Si quieres que el icono del celular diga exactamente el nombre del negocio en la Opción B (APK), edita `capacitor.config.json` después de correr `CREAR_APK.bat`:

```json
{
  "appName": "Nombre Del Negocio"
}
```

Luego `npx cap sync` y vuelve a generar el APK.
````

## File: README_FIX.md
````markdown
# FIX OFFLINE v5.2 + Cache de Productos

## Archivos incluidos

| Archivo | Ruta en tu proyecto | Cambio |
|---------|---------------------|--------|
| firebase.js | src/firebase/firebase.js | Firestore cache persistente moderna |
| useAuth.jsx | src/hooks/useAuth.jsx | Login offline con sesión cacheada |
| useOffline.js | src/hooks/useOffline.js | Sync automático con mapeo de IDs de turno |
| POS.jsx | src/components/POS.jsx | Turno offline, ventas offline, cache de productos |
| App.jsx | src/App.jsx | isAuthenticated por userData |
| firestoreProducts.js | src/services/firestoreProducts.js | **NUEVO: Cache localStorage + fallback offline** |

## Pasos para instalar

1. Cierra el servidor de desarrollo (Ctrl+C en la ventana de Vite)
2. Copia cada archivo a su ruta correspondiente, reemplazando el anterior
3. En VS Code: Ctrl+K, luego Ctrl+S (Guardar Todo)
4. Compila para producción y prueba offline:
   ```
   npm run build
   npx serve dist -l 4173
   ```
5. Abre http://localhost:4173

## Qué se arregló (Pendiente #1)

- **Productos vacíos al recargar offline**: Ahora se guardan en localStorage al cargar online. Si recargas sin internet, lee del cache local.
- **Stock persistente offline**: Al vender offline, el descuento de stock se aplica a los productos en memoria y se recalcula al cargar, leyendo la cola de operaciones pendientes.
- **Escáner offline**: Si escaneas sin internet, busca en el cache local de productos.
- **Sync de turnos**: Al reconectar, los turnos offline se crean en Firestore con ID real, y las ventas/fiados se actualizan con ese ID.

## Cómo probar

1. Con internet: entra a la app, abre turno, vende 2 productos
2. Verifica en DevTools → Application → Local Storage → `pos_products_cache_XXX` existe
3. Pon DevTools → Network → Offline
4. Recarga la página (F5)
5. **Esperado**: Los productos aparecen, el turno sigue activo, el stock refleja las ventas offline

## Notas

- No uses `npm run dev` para probar offline. Vite en modo dev NO sirve archivos sin internet.
- Usa siempre `npm run build` + `npx serve dist -l 4173` (o el script COMPILAR_Y_VER.bat)
````

## File: README.md
````markdown
# FIX: Escáner no detecta códigos de barras EAN/UPC en iPhone

## Problema
La foto del código de barras se procesa pero no detecta nada. El código EAN-13 (7804682632213) es perfectamente legible.

## Causa
`html5-qrcode` por defecto solo escanea **QR codes**. Los códigos de barras lineales (EAN-13, UPC, CODE_128) necesitan habilitarse explícitamente mediante `Html5QrcodeSupportedFormats`.

## Solución
Se importan y configuran todos los formatos de código de barras soportados:
- EAN_13, EAN_8
- UPC_A, UPC_E
- CODE_128, CODE_39, CODE_93
- ITF
- QR_CODE

Tanto en modo cámara en vivo como en modo foto, se pasan los formatos en la configuración.

## Instalación
1. Copia `BarcodeScanner.jsx` a `src/components/BarcodeScanner.jsx`
2. En VS Code: Ctrl+K, Ctrl+S
3. `npm run build`
4. `npx serve dist -l 4173`

## Cómo probar
1. Toma foto al código de barras del producto
2. El sistema ahora debería detectar el EAN-13 automáticamente
````

## File: tailwind.config.js
````javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
````

## File: vite.config.js
````javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB en vez de 2 MB
      },
      manifest: {
        name: "Negocio",
        short_name: "Negocio",
        description: "Sistema de punto de venta",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  server: {
    host: true,
    allowedHosts: true,
  },
});
````

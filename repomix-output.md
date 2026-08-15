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
    BetaCodesAdmin.jsx
    CanjearCodigo.jsx
    Fiados.jsx
    InventoryAlert.jsx
    Mermas.jsx
    Navbar.jsx
    Offers.jsx
    PlanBadge.jsx
    PlanUpgrade.jsx
    POS.jsx
    ProductManager.jsx
    Reports.jsx
    TrialBanner.jsx
  firebase/
    config.js
    firebase.js
  hooks/
    useAuth.jsx
    useOffline.js
    useTurno.js
  pages/
    AdminVendedores.jsx
    BetaRegister.jsx
    ConfiguracionAlmacen.jsx
    Dashboard.jsx
    LandingPage.jsx
    Login.jsx
    PaymentPortal.jsx
    Register.jsx
    RegisterVendedor.jsx
  services/
    betaAuth.js
    firestoreConfig.js
    firestoreFiados.js
    firestoreMermas.js
    firestoreProducts.js
    firestoreSales.js
    firestoreUsers.js
    paymentService.js
    planLimits.js
    printerService.js
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
import { useState, useRef, useCallback, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { X, Camera, Scan, AlertTriangle, Keyboard } from "lucide-react";

const createZXingReader = () => {
  const hints = new Map();
  const formats = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.ITF,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
  ];
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  hints.set(DecodeHintType.TRY_HARDER, true);
  const reader = new BrowserMultiFormatReader(hints);
  return reader;
};

export default function BarcodeScanner({ onScan, onClose, products = [] }) {
  const [activeTab, setActiveTab] = useState("camera");
  const [error, setError] = useState("");
  const [scannerReady, setScannerReady] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const pauseRef = useRef(false);
  const isProcessingRef = useRef(false);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const stopLiveScanner = useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch {
        /* noop */
      }
      controlsRef.current = null;
    }
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    setScannerReady(false);
  }, []);

  const handleCodeFound = useCallback(
    (code) => {
      stopLiveScanner();
      onScanRef.current(code);
      onCloseRef.current();
    },
    [stopLiveScanner]
  );

  const startLiveScanner = useCallback(async () => {
    setError("");
    try {
      const reader = createZXingReader();
      const controls = await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: "environment" } },
        videoRef.current,
        (result) => {
          if (result && !pauseRef.current && !isProcessingRef.current) {
            pauseRef.current = true;
            isProcessingRef.current = true;
            handleCodeFound(result.getText());
          }
        }
      );
      controlsRef.current = controls;
      setScannerReady(true);
    } catch (err) {
      console.error("[SCANNER] Error:", err);
      setError("No se pudo iniciar la cámara. Intenta recargar la página.");
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
    setError("");
    if (tab === "camera") {
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
          <button
            onClick={() => {
              stopLiveScanner();
              onClose();
            }}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => handleTabChange("camera")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "camera"
                ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Camera className="w-4 h-4" />
            Cámara en vivo
          </button>
          <button
            onClick={() => handleTabChange("manual")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "manual"
                ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800"
                : "text-gray-400 hover:text-gray-200"
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
          {activeTab === "camera" && (
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

          {activeTab === "manual" && (
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
          <p className="text-gray-500 text-xs">Carrito · {products.length} items</p>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/BetaCodesAdmin.jsx
````javascript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// ═══════════════════════════════════════════════════════════════
// WHITELIST DE ADMIN: Solo estos UIDs pueden crear códigos beta
// Para obtener tu UID: Abre la app logueado → F12 → Console →
// console.log(JSON.parse(localStorage.getItem("pos_offline_session")).uid)
// ═══════════════════════════════════════════════════════════════
const ADMIN_UIDS = [
  // "PEGA-TU-UID-AQUI", // ← Descomenta y pega tu UID real
];

function generarCodigo(longitud = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

export default function BetaCodesAdmin() {
  const { user } = useAuth();
  const [codigos, setCodigos] = useState([]);
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [dias, setDias] = useState(30);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  useEffect(() => {
    if (isAdmin) cargarCodigos();
  }, [isAdmin]);

  async function cargarCodigos() {
    try {
      const q = query(collection(db, "codigosBeta"), orderBy("creadoEn", "desc"));
      const snap = await getDocs(q);
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCodigos(lista);
    } catch (err) {
      setError("Error al cargar códigos: " + err.message);
    }
  }

  async function crearCodigo(e) {
    e.preventDefault();
    if (!isAdmin) {
      setError("No tienes permisos para crear códigos beta.");
      return;
    }
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const codigosCreados = [];
      for (let i = 0; i < cantidad; i++) {
        const codigo = nuevoCodigo.trim() || generarCodigo();
        const expiresAt = Date.now() + dias * 24 * 60 * 60 * 1000;
        await addDoc(collection(db, "codigosBeta"), {
          codigo: codigo.toUpperCase(),
          dias,
          usado: false,
          expiresAt,
          creadoEn: serverTimestamp(),
          creadoPor: user.uid,
        });
        codigosCreados.push(codigo.toUpperCase());
      }
      setMensaje(`✅ ${codigosCreados.length} código(s) creado(s): ${codigosCreados.join(", ")}`);
      setNuevoCodigo("");
      cargarCodigos();
    } catch (err) {
      setError("Error al crear código: " + err.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarCodigo(id) {
    if (!window.confirm("¿Eliminar este código?")) return;
    try {
      await deleteDoc(doc(db, "codigosBeta", id));
      cargarCodigos();
      setMensaje("🗑️ Código eliminado");
    } catch (err) {
      setError("Error al eliminar: " + err.message);
    }
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🚫</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Acceso Restringido</h2>
          <p className="text-red-600">Este panel es exclusivo para administradores de Loventa.</p>
          <p className="text-sm text-red-500 mt-2">
            Tu UID: <code className="bg-red-100 px-2 py-1 rounded">{user?.uid || "No logueado"}</code>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Si eres el creador, agrega tu UID a ADMIN_UIDS en BetaCodesAdmin.jsx
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">🔑 Panel Admin — Códigos Beta</h1>

      {mensaje && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{mensaje}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Crear nuevo código</h2>
        <form onSubmit={crearCodigo} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="codigo-input" className="block text-sm font-medium text-gray-700 mb-1">Código (opcional)</label>
            <input id="codigo-input" name="codigo" type="text" value={nuevoCodigo}
              onChange={(e) => setNuevoCodigo(e.target.value.toUpperCase())}
              placeholder="Auto-generado" maxLength={12}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="dias-input" className="block text-sm font-medium text-gray-700 mb-1">Días Pro</label>
            <input id="dias-input" name="dias" type="number" min={1} max={365} value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="cantidad-input" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input id="cantidad-input" name="cantidad" type="number" min={1} max={50} value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button type="submit" disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              {cargando ? "Creando..." : "➕ Crear Código(s)"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Códigos existentes ({codigos.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Código</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Días</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Usado por</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Expira</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {codigos.map((c) => (
                <tr key={c.id} className={c.usado ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3 font-mono font-semibold">{c.codigo}</td>
                  <td className="px-4 py-3">{c.dias}</td>
                  <td className="px-4 py-3">
                    {c.usado ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">✅ Usado</span>
                    ) : c.expiresAt && Date.now() > c.expiresAt ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">⏰ Expirado</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">🟢 Activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.usadoPor ? c.usadoPor.slice(0, 8) + "..." : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("es-CL") : "Sin expiración"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => eliminarCodigo(c.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
              {codigos.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay códigos beta creados aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/CanjearCodigo.jsx
````javascript
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { validarCodigoBeta, usarCodigoBeta, activarProGratis } from "../services/paymentService";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function CanjearCodigo() {
  const { user, refreshUser } = useAuth();
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function handleCanjear(e) {
    e.preventDefault();
    if (!codigo.trim()) {
      setError("Ingresa un código beta.");
      return;
    }
    if (!user?.uid) {
      setError("Debes iniciar sesión para canjear un código.");
      return;
    }

    setCargando(true);
    setError("");
    setMensaje("");
    setExito(false);

    try {
      // 1. Validar código
      const validacion = await validarCodigoBeta(codigo);
      if (!validacion.valido) {
        setError(validacion.mensaje);
        setCargando(false);
        return;
      }

      // 2. Activar Pro Gratis en el usuario
      const dias = validacion.data.dias || 30;
      await activarProGratis(user.uid, dias);

      // 3. Marcar código como usado
      await usarCodigoBeta(codigo, user.uid);

      // 4. Actualizar metadata del usuario
      await updateDoc(doc(db, "usuarios", user.uid), {
        codigoBetaUsado: codigo.toUpperCase().trim(),
        planActivadoEn: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 5. Refrescar datos de usuario en el contexto
      await refreshUser();

      setExito(true);
      setMensaje(`🎉 ¡Plan Pro activado por ${dias} días! Disfruta de todas las funciones.`);
      setCodigo("");
    } catch (err) {
      setError("Error al canjear: " + err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-xl font-bold text-gray-800">Canjear Código Beta</h2>
          <p className="text-gray-500 text-sm mt-1">Activa tu plan Pro gratis</p>
        </div>

        {exito && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {!exito && (
          <form onSubmit={handleCanjear} className="space-y-4">
            <div>
              <label htmlFor="codigo-beta" className="block text-sm font-medium text-gray-700 mb-1">
                Código Beta
              </label>
              <input
                id="codigo-beta"
                name="codigoBeta"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: ABC12345"
                maxLength={12}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-center font-mono text-lg tracking-widest uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? "Verificando..." : "🎁 Canjear Código"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-xs text-gray-400">
          Los códigos beta son de un solo uso y tienen fecha de expiración.
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
  const { almacenId, isDueño, user, userData } = useAuth();
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
        fiadoId: fiadoPago.id, vendedorId: user.uid, vendedorNombre: userData?.nombre || user.email,
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
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDueño, logout } = useAuth();

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-bold text-lg text-blue-600"
          >
            🏪 Almacén de Barrio
          </button>

          {/* Links principales */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => navigate("/vender")} className={linkClass("/vender")}>
              🛒 Vender
            </button>
            <button onClick={() => navigate("/productos")} className={linkClass("/productos")}>
              📦 Productos
            </button>
            <button onClick={() => navigate("/fiados")} className={linkClass("/fiados")}>
              📝 Fiados
            </button>
            <button onClick={() => navigate("/ofertas")} className={linkClass("/ofertas")}>
              🏷️ Ofertas
            </button>
            <button onClick={() => navigate("/mermas")} className={linkClass("/mermas")}>
              🗑️ Mermas
            </button>
            <button onClick={() => navigate("/informes")} className={linkClass("/informes")}>
              📊 Informes
            </button>

            {/* 🔑 Botón Códigos Beta — solo para dueños */}
            {isDueño && (
              <button
                onClick={() => navigate("/admin-beta")}
                className={linkClass("/admin-beta")}
              >
                🔑 Códigos Beta
              </button>
            )}

            {isDueño && (
              <button onClick={() => navigate("/vendedores")} className={linkClass("/vendedores")}>
                👥 Vendedores
              </button>
            )}
            {isDueño && (
              <button onClick={() => navigate("/configuracion")} className={linkClass("/configuracion")}>
                ⚙️ Config
              </button>
            )}
          </div>

          {/* Usuario + Logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.nombre || user?.email || "Invitado"}
              {isDueño && <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Dueño</span>}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
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
  const [form, setForm] = useState({ productoId: "", precioOferta: "", razon: "", cantidadOferta: "" });

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
    let cantidadOferta = null;
    if (form.cantidadOferta !== "") {
      cantidadOferta = Number(form.cantidadOferta);
      if (isNaN(cantidadOferta) || cantidadOferta <= 0 || !Number.isInteger(cantidadOferta)) {
        alert("La cantidad en oferta debe ser un número entero mayor a 0");
        return;
      }
      if (cantidadOferta > producto.stock) {
        alert(`Solo hay ${producto.stock} unidades en stock, no puedes ofertar ${cantidadOferta}`);
        return;
      }
    }

    try {
      await productsService.updateProduct(producto.id, {
        enOferta: true,
        precioOferta,
        razonOferta: form.razon || null,
        cantidadOferta,
        cantidadOfertaVendida: 0,
      });
      await cargarProductos();
      setMostrarForm(false);
      setForm({ productoId: "", precioOferta: "", razon: "", cantidadOferta: "" });
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
        cantidadOferta: null,
        cantidadOfertaVendida: null,
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
          <div className="grid md:grid-cols-4 gap-4">
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
                    {p.nombre} - {formatCurrency(p.precioVenta)} (stock: {p.stock})
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad en oferta <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="number"
                value={form.cantidadOferta}
                onChange={(e) => setForm({ ...form, cantidadOferta: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Todo el stock"
                min="1"
              />
              <p className="text-xs text-gray-400 mt-1">Vacío = todo el stock queda en oferta</p>
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
              {p.cantidadOferta != null && p.cantidadOferta > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Cupo oferta: {Math.max(0, p.cantidadOferta - (p.cantidadOfertaVendida || 0))} de {p.cantidadOferta} unidades restantes
                  {" "}(el resto se vende a precio normal)
                </p>
              )}
              {(p.cantidadOferta == null || p.cantidadOferta === 0) && (
                <p className="text-xs text-gray-400 mt-1">Aplica a todo el stock ({p.stock} unidades)</p>
              )}
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

## File: src/components/PlanUpgrade.jsx
````javascript
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { 
  PRECIOS, formatMoney, calcularCompensacion, activarPlan 
} from "../services/paymentService";
import { 
  X, Crown, Zap, ArrowRight, Check, Loader2, Calculator 
} from "lucide-react";

export default function PlanUpgrade({ onClose }) {
  const { user, userData } = useAuth();
  const [planDestino, setPlanDestino] = useState("pro");
  const [periodoDestino, setPeriodoDestino] = useState("mensual");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  const planActual = userData?.plan || "basico";
  const periodoActual = userData?.planPeriodo || "mensual";
  const fechaInicioActual = userData?.planStartedAt || new Date().toISOString();

  // Calcular compensación
  const compensacion = calcularCompensacion(
    planActual, periodoActual, planDestino, periodoDestino, fechaInicioActual
  );

  async function handleUpgrade() {
    if (!user || !userData?.almacenId) return;
    setLoading(true);
    setError("");

    try {
      // Simulación de pago de la compensación
      await new Promise(r => setTimeout(r, 1500));

      await activarPlan(user.uid, userData.almacenId, planDestino, periodoDestino, {
        monto: compensacion.monto,
        metodo: "simulado_upgrade",
        transactionId: `upg_${Date.now()}`,
      });

      setExito(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al procesar el upgrade.");
    } finally {
      setLoading(false);
    }
  }

  if (exito) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <Check className="w-14 h-14 text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">¡Upgrade exitoso!</h3>
          <p className="text-gray-600">
            Ahora tienes el plan <strong>{PRECIOS[planDestino].label}</strong>.
          </p>
          <p className="text-sm text-gray-400 mt-3">Actualizando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Upgrade de Plan
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan actual */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Plan actual</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{PRECIOS[planActual]?.label || planActual}</p>
                <p className="text-sm text-gray-500">
                  {periodoActual === "anual" ? "Pago anual" : "Pago mensual"} • 
                  Desde {new Date(fechaInicioActual).toLocaleDateString("es-CL")}
                </p>
              </div>
              <span className="text-lg font-bold text-gray-800">
                {formatMoney(PRECIOS[planActual]?.[periodoActual] || 0)}
              </span>
            </div>
          </div>

          {/* Flecha */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Plan destino */}
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-3">Nuevo plan</p>

            {/* Selector de plan */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setPlanDestino("pro")}
                className={`p-3 rounded-xl border-2 text-left transition ${
                  planDestino === "pro" 
                    ? "border-purple-500 bg-purple-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Crown className="w-5 h-5 text-purple-600 mb-1" />
                <p className="font-bold text-sm">Plan Pro</p>
                <p className="text-xs text-gray-500">Todo ilimitado</p>
              </button>
            </div>

            {/* Selector de periodo */}
            <div className="bg-gray-100 rounded-lg p-1 inline-flex w-full">
              <button
                onClick={() => setPeriodoDestino("mensual")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  periodoDestino === "mensual" 
                    ? "bg-white text-gray-800 shadow-sm" 
                    : "text-gray-500"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setPeriodoDestino("anual")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                  periodoDestino === "anual" 
                    ? "bg-white text-gray-800 shadow-sm" 
                    : "text-gray-500"
                }`}
              >
                Anual
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </div>

          {/* Cálculo de compensación */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-bold text-blue-800">Cálculo de compensación</p>
            </div>
            <p className="text-sm text-blue-700 mb-3">{compensacion.mensaje}</p>

            {compensacion.prorrateo && compensacion.detalle && (
              <div className="text-xs text-blue-600 space-y-1">
                <div className="flex justify-between">
                  <span>Precio nuevo ({PRECIOS[planDestino].label} {periodoDestino})</span>
                  <span>{formatMoney(compensacion.detalle.precioNuevo)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor restante de tu plan actual</span>
                  <span className="text-green-700">-{formatMoney(compensacion.detalle.valorRestante)}</span>
                </div>
                <div className="border-t border-blue-200 pt-1 flex justify-between font-bold">
                  <span>Total a pagar ahora</span>
                  <span>{formatMoney(compensacion.monto)}</span>
                </div>
              </div>
            )}

            {!compensacion.prorrateo && (
              <div className="text-xs text-blue-600 space-y-1">
                <div className="flex justify-between">
                  <span>{PRECIOS[planDestino].label} {periodoDestino}</span>
                  <span>{formatMoney(PRECIOS[planDestino][periodoDestino])}</span>
                </div>
                <div className="flex justify-between">
                  <span>{PRECIOS[planActual].label} {periodoActual} (actual)</span>
                  <span className="text-green-700">-{formatMoney(PRECIOS[planActual][periodoActual])}</span>
                </div>
                <div className="border-t border-blue-200 pt-1 flex justify-between font-bold">
                  <span>Diferencia a pagar</span>
                  <span>{formatMoney(compensacion.monto)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Detalle del nuevo plan */}
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Incluye Plan Pro</p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Productos ilimitados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Vendedores ilimitados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Reportes avanzados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Multi-sucursal</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Ofertas y promociones</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading || compensacion.monto === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
            ) : (
              <><Zap size={18} /> {compensacion.monto > 0 
                ? `Pagar ${formatMoney(compensacion.monto)} y upgradear` 
                : "Activar upgrade gratuito"}
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            El upgrade es inmediato. Se prorratea el tiempo restante de tu plan actual.
          </p>
        </div>
      </div>
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
import { imprimirTicket, getPrinterConfig } from "../services/printerService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  Search, ScanLine, Trash2, Plus, Minus, ShoppingCart,
  Package, Clock, DollarSign, CreditCard, Smartphone, User,
  X, Check, Printer, Scale, Loader2, WifiOff, CheckCircle2
} from "lucide-react";

const METODO_STYLES = {
  efectivo: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700" },
  tarjeta: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
  transferencia: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
  fiado: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" },
};

function calcularLineaCarrito(item) {
  const cantidad = item.cantidad;
  if (!item.enOferta) {
    return { totalLinea: item.precioVenta * cantidad, unidadesOferta: 0, unidadesNormal: cantidad };
  }
  const tieneLimite = item.cantidadOferta != null && item.cantidadOferta > 0;
  if (!tieneLimite) {
    return { totalLinea: item.precioOferta * cantidad, unidadesOferta: cantidad, unidadesNormal: 0 };
  }
  const disponibleOferta = Math.max(0, (item.cantidadOferta || 0) - (item.cantidadOfertaVendida || 0));
  const unidadesOferta = Math.min(cantidad, disponibleOferta);
  const unidadesNormal = cantidad - unidadesOferta;
  const totalLinea = unidadesOferta * item.precioOferta + unidadesNormal * item.precioVenta;
  return { totalLinea, unidadesOferta, unidadesNormal };
}

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

  const [aplicarDescuento, setAplicarDescuento] = useState(false);
  const [montoACobrar, setMontoACobrar] = useState("");
  const [ultimaVenta, setUltimaVenta] = useState(null);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [almacenNombre, setAlmacenNombre] = useState("");

  // 🔥 FIX: Estado de carga para cierre de turno (evita que se quede pegado)
  const [closingTurno, setClosingTurno] = useState(false);

  useEffect(() => {
    if (!almacenId) return;
    getDoc(doc(db, "almacenes", almacenId)).then((snap) => {
      if (snap.exists()) setAlmacenNombre(snap.data().nombre || "");
    }).catch(() => {});
  }, [almacenId]);

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

  const totalSinDescuento = carrito.reduce((sum, c) => sum + calcularLineaCarrito(c).totalLinea, 0);
  const montoACobrarNum = Number(montoACobrar);
  const descuentoValido = aplicarDescuento && montoACobrar !== "" && !isNaN(montoACobrarNum) && montoACobrarNum >= 0 && montoACobrarNum < totalSinDescuento;
  const montoDescuento = descuentoValido ? totalSinDescuento - montoACobrarNum : 0;
  const total = descuentoValido ? montoACobrarNum : totalSinDescuento;

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

  // 🔥 FIX: handleCerrarTurno con try-catch + loading state
  async function handleCerrarTurno() {
    if (!turno) return;
    setClosingTurno(true);
    try {
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
    } catch (err) {
      console.error("Error al cargar resumen del turno:", err);
      alert("Error al cargar resumen: " + (err.message || "Verifica tu conexión e intenta de nuevo."));
    } finally {
      setClosingTurno(false);
    }
  }

  // 🔥 FIX: confirmarCerrarTurno con try-catch + loading state
  async function confirmarCerrarTurno() {
    if (!turno || !resumenCierre) return;
    setClosingTurno(true);
    try {
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
      mostrarMensaje("Turno cerrado correctamente");
    } catch (err) {
      console.error("Error al cerrar turno:", err);
      alert("Error al cerrar el turno: " + (err.message || "Verifica tu conexión. Si persiste, recarga la página."));
      // 🔥 FIX: No dejar el modal abierto infinitamente
      setMostrarCerrarTurno(false);
      setResumenCierre(null);
    } finally {
      setClosingTurno(false);
    }
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

      const itemsParaDescontar = carrito.map((c) => ({ id: c.id, cantidad: c.cantidad }));

      if (isOnline) {
        try {
          await productsService.discountStockBatch(itemsParaDescontar);
        } catch (err) {
          alert("Error al descontar stock: " + (err.message || "Verifica que haya suficiente stock"));
          setLoading(false);
          return;
        }
      }

      const actualizacionesOferta = [];
      for (const item of carrito) {
        const prod = productos.find(p => p.id === item.id);
        if (!prod) continue;
        prod.stock -= item.cantidad;
        const { unidadesOferta } = calcularLineaCarrito(item);
        if (unidadesOferta > 0 && item.cantidadOferta != null && item.cantidadOferta > 0) {
          const nuevaCantidadVendida = (prod.cantidadOfertaVendida || 0) + unidadesOferta;
          prod.cantidadOfertaVendida = nuevaCantidadVendida;
          actualizacionesOferta.push({ id: prod.id, cantidadOfertaVendida: nuevaCantidadVendida });
        }
      }
      setProductos([...productos]);

      if (isOnline && actualizacionesOferta.length > 0) {
        for (const upd of actualizacionesOferta) {
          try {
            await productsService.updateProduct(upd.id, { cantidadOfertaVendida: upd.cantidadOfertaVendida });
          } catch (err) {
            console.error("No se pudo actualizar el cupo de oferta:", err);
          }
        }
      }

      const venta = {
        productos: carrito.map((c) => {
          const { totalLinea } = calcularLineaCarrito(c);
          return {
            id: c.id,
            nombre: c.nombre,
            cantidad: c.cantidad,
            precioUnitario: c.precioVenta,
            total: totalLinea,
          };
        }),
        total,
        ...(descuentoValido ? { descuento: montoDescuento, totalSinDescuento } : {}),
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
        setUltimaVenta(venta);
      }

      setCarrito([]);
      setAplicarDescuento(false);
      setMontoACobrar("");

      // 🔥 FIX: Forzar recarga de productos desde Firestore después de vender
      // para asegurar que el stock mostrado esté sincronizado
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

  // 🔥 FIX: Mostrar productos con stock > 0 primero, y deshabilitar los agotados
  const productosRapidos = productos
    .filter((p) => !search.trim() || p.nombre?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Priorizar productos con stock disponible
      const stockA = a.stock || 0;
      const stockB = b.stock || 0;
      if (stockA > 0 && stockB <= 0) return -1;
      if (stockA <= 0 && stockB > 0) return 1;
      return 0;
    })
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
              {/* 🔥 FIX: Botón con loading state y disabled */}
              <button
                onClick={confirmarCerrarTurno}
                disabled={closingTurno}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {closingTurno ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {closingTurno ? "Cerrando..." : "Cerrar y Guardar"}
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
            disabled={closingTurno}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {closingTurno ? "Cargando..." : "Cerrar Turno"}
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
              {productosRapidos.map((p) => {
                const sinStock = (p.stock || 0) <= 0;
                const ofertaRestante = p.cantidadOferta != null && p.cantidadOferta > 0
                  ? Math.max(0, p.cantidadOferta - (p.cantidadOfertaVendida || 0))
                  : null;
                return (
                <button
                  key={p.id}
                  onClick={() => !sinStock && agregarAlCarrito(p)}
                  disabled={sinStock}
                  className={`bg-white rounded-xl shadow-sm border p-3 text-left transition active:scale-95 relative overflow-hidden ${
                    sinStock
                      ? "border-gray-200 opacity-60 cursor-not-allowed"
                      : "border-gray-200 hover:shadow-md hover:border-blue-300"
                  }`}
                >
                  {/* 🔥 FIX: Badge de agotado */}
                  {sinStock && (
                    <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center z-10">
                      <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">AGOTADO</span>
                    </div>
                  )}
                  <p className="font-medium text-gray-800 text-sm truncate">{p.nombre}</p>
                  {p.enOferta ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-red-600 font-bold text-sm">{formatCurrency(p.precioOferta)}</p>
                      <p className="text-xs text-gray-400 line-through">{formatCurrency(p.precioVenta)}</p>
                    </div>
                  ) : (
                    <p className="text-blue-600 font-bold text-sm mt-1">
                      {formatCurrency(p.precioVenta)}
                    </p>
                  )}
                  <p className={`text-xs mt-0.5 ${sinStock ? "text-red-500 font-medium" : "text-gray-400"}`}>
                    Stock: {p.stock} {p.unidad}
                  </p>
                  {p.enOferta && (
                    <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded ${
                      ofertaRestante != null && ofertaRestante > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {ofertaRestante != null && ofertaRestante > 0
                        ? `🔥 ${ofertaRestante} u. en oferta`
                        : ofertaRestante === 0
                        ? "Cupo oferta agotado"
                        : "OFERTA"}
                    </span>
                  )}
                </button>
                );
              })}
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
              {carrito.map((item) => {
                const { totalLinea, unidadesOferta, unidadesNormal } = calcularLineaCarrito(item);
                return (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.precioVenta)} / {item.unidad}
                    </p>
                    {unidadesOferta > 0 && unidadesNormal > 0 && (
                      <p className="text-xs text-red-600">
                        {unidadesOferta} en oferta + {unidadesNormal} a precio normal
                      </p>
                    )}
                    {unidadesOferta > 0 && unidadesNormal === 0 && item.cantidadOferta != null && item.cantidadOferta > 0 && (
                      <p className="text-xs text-red-600">Precio oferta aplicado</p>
                    )}
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
                    {formatCurrency(totalLinea)}
                  </p>

                  <button
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                );
              })}
            </div>
          )}

          {carrito.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-4 mb-4">
                {aplicarDescuento ? (
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatCurrency(totalSinDescuento)}</span>
                    </div>
                    {descuentoValido && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Descuento</span>
                        <span>-{formatCurrency(montoDescuento)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total a cobrar</span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span>
                  </div>
                )}

                <div className="mb-4">
                  {!aplicarDescuento ? (
                    <button
                      onClick={() => setAplicarDescuento(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Aplicar descuento
                    </button>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Monto a cobrar (con descuento)</label>
                        <button
                          onClick={() => { setAplicarDescuento(false); setMontoACobrar(""); }}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          Quitar
                        </button>
                      </div>
                      <input
                        type="number"
                        value={montoACobrar}
                        onChange={(e) => setMontoACobrar(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-mono text-center outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Menos de ${formatCurrency(totalSinDescuento)}`}
                        min="0"
                        step="1"
                        autoFocus
                      />
                      {montoACobrar !== "" && !descuentoValido && (
                        <p className="text-xs text-red-500">
                          Ingresa un monto válido, menor al subtotal ({formatCurrency(totalSinDescuento)})
                        </p>
                      )}
                    </div>
                  )}
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

      {ultimaVenta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            <Check className="w-14 h-14 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-gray-800">Venta registrada</h3>
            <p className="text-2xl font-bold text-blue-600 my-2">{formatCurrency(ultimaVenta.total)}</p>
            <p className="text-sm text-gray-500 mb-4">
              {ultimaVenta.metodoPago === "efectivo" ? "Efectivo" : ultimaVenta.metodoPago === "tarjeta" ? "Tarjeta" : "Transferencia"}
            </p>

            {getPrinterConfig().habilitada && (
              <button
                onClick={async () => {
                  setImprimiendo(true);
                  try {
                    await imprimirTicket({
                      almacenNombre,
                      vendedor: ultimaVenta.vendedorNombre,
                      productos: ultimaVenta.productos,
                      total: ultimaVenta.total,
                      descuento: ultimaVenta.descuento,
                      totalSinDescuento: ultimaVenta.totalSinDescuento,
                      metodoPago: ultimaVenta.metodoPago,
                    });
                  } catch (err) {
                    alert(`No se pudo imprimir: ${err.message}`);
                  } finally {
                    setImprimiendo(false);
                  }
                }}
                disabled={imprimiendo}
                className="w-full mb-2 flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
              >
                {imprimiendo ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                {imprimiendo ? "Imprimiendo..." : "Imprimir ticket"}
              </button>
            )}

            <button
              onClick={() => setUltimaVenta(null)}
              className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
````

## File: src/components/ProductManager.jsx
````javascript
<div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.enOferta} onChange={(e) => setForm({ ...form, enOferta: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Producto en oferta</span>
              </label>
            </div>
            {/* 🔥 FIX #12: Mostrar campos de oferta SIEMPRE que enOferta sea true */}
            {form.enOferta && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de oferta</label>
                  <input type="number" value={form.precioOferta} onChange={(e) => setForm({ ...form, precioOferta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad en oferta <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input type="number" value={form.cantidadOferta} onChange={(e) => setForm({ ...form, cantidadOferta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Todo el stock" min="1" />
                  <p className="text-xs text-gray-400 mt-1">
                    Vacío = todo el stock queda en oferta
                    {editando && form.cantidadOfertaVendida > 0 && ` • Vendidas: ${form.cantidadOfertaVendida}`}
                  </p>
                </div>
              </>
            )}
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
  Loader2, Search, ArrowUpDown, Repeat, BookOpen, Crown, Lock, Trophy
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
  const [rankingSortKey, setRankingSortKey] = useState("ingresos");
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

  // ===== RANKING DE PRODUCTOS VENDIDOS =====
  // Cada venta ya guarda el detalle de items (v.productos[]) desde que se creó en POS.jsx;
  // aquí solo se agrega esa información por producto para el período filtrado.
  const rankingProductos = (() => {
    const acumulado = {};
    ventasNormales.forEach((v) => {
      (v.productos || []).forEach((item) => {
        const key = item.id || item.nombre;
        if (!acumulado[key]) {
          acumulado[key] = { id: key, nombre: item.nombre, cantidad: 0, ingresos: 0, ventas: 0 };
        }
        acumulado[key].cantidad += Number(item.cantidad) || 0;
        acumulado[key].ingresos += Number(item.total) || 0;
        acumulado[key].ventas += 1;
      });
    });
    return Object.values(acumulado);
  })();

  const rankingOrdenado = [...rankingProductos].sort((a, b) => b[rankingSortKey] - a[rankingSortKey]);
  const top10Ranking = rankingOrdenado.slice(0, 10).map((p) => ({ name: p.nombre, cantidad: p.cantidad, ingresos: p.ingresos }));
  const totalUnidadesVendidas = rankingProductos.reduce((s, p) => s + p.cantidad, 0);

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

  async function exportarRankingPDF() {
    const almacen = await getAlmacenInfo();
    const doc = new jsPDF();
    const periodoLabel = { hoy: "Hoy", semana: "Última semana", mes: "Último mes", todo: "Todo el historial" }[filtroTiempo];
    doc.setFontSize(16);
    doc.text(`Ranking de Productos - ${almacen.nombre}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Período: ${periodoLabel}`, 14, 28);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CL")}`, 14, 34);
    doc.text(`Unidades vendidas: ${totalUnidadesVendidas}`, 14, 40);

    const body = rankingOrdenado.map((p, i) => [
      i + 1, p.nombre, p.cantidad, formatCurrency(p.ingresos), p.ventas,
    ]);
    autoTable(doc, {
      head: [["#", "Producto", "Unidades vendidas", "Ingresos", "Ventas donde aparece"]],
      body, startY: 48, styles: { fontSize: 9 },
      headStyles: { fillColor: [217, 119, 6] },
    });
    doc.save(`ranking-productos-${filtroTiempo}-${new Date().toISOString().split("T")[0]}.pdf`);
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
          { id: "productos", label: "Ranking Productos", icon: Trophy },
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

      {activeTab === "productos" && (
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
            <button
              onClick={exportarRankingPDF}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition"
            >
              <Download size={16} /> Descargar PDF
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Productos distintos vendidos</p>
              <p className="text-2xl font-bold text-gray-800">{rankingProductos.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Unidades vendidas</p>
              <p className="text-2xl font-bold text-blue-600">{totalUnidadesVendidas}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Producto más vendido</p>
              <p className="text-lg font-bold text-amber-600 truncate">
                {rankingOrdenado[0]?.nombre || "—"}
              </p>
            </div>
          </div>

          {top10Ranking.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Top 10 productos</h3>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                  <button onClick={() => setRankingSortKey("ingresos")}
                    className={`px-2 py-1 rounded ${rankingSortKey === "ingresos" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}>
                    Por ingresos
                  </button>
                  <button onClick={() => setRankingSortKey("cantidad")}
                    className={`px-2 py-1 rounded ${rankingSortKey === "cantidad" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}>
                    Por unidades
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={top10Ranking} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => rankingSortKey === "ingresos" ? `$${v.toLocaleString("es-CL")}` : v} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => rankingSortKey === "ingresos" ? formatCurrency(v) : `${v} unidades`} />
                  <Bar dataKey={rankingSortKey} fill="#d97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Producto</th>
                  <th className="text-right px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => setRankingSortKey("cantidad")}>
                    Unidades vendidas <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="text-right px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => setRankingSortKey("ingresos")}>
                    Ingresos <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="text-right px-4 py-3">Ventas donde aparece</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rankingOrdenado.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{p.nombre}</td>
                    <td className="px-4 py-2 text-right">{p.cantidad}</td>
                    <td className="px-4 py-2 text-right font-medium text-amber-700">{formatCurrency(p.ingresos)}</td>
                    <td className="px-4 py-2 text-right text-gray-500">{p.ventas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rankingOrdenado.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Trophy size={40} className="mx-auto mb-2" />
                <p>No hay ventas en este período</p>
              </div>
            )}
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

## File: src/components/TrialBanner.jsx
````javascript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { verificarEstadoV2 } from "../services/paymentService";
import { Clock, AlertTriangle, X, Crown, Zap, Gift } from "lucide-react";

export default function TrialBanner() {
  const { userData } = useAuth();
  const [estado, setEstado] = useState(null);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    if (!userData) return;
    const info = verificarEstadoV2(userData);
    setEstado(info);
  }, [userData]);

  if (!estado || cerrado) return null;

  // No mostrar banner si está en plan pagado
  if (estado.estado === "basico" || estado.estado === "pro") return null;

  // Banner rojo si está suspendido
  if (estado.suspendido) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <AlertTriangle size={20} />
          <div className="flex-1">
            <p className="font-bold text-sm">{estado.mensaje}</p>
            <p className="text-xs text-red-100">
              Tu periodo de prueba y plan gratuito han finalizado. Ve a Configuración → Plan para activar uno.
            </p>
          </div>
          <button
            onClick={() => setCerrado(true)}
            className="p-1 hover:bg-red-700 rounded transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Banner morado para Trial Pro (últimos 5 días = urgente)
  if (estado.estado === "trial_pro") {
    const esUrgente = estado.diasRestantes <= 5;
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className={`${esUrgente ? "bg-amber-500" : "bg-purple-600"} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}>
          <Crown size={18} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{estado.mensaje}</p>
            <p className="text-xs opacity-90">
              Tienes acceso completo al Plan Pro. Luego vendrán 6 meses gratis.
            </p>
          </div>
          <button
            onClick={() => setCerrado(true)}
            className="p-1 hover:bg-white/20 rounded transition shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Banner verde para Pro Gratis (últimos 15 días = urgente)
  if (estado.estado === "pro_gratis") {
    const esUrgente = estado.diasRestantes <= 15;
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className={`${esUrgente ? "bg-amber-500" : "bg-green-600"} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3`}>
          <Gift size={18} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{estado.mensaje}</p>
            <p className="text-xs opacity-90">
              Disfruta de Plan Pro gratis como agradecimiento por ser beta tester.
            </p>
          </div>
          <button
            onClick={() => setCerrado(true)}
            className="p-1 hover:bg-white/20 rounded transition shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
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
  persistentSingleTabManager,
  memoryLocalCache,
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

// Firestore con cache persistente (para que la app siga funcionando sin
// conexión) con una cadena de respaldo: si el navegador no puede abrir el
// cache persistente con soporte multi-pestaña (esto pasa en Safari antiguo,
// modo privado, o cuando falta la Web Locks API que Safari solo agregó en
// iOS 15.4), se intenta con cache persistente de una sola pestaña, y si
// tampoco es posible, se usa cache en memoria para que la app AL MENOS
// cargue y funcione con conexión, en vez de fallar por completo sin avisar.
// Sin este respaldo, un fallo silencioso aquí deja a getProducts() (que usa
// una lectura única, no un listener en vivo) sin datos para mostrar apenas
// el dispositivo pierde conexión — la app "no funciona offline" sin ningún
// error visible.
function crearFirestoreConRespaldo() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      })
    });
  } catch (err) {
    console.warn("Cache persistente multi-pestaña no disponible, probando modo de una pestaña:", err);
  }
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager({ forceOwnership: false }),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      })
    });
  } catch (err) {
    console.warn("Cache persistente no disponible en este dispositivo, usando cache en memoria (sin modo offline real):", err);
  }
  return initializeFirestore(app, { localCache: memoryLocalCache() });
}

const db = crearFirestoreConRespaldo();

export { auth, db };
export default app;
````

## File: src/hooks/useAuth.jsx
````javascript
import { createContext, useContext, useState, useEffect, useCallback } from "react";
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
import { verificarEstadoV2, autoUpgradeFases } from "../services/paymentService";

const AuthContext = createContext(null);

export const ROLES = {
  DUEÑO: "dueño",
  VENDEDOR: "vendedor",
};

export const PLANES = {
  BASICO: "basico",
  PRO: "pro",
  TRIAL_PRO: "trial_pro",
  PRO_GRATIS: "pro_gratis",
  SUSPENDIDO: "suspendido",
};

const FIREBASE_API_KEY = "AIzaSyAQUD8KyWSPYNz73RTrdSy-jZ3Lf2QiF3c";
const OFFLINE_SESSION_KEY = "pos_offline_session";
const OFFLINE_USERS_KEY = "pos_offline_users";
const IDB_NAME = "pos_offline_db";
const IDB_STORE = "session";
const IDB_VERSION = 1;

// ─── IndexedDB helpers ───
function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(IDB_STORE);
    };
  });
}

async function idbSet(key, value) {
  const database = await openIDB();
  const tx = database.transaction(IDB_STORE, "readwrite");
  const store = tx.objectStore(IDB_STORE);
  return new Promise((resolve, reject) => {
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  try {
    const database = await openIDB();
    const tx = database.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    return new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function idbDel(key) {
  try {
    const database = await openIDB();
    const tx = database.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    return new Promise((resolve, reject) => {
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    /* noop */
  }
}

// ─── localStorage helpers ───
function getOfflineSession() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_SESSION_KEY));
  } catch {
    return null;
  }
}

function saveOfflineSession(user, userData) {
  localStorage.setItem(
    OFFLINE_SESSION_KEY,
    JSON.stringify({
      uid: user.uid,
      email: user.email?.toLowerCase(),
      displayName: user.displayName,
      photoURL: user.photoURL,
      userData,
      savedAt: new Date().toISOString(),
    })
  );
}

function clearOfflineSession() {
  localStorage.removeItem(OFFLINE_SESSION_KEY);
}

function saveOfflineUser(uid, data) {
  const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || "{}");
  users[uid] = { ...data, _offlineSavedAt: new Date().toISOString() };
  localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
}

function getOfflineUser(uid) {
  try {
    const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || "{}");
    return users[uid] || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suscripcionInfo, setSuscripcionInfo] = useState(null);

  // 🔥 FIX #9: Función refreshUser para recargar datos desde Firestore
  const refreshUser = useCallback(async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setSuscripcionInfo(verificarEstadoV2(data));

          const session = {
            uid: user.uid,
            email: user.email?.toLowerCase(),
            displayName: user.displayName,
            photoURL: user.photoURL,
            userData: data,
            savedAt: new Date().toISOString(),
          };
          await idbSet("session", session);
          saveOfflineSession(user, data);
        }
      } catch (err) {
        console.error("Error refrescando usuario:", err);
      }
    }
  }, [user]);

  useEffect(() => {
    let unsub = null;
    let mounted = true;

    async function init() {
      const offline = (await idbGet("session").catch(() => null)) || getOfflineSession();
      if (mounted && offline?.userData) {
        setUser({
          uid: offline.uid,
          email: offline.email,
          displayName: offline.displayName,
          photoURL: offline.photoURL,
        });
        setUserData(offline.userData);
        const info = verificarEstadoV2(offline.userData);
        setSuscripcionInfo(info);
      }

      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;

        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              let data = userDoc.data();

              const estadoInfo = verificarEstadoV2(data);
              if (
                estadoInfo.necesitaUpgrade ||
                (data.plan === "pro_gratis" && estadoInfo.suspendido) ||
                ((data.plan === "basico" || data.plan === "pro") && estadoInfo.suspendido)
              ) {
                try {
                  await autoUpgradeFases(firebaseUser.uid, data);
                  const updatedDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                  if (updatedDoc.exists()) data = updatedDoc.data();
                } catch (upgradeErr) {
                  console.error("Error en auto-upgrade:", upgradeErr);
                }
              }

              const finalInfo = verificarEstadoV2(data);
              setSuscripcionInfo(finalInfo);

              if (data.passwordPending && data.role === "vendedor") {
                try {
                  await updatePassword(firebaseUser, data.passwordPending);
                  await updateDoc(doc(db, "users", firebaseUser.uid), {
                    passwordPending: null,
                    passwordUpdatedAt: new Date().toISOString(),
                  });
                } catch (err) {
                  console.error("No se pudo actualizar contraseña pendiente:", err);
                }
              }

              setUserData(data);
              const session = {
                uid: firebaseUser.uid,
                email: firebaseUser.email?.toLowerCase(),
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                userData: data,
                savedAt: new Date().toISOString(),
              };
              await idbSet("session", session);
              saveOfflineSession(firebaseUser, data);
              saveOfflineUser(firebaseUser.uid, data);
            } else {
              const cached = getOfflineUser(firebaseUser.uid);
              if (cached) {
                setUserData(cached);
                setSuscripcionInfo(verificarEstadoV2(cached));
              }
            }
          } catch (err) {
            const cached = getOfflineUser(firebaseUser.uid);
            if (cached) {
              setUserData(cached);
              setSuscripcionInfo(verificarEstadoV2(cached));
            }
            console.warn("Firestore offline, usando cache:", err.message);
          }
        } else {
          const stillOffline = (await idbGet("session").catch(() => null)) || getOfflineSession();
          if (!stillOffline) {
            setUser(null);
            setUserData(null);
            setSuscripcionInfo(null);
          }
        }
        if (mounted) setLoading(false);
      });
    }

    init();
    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  async function findEmailByUsername(username) {
    const clean = username.toLowerCase().trim();
    const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || "{}");
    for (const uid in users) {
      if (users[uid].username === clean) return users[uid].email;
    }

    const offlineSession = getOfflineSession();
    const almacenId = offlineSession?.userData?.almacenId;
    if (almacenId) {
      try {
        const cache = JSON.parse(localStorage.getItem(`pos_vendedores_cache_${almacenId}`) || "[]");
        const found = cache.find((v) => v.username === clean);
        if (found) return found.email;
      } catch {
        /* noop */
      }
    }

    if (navigator.onLine) {
      try {
        const snap = await getDoc(doc(db, "publicUsernames", clean));
        if (snap.exists()) {
          const data = snap.data();
          if (data.email) return data.email;
          if (data.almacenId) {
            return `vendedor.${clean}.${data.almacenId}@pos-almacen.local`;
          }
        }
      } catch {
        /* noop */
      }
    }
    return null;
  }

  const login = async (identifier, password) => {
    let email = identifier.trim().toLowerCase();
    if (!email.includes("@")) {
      const foundEmail = await findEmailByUsername(email);
      if (!foundEmail) throw new Error("Usuario no encontrado");
      email = foundEmail.toLowerCase();
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        let data = userDoc.data();
        const estadoInfo = verificarEstadoV2(data);

        if (
          estadoInfo.necesitaUpgrade ||
          (data.plan === "pro_gratis" && estadoInfo.suspendido) ||
          ((data.plan === "basico" || data.plan === "pro") && estadoInfo.suspendido)
        ) {
          try {
            await autoUpgradeFases(result.user.uid, data);
            const updatedDoc = await getDoc(doc(db, "users", result.user.uid));
            if (updatedDoc.exists()) data = updatedDoc.data();
          } catch (upgradeErr) {
            console.error("Error en auto-upgrade:", upgradeErr);
          }
        }

        const finalInfo = verificarEstadoV2(data);
        setSuscripcionInfo(finalInfo);

        if (data.activo === false) {
          await signOut(auth);
          throw new Error("Usuario desactivado. Contacta al dueño.");
        }

        setUserData(data);
        const session = {
          uid: result.user.uid,
          email: result.user.email?.toLowerCase(),
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          userData: data,
          savedAt: new Date().toISOString(),
        };
        await idbSet("session", session);
        saveOfflineSession(result.user, data);
        saveOfflineUser(result.user.uid, data);
      }
      return result;
    } catch (err) {
      const isNetworkError =
        err.code === "auth/network-request-failed" ||
        err.code === "auth/timeout" ||
        err.message?.includes("network") ||
        err.message?.includes("fetch") ||
        !navigator.onLine;

      if (isNetworkError) {
        const targetEmail = email.toLowerCase();
        const users = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || "{}");
        let offline = null;
        for (const uid in users) {
          if (users[uid].email?.toLowerCase() === targetEmail) {
            offline = { uid, ...users[uid] };
            break;
          }
        }
        if (!offline) {
          const session = (await idbGet("session").catch(() => null)) || getOfflineSession();
          if (session && session.email?.toLowerCase() === targetEmail) {
            offline = session;
          }
        }

        if (offline) {
          setUser({
            uid: offline.uid,
            email: offline.email,
            displayName: offline.displayName || offline.nombre,
            photoURL: offline.photoURL,
          });
          setUserData(offline.userData || offline);
          setSuscripcionInfo(verificarEstadoV2(offline.userData || offline));
          return { user: offline, offline: true };
        }
        throw new Error("Sin conexión. Primero inicia sesión con internet al menos una vez.");
      }
      throw err;
    }
  };

  // 🔥 FIX #7: Rollback si falla la creación en Firestore
  const registerDueño = async (email, password, nombre, nombreAlmacen) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: nombre });

    try {
      const almacenRef = doc(collection(db, "almacenes"));
      await setDoc(almacenRef, {
        nombre: nombreAlmacen,
        dueñoId: result.user.uid,
        plan: PLANES.BASICO,
        createdAt: new Date().toISOString(),
      });

      await setDoc(doc(db, "users", result.user.uid), {
        email,
        nombre,
        role: ROLES.DUEÑO,
        almacenId: almacenRef.id,
        plan: PLANES.BASICO,
        createdAt: new Date().toISOString(),
      });

      const newUserData = {
        email,
        nombre,
        role: ROLES.DUEÑO,
        almacenId: almacenRef.id,
        plan: PLANES.BASICO,
      };

      setUserData(newUserData);
      setSuscripcionInfo(verificarEstadoV2(newUserData));

      const session = {
        uid: result.user.uid,
        email: result.user.email?.toLowerCase(),
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        userData: newUserData,
        savedAt: new Date().toISOString(),
      };
      await idbSet("session", session);
      saveOfflineSession(result.user, newUserData);
      saveOfflineUser(result.user.uid, newUserData);

      return result;
    } catch (err) {
      console.error("Error creando almacén, revirtiendo usuario:", err);
      await result.user.delete().catch((e) => console.error("No se pudo borrar usuario huérfano:", e));
      throw err;
    }
  };

  const logout = async () => {
    await idbDel("session");
    clearOfflineSession();
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setSuscripcionInfo(null);
  };

  const isDueño = userData?.role === ROLES.DUEÑO;
  const isVendedor = userData?.role === ROLES.VENDEDOR;
  const almacenId = userData?.almacenId || null;
  const isSuspendido = suscripcionInfo?.suspendido || false;
  const planReal = suscripcionInfo?.planReal || null;

  const hasPrivilege = useCallback(
    (privilege) => {
      if (isDueño) return true;
      if (!userData?.privilegios) return false;
      return !!userData.privilegios[privilege];
    },
    [isDueño, userData]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        registerDueño,
        logout,
        isDueño,
        isVendedor,
        almacenId,
        isAuthenticated: !!userData,
        hasPrivilege,
        suscripcionInfo,
        isSuspendido,
        planReal,
        refreshUser,
      }}
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
    if (data.error.message === "WEAK_PASSWORD")
      throw new Error("Contraseña muy débil (mínimo 6 caracteres)");
    throw new Error(data.error.message);
  }

  const uid = data.localId;
  await setDoc(doc(db, "users", uid), {
    email,
    nombre,
    username: cleanUser,
    role: ROLES.VENDEDOR,
    almacenId,
    activo: true,
    createdAt: new Date().toISOString(),
  });

  await setDoc(doc(db, "publicUsernames", cleanUser), {
    email,
    almacenId,
    uid,
  });

  return { uid, email, username: cleanUser };
}

export async function toggleVendedorEstado(vendedorId, activo) {
  await updateDoc(doc(db, "users", vendedorId), {
    activo,
    updatedAt: new Date().toISOString(),
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

  // 🔥 FIX #3: Sincronizar cola con actualización de cantidadOfertaVendida
  useEffect(() => {
    if (!isOnline) return;

    async function syncQueue() {
      const queue = JSON.parse(localStorage.getItem(SYNC_KEY) || "[]");
      if (queue.length === 0) return;

      setSyncing(true);
      const remaining = [];
      const turnoIdMap = {};

      for (const op of queue) {
        try {
          if (op.type === "turno_abrir") {
            const nuevoTurno = await salesService.createTurno(op.almacenId, op.data);
            turnoIdMap[op.tempId] = nuevoTurno.id;
            const offlineTurno = JSON.parse(localStorage.getItem(OFFLINE_TURNO_KEY) || "null");
            if (offlineTurno && offlineTurno.id === op.tempId) {
              localStorage.setItem(OFFLINE_TURNO_KEY, JSON.stringify({
                ...offlineTurno,
                id: nuevoTurno.id,
              }));
            }
          } else if (op.type === "venta" || op.type === "fiado") {
            const turnoId = turnoIdMap[op.data.turnoId] || op.data.turnoId;

            // Descontar stock
            await productsService.discountStockBatch(op.data.productos.map(p => ({
              id: p.id,
              cantidad: p.cantidad
            })));

            // 🔥 FIX #3: Actualizar cantidadOfertaVendida para productos en oferta
            if (op.data.productos) {
              for (const prod of op.data.productos) {
                if (prod.unidadesOferta && prod.unidadesOferta > 0 && prod.cantidadOferta != null) {
                  try {
                    // Leer el producto actual para obtener el valor actual de cantidadOfertaVendida
                    const productoActual = await productsService.getProduct(prod.id);
                    if (productoActual) {
                      const nuevaCantidadVendida = (productoActual.cantidadOfertaVendida || 0) + prod.unidadesOferta;
                      await productsService.updateProduct(prod.id, {
                        cantidadOfertaVendida: nuevaCantidadVendida
                      });
                    }
                  } catch (offerErr) {
                    console.error(`No se pudo actualizar cupo de oferta para producto ${prod.id}:`, offerErr);
                    // No fallar la sync completa por un error de oferta
                  }
                }
              }
            }

            // Crear la venta o fiado
            if (op.type === "venta") {
              await salesService.createSale(op.almacenId, { ...op.data, turnoId });
            } else {
              await fiadosService.createFiado(op.almacenId, { ...op.data, turnoId });
            }
          } else if (op.type === "turno_cerrar") {
            const turnoId = turnoIdMap[op.turnoId] || op.turnoId;
            await salesService.updateTurno(turnoId, op.data);
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
  getTurnoActivo,
  createTurno as openTurnoService,
  updateTurno,
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
      const t = await getTurnoActivo(almacenId);
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
        const turnoData = {
          estado: "abierto",
          vendedorId,
          vendedorNombre,
          montoInicial: efectivoInicial,
          ventas: { efectivo: 0, tarjeta: 0, transferencia: 0, fiado: 0 },
        };
        const res = await openTurnoService(almacenId, turnoData);
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
    if (!almacenId || !vendedorId || !turno?.id) {
      throw new Error("Falta turno activo");
    }
    setLoading(true);
    setError("");
    try {
      await updateTurno(turno.id, {
        estado: "cerrado",
        cerradoEn: new Date().toISOString(),
      });
      setTurno(null);
      return { mensaje: "Turno cerrado" };
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cerrar turno");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [almacenId, vendedorId, turno]);

  return { turno, loading, error, refresh, abrir, cerrar };
}
````

## File: src/pages/AdminVendedores.jsx
````javascript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usersService } from "../services/firestoreUsers";
import { getPlan, LIMITES } from "../services/planLimits";
import { Plus, Trash2, RefreshCw, UserCheck, UserX, KeyRound, Loader2, AlertTriangle, Shield } from "lucide-react";

const PRIVILEGIOS_DISPONIBLES = [
  { key: "productos", label: "Productos", desc: "Crear, editar y eliminar productos" },
  { key: "mermas", label: "Mermas", desc: "Registrar y eliminar mermas" },
  { key: "ofertas", label: "Ofertas", desc: "Crear y quitar ofertas especiales" },
  { key: "fiados", label: "Fiados", desc: "Gestionar fiados (siempre activo)", locked: true },
  { key: "informes", label: "Informes", desc: "Ver informes y estadísticas (siempre activo)", locked: true },
];

const DEFAULT_PRIVILEGIOS = {
  productos: false,
  mermas: false,
  ofertas: false,
  fiados: true,
  informes: true,
  configuracion: false,
  vendedores: false,
};

export default function AdminVendedores() {
  const { userData } = useAuth();
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", username: "", password: "" });
  const [planInfo, setPlanInfo] = useState(null);
  const [error, setError] = useState("");
  const [editandoPrivilegios, setEditandoPrivilegios] = useState(null);

  useEffect(() => {
    if (userData?.almacenId) cargarTodo();
  }, [userData?.almacenId]);

  async function cargarTodo() {
    setLoading(true);
    setError("");
    try {
      const [data, plan] = await Promise.all([
        usersService.getVendedores(userData.almacenId),
        getPlan(userData.almacenId),
      ]);

      const normalizados = data.map((v) => ({
        ...v,
        privilegios: { ...DEFAULT_PRIVILEGIOS, ...v.privilegios },
      }));

      setVendedores(normalizados);

      localStorage.setItem(
        `pos_vendedores_cache_${userData.almacenId}`,
        JSON.stringify({ vendedores: normalizados, timestamp: Date.now() })
      );

      const limite = LIMITES[plan]?.vendedores ?? LIMITES.basico.vendedores;
      setPlanInfo({
        plan,
        usados: normalizados.length,
        limite: limite === Infinity ? "∞" : limite,
        permitido: limite === Infinity || normalizados.length < limite,
      });
    } catch (err) {
      console.error("Error cargando vendedores:", err);
      setError("Error al cargar vendedores. Intenta recargar.");
      const cache = localStorage.getItem(`pos_vendedores_cache_${userData.almacenId}`);
      if (cache) {
        try {
          const parsed = JSON.parse(cache);
          setVendedores((parsed.vendedores || []).map((v) => ({ ...v, privilegios: { ...DEFAULT_PRIVILEGIOS, ...v.privilegios } })));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCrear(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.username.trim() || !form.password.trim()) return;

    setSaving(true);
    setError("");
    try {
      const result = await usersService.createVendedor({
        almacenId: userData.almacenId,
        nombre: form.nombre.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
      });

      const nuevoVendedor = {
        id: result.uid,
        nombre: form.nombre.trim(),
        username: form.username.trim().toLowerCase(),
        email: result.email,
        activo: true,
        role: "vendedor",
        almacenId: userData.almacenId,
        privilegios: { ...DEFAULT_PRIVILEGIOS },
      };
      const nuevaLista = [...vendedores, nuevoVendedor];
      setVendedores(nuevaLista);
      setMostrarForm(false);
      setForm({ nombre: "", username: "", password: "" });

      if (planInfo) {
        const limite = planInfo.limite === "∞" ? Infinity : parseInt(planInfo.limite);
        setPlanInfo({
          ...planInfo,
          usados: nuevaLista.length,
          permitido: limite === Infinity || nuevaLista.length < limite,
        });
      }

      usersService.getVendedores(userData.almacenId).then((data) => {
        const normalizados = data.map((v) => ({ ...v, privilegios: { ...DEFAULT_PRIVILEGIOS, ...v.privilegios } }));
        setVendedores(normalizados);
        localStorage.setItem(
          `pos_vendedores_cache_${userData.almacenId}`,
          JSON.stringify({ vendedores: normalizados, timestamp: Date.now() })
        );
      }).catch(() => {});
    } catch (err) {
      setError(err.message || "Error al crear vendedor");
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(vendedor) {
    if (!confirm(`¿Eliminar vendedor "${vendedor.nombre}"? Esta acción no se puede deshacer.`)) return;

    setSaving(true);
    try {
      await usersService.deleteVendedor(vendedor.id, vendedor.username);
      const nuevaLista = vendedores.filter((v) => v.id !== vendedor.id);
      setVendedores(nuevaLista);

      if (planInfo) {
        const limite = planInfo.limite === "∞" ? Infinity : parseInt(planInfo.limite);
        setPlanInfo({
          ...planInfo,
          usados: nuevaLista.length,
          permitido: limite === Infinity || nuevaLista.length < limite,
        });
      }

      usersService.getVendedores(userData.almacenId).then((data) => {
        const normalizados = data.map((v) => ({ ...v, privilegios: { ...DEFAULT_PRIVILEGOS, ...v.privilegios } }));
        setVendedores(normalizados);
        localStorage.setItem(
          `pos_vendedores_cache_${userData.almacenId}`,
          JSON.stringify({ vendedores: normalizados, timestamp: Date.now() })
        );
      }).catch(() => {});
    } catch (err) {
      setError(err.message || "Error al eliminar vendedor");
      cargarTodo();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActivo(vendedor) {
    setSaving(true);
    try {
      await usersService.updateVendedor(vendedor.id, { activo: !vendedor.activo });
      setVendedores((prev) =>
        prev.map((v) => (v.id === vendedor.id ? { ...v, activo: !v.activo } : v))
      );
    } catch (err) {
      setError(err.message || "Error al cambiar estado");
      cargarTodo();
    } finally {
      setSaving(false);
    }
  }

  async function handleCambiarPassword(vendedor) {
    const nueva = prompt(`Nueva contraseña para ${vendedor.nombre}:`);
    if (!nueva || nueva.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setSaving(true);
    try {
      await usersService.cambiarPasswordVendedor(vendedor.id, nueva);
      alert("Contraseña actualizada");
    } catch (err) {
      setError(err.message || "Error al cambiar contraseña");
    } finally {
      setSaving(false);
    }
  }

  function abrirPrivilegios(vendedor) {
    setEditandoPrivilegios({
      ...vendedor,
      privilegios: { ...DEFAULT_PRIVILEGIOS, ...vendedor.privilegios },
    });
  }

  function togglePrivilegio(key) {
    setEditandoPrivilegios((prev) => ({
      ...prev,
      privilegios: {
        ...prev.privilegios,
        [key]: !prev.privilegios?.[key],
      },
    }));
  }

  async function guardarPrivilegios() {
    if (!editandoPrivilegios) return;
    setSaving(true);
    try {
      await usersService.updateVendedor(editandoPrivilegios.id, {
        privilegios: editandoPrivilegios.privilegios,
      });
      setVendedores((prev) =>
        prev.map((v) =>
          v.id === editandoPrivilegios.id
            ? { ...v, privilegios: editandoPrivilegios.privilegios }
            : v
        )
      );
      setEditandoPrivilegios(null);
    } catch (err) {
      setError(err.message || "Error al guardar privilegios");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 Vendedores</h1>
          {planInfo && (
            <p className="text-sm text-gray-500 mt-1">
              Plan <span className="font-semibold capitalize">{planInfo.plan}</span> ·{" "}
              {planInfo.usados} / {planInfo.limite} vendedores
            </p>
          )}
        </div>
        <button
          onClick={cargarTodo}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title="Recargar"
        >
          <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : "text-gray-600"} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!mostrarForm ? (
        <button
          onClick={() => {
            if (!planInfo?.permitido) {
              alert("Has alcanzado el límite de vendedores de tu plan. Actualiza a Pro para agregar más.");
              return;
            }
            setMostrarForm(true);
          }}
          disabled={saving}
          className="mb-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          <Plus size={18} />
          Agregar Vendedor
        </button>
      ) : (
        <form onSubmit={handleCrear} className="mb-6 bg-white border rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Nuevo Vendedor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
              required
            />
            <input
              type="text"
              placeholder="Usuario (sin espacios)"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
              required
            />
            <input
              type="password"
              placeholder="Contraseña (mín. 6)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
              required
              minLength={6}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? "Creando..." : "Crear Vendedor"}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); setForm({ nombre: "", username: "", password: "" }); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading && vendedores.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      ) : vendedores.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <UserCheck size={48} className="mx-auto mb-3 opacity-50" />
          <p>No hay vendedores registrados</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Usuario</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendedores.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{v.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">@{v.username}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActivo(v)}
                        disabled={saving}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                          v.activo
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {v.activo ? <UserCheck size={12} /> : <UserX size={12} />}
                        {v.activo ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirPrivilegios(v)}
                          disabled={saving}
                          className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition"
                          title="Editar privilegios"
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          onClick={() => handleCambiarPassword(v)}
                          disabled={saving}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                          title="Cambiar contraseña"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => handleEliminar(v)}
                          disabled={saving}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Privilegios - Responsive para celular */}
      {editandoPrivilegios && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-purple-600" size={20} />
              <h3 className="text-base font-bold text-gray-800">
                Privilegios de {editandoPrivilegios.nombre}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Activa o desactiva los permisos de este vendedor.
            </p>
            <div className="space-y-2">
              {PRIVILEGIOS_DISPONIBLES.map((p) => (
                <label
                  key={p.key}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition ${
                    p.locked ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!editandoPrivilegios.privilegios?.[p.key]}
                    disabled={p.locked || saving}
                    onChange={() => togglePrivilegio(p.key)}
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-800">{p.label}</span>
                      {p.locked && (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                          Siempre activo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditandoPrivilegios(null)}
                disabled={saving}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPrivilegios}
                disabled={saving}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
````

## File: src/pages/BetaRegister.jsx
````javascript
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerBetaDueño } from "../services/betaAuth";
import { Store, Mail, Lock, User, Tag, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function BetaRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    nombreAlmacen: "",
    codigoBeta: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (!form.email.trim() || !form.email.includes("@")) { setError("Ingresa un email válido"); return; }
    if (form.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    if (form.password !== form.confirmPassword) { setError("Las contraseñas no coinciden"); return; }
    if (!form.nombreAlmacen.trim()) { setError("El nombre de tu tienda es obligatorio"); return; }
    if (!form.codigoBeta.trim()) { setError("Ingresa tu código de invitación beta"); return; }

    setLoading(true);
    try {
      await registerBetaDueño({
        email: form.email,
        password: form.password,
        nombre: form.nombre,
        nombreAlmacen: form.nombreAlmacen,
        codigoBeta: form.codigoBeta,
      });
      setExito(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message || "Error al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Registro exitoso!</h2>
          <p className="text-gray-600 mb-4">
            Tu cuenta y tienda han sido creadas. Tienes <strong>30 días de prueba</strong> con acceso completo.
          </p>
          <p className="text-sm text-gray-500">
            Después de los 30 días, tendrás <strong>6 meses del Plan Básico gratis</strong> como agradecimiento por ser beta tester.
          </p>
          <p className="text-xs text-gray-400 mt-4">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Registro Beta</h1>
          <p className="text-gray-500 text-sm mt-1">
            Únete al programa beta de POS Almacén de Barrio
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu tienda / almacén *</label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                name="nombreAlmacen"
                value={form.nombreAlmacen}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Almacén La Esquina"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de invitación Beta *</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                name="codigoBeta"
                value={form.codigoBeta}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="BETA-XXXX"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Solicita tu código al equipo de POS Almacén de Barrio
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">¿Qué incluye tu registro beta?</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-600" />
                <strong>30 días</strong> de prueba con acceso completo
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-600" />
                Luego <strong>6 meses</strong> del Plan Básico gratis
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-600" />
                Después puedes elegir Plan Básico o Pro
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 size={20} />}
            {loading ? "Creando cuenta..." : "Crear cuenta Beta"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Ya tengo cuenta, iniciar sesión
          </Link>
        </div>
      </div>
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
import { Settings, Save, Store, FileText, MapPin, Phone, Image, Loader2, Printer, Bluetooth } from "lucide-react";
import {
  getPrinterConfig, setPrinterConfig, emparejarImpresora,
  desconectarImpresora, isWebBluetoothSupported, isConnected,
} from "../services/printerService";

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
  const [printerConfig, setPrinterConfigState] = useState(getPrinterConfig());
  const [conectando, setConectando] = useState(false);
  const [errorImpresora, setErrorImpresora] = useState("");

  async function handleEmparejarImpresora() {
    setConectando(true);
    setErrorImpresora("");
    try {
      const nombre = await emparejarImpresora();
      setPrinterConfigState({ habilitada: true, nombreDispositivo: nombre });
    } catch (err) {
      setErrorImpresora(err.message || "No se pudo conectar con la impresora");
    } finally {
      setConectando(false);
    }
  }

  function handleDesconectarImpresora() {
    desconectarImpresora();
    setPrinterConfig({ habilitada: false, nombreDispositivo: null });
    setPrinterConfigState({ habilitada: false, nombreDispositivo: null });
  }

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

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Printer className="w-5 h-5 text-gray-600" /> Impresora térmica (Bluetooth)
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Conecta una impresora térmica de 58mm/80mm para imprimir el ticket de venta cuando el cliente lo pida.
        </p>

        {!isWebBluetoothSupported() && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-4">
            Este navegador no soporta impresión Bluetooth. En iPhone no es posible por una limitación de Apple
            (no permite Web Bluetooth en Safari); en Android, usa Chrome.
          </div>
        )}

        {printerConfig.habilitada && printerConfig.nombreDispositivo ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700">
              <Bluetooth size={18} />
              <span className="text-sm font-medium">
                Conectada: {printerConfig.nombreDispositivo} {isConnected() ? "" : "(reconectará al imprimir)"}
              </span>
            </div>
            <button
              onClick={handleDesconectarImpresora}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <button
            onClick={handleEmparejarImpresora}
            disabled={conectando || !isWebBluetoothSupported()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition"
          >
            {conectando ? <Loader2 size={16} className="animate-spin" /> : <Bluetooth size={16} />}
            {conectando ? "Buscando impresora..." : "Emparejar impresora"}
          </button>
        )}
        {errorImpresora && (
          <p className="text-sm text-red-600 mt-2">{errorImpresora}</p>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Solo funciona con impresoras Bluetooth de bajo consumo (BLE). Si tu impresora no aparece en la lista al
          emparejar, es probablemente Bluetooth clásico (SPP) y no es compatible con esta función.
        </p>
      </div>

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
import BetaCodesAdmin from "../components/BetaCodesAdmin";

export default function Dashboard() {
  const { isDueño, hasPrivilege, loading } = useAuth();

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
          <Route path="/productos" element={isDueño || hasPrivilege("productos") ? <ProductManager /> : <Navigate to="/" />} />
          <Route path="/fiados" element={<Fiados />} />
          <Route path="/ofertas" element={isDueño || hasPrivilege("ofertas") ? <Offers /> : <Navigate to="/" />} />
          <Route path="/mermas" element={isDueño || hasPrivilege("mermas") ? <Mermas /> : <Navigate to="/" />} />
          <Route path="/informes" element={<Reports />} />
          <Route path="/vendedores" element={isDueño ? <AdminVendedores /> : <Navigate to="/" />} />
          <Route path="/configuracion" element={isDueño ? <ConfiguracionAlmacen /> : <Navigate to="/" />} />
          <Route path="/admin-beta" element={isDueño ? <BetaCodesAdmin /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
````

## File: src/pages/LandingPage.jsx
````javascript
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store, WifiOff, Smartphone, BarChart3, Shield, Zap,
  Users, Package, CreditCard, Check, ArrowRight, Menu, X,
  Clock, Gift, Crown, Star, ChevronDown
} from "lucide-react";

export default function LandingPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState(null);

  const caracteristicas = [
    {
      icon: <WifiOff className="w-8 h-8 text-blue-600" />,
      titulo: "100% Offline",
      desc: "Vende sin internet. Todo se guarda localmente y se sincroniza cuando vuelvas a conectar.",
    },
    {
      icon: <Smartphone className="w-8 h-8 text-green-600" />,
      titulo: "Desde tu celular",
      desc: "No necesitas computador ni caja registradora. Tu celular es tu POS.",
    },
    {
      icon: <Package className="w-8 h-8 text-purple-600" />,
      titulo: "Control de stock",
      desc: "Sabe exactamente qué tienes, qué se vende más y qué está por agotarse.",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      titulo: "Reportes claros",
      desc: "Ventas por día, producto, vendedor. Toma decisiones con datos reales.",
    },
    {
      icon: <Users className="w-8 h-8 text-pink-600" />,
      titulo: "Multi-vendedor",
      desc: "Cada vendedor con su usuario. Controla quién puede vender, editar o ver reportes.",
    },
    {
      icon: <Shield className="w-8 h-8 text-teal-600" />,
      titulo: "Fiados seguros",
      desc: "Registra deudas de clientes con nombre, teléfono y dirección. Nunca pierdas una cuenta.",
    },
  ];

  const planes = [
    {
      nombre: "Básico",
      precioMensual: 5990,
      precioAnual: 59900,
      icon: <Zap className="w-6 h-6" />,
      color: "blue",
      popular: false,
      features: [
        "Hasta 500 productos",
        "1 vendedor",
        "POS 100% offline",
        "Control de stock",
        "Ventas y fiados",
        "Reportes básicos",
        "Soporte por email",
      ],
    },
    {
      nombre: "Pro",
      precioMensual: 11990,
      precioAnual: 119900,
      icon: <Crown className="w-6 h-6" />,
      color: "purple",
      popular: true,
      features: [
        "Productos ilimitados",
        "Vendedores ilimitados",
        "POS 100% offline",
        "Reportes avanzados",
        "Multi-sucursal",
        "Ofertas y promociones",
        "Soporte prioritario",
        "Exportar datos",
      ],
    },
  ];

  const faqs = [
    {
      pregunta: "¿Necesito internet para usar Loventa?",
      respuesta: "No. Loventa funciona 100% offline. Puedes vender, agregar productos y registrar fiados sin conexión. Todo se sincroniza automáticamente cuando recuperes internet.",
    },
    {
      pregunta: "¿Puedo usarlo en mi computador?",
      respuesta: "Sí, Loventa es una aplicación web responsive. Funciona perfectamente en celulares, tablets y computadores. Solo necesitas un navegador.",
    },
    {
      pregunta: "¿Qué pasa si pierdo mi celular?",
      respuesta: "Tus datos están seguros en la nube de Firebase. Solo inicia sesión desde otro dispositivo y recuperas toda tu información al instante.",
    },
    {
      pregunta: "¿Puedo tener varias tiendas?",
      respuesta: "Sí, con el Plan Pro puedes gestionar múltiples sucursales desde una sola cuenta, con reportes consolidados y stock por tienda.",
    },
    {
      pregunta: "¿Cómo funciona el programa beta?",
      respuesta: "Si tienes un código de invitación, obtienes 30 días de prueba completa del Plan Pro + 6 meses gratis. Después eliges si quedarte con el Plan Básico o Pro.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loventa
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#caracteristicas" className="text-sm text-gray-600 hover:text-gray-900 transition">Características</a>
            <a href="#precios" className="text-sm text-gray-600 hover:text-gray-900 transition">Precios</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition">FAQ</a>
            <Link
              to="/beta-registro"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Registrarme
            </Link>
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {menuAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuAbierto && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <a href="#caracteristicas" onClick={() => setMenuAbierto(false)} className="block text-gray-600 py-2">Características</a>
            <a href="#precios" onClick={() => setMenuAbierto(false)} className="block text-gray-600 py-2">Precios</a>
            <a href="#faq" onClick={() => setMenuAbierto(false)} className="block text-gray-600 py-2">FAQ</a>
            <Link to="/beta-registro" onClick={() => setMenuAbierto(false)} className="block bg-blue-600 text-white text-center py-2.5 rounded-lg font-medium">Registrarme</Link>
            <Link to="/login" onClick={() => setMenuAbierto(false)} className="block text-center text-blue-600 py-2 font-medium">Iniciar sesión</Link>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Gift size={14} />
            Programa beta abierto — 30 días de prueba + 6 meses gratis
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            El POS que tu almacén
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              de barrio necesita
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8">
            Vende sin internet. Controla tu stock. Registra fiados. Todo desde tu celular.
            <strong className="text-gray-700"> Sin computador, sin caja registradora, sin complicaciones.</strong>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/beta-registro"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              Empezar gratis <ArrowRight size={20} />
            </Link>
            <a
              href="#caracteristicas"
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium transition flex items-center justify-center gap-2"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 pt-8 border-t border-gray-100">
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">100%</p>
              <p className="text-sm text-gray-500">Offline</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">$5.990</p>
              <p className="text-sm text-gray-500">Desde /mes</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">0</p>
              <p className="text-sm text-gray-500">Complicaciones</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CARACTERÍSTICAS ─── */}
      <section id="caracteristicas" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para vender mejor
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Diseñado específicamente para almacenes de barrio, ferias libres y negocios pequeños de Chile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caracteristicas.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition group">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  {c.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{c.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANNER BETA ─── */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Star size={14} />
            Programa Beta Exclusivo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Únete ahora y vende gratis por 6 meses y medio
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Los primeros usuarios beta obtienen acceso completo al Plan Pro por 30 días,
            y luego 6 meses adicionales completamente gratis como agradecimiento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center text-white min-w-[140px]">
              <p className="text-3xl font-bold">30</p>
              <p className="text-sm text-blue-100">días de prueba Pro</p>
            </div>
            <span className="text-white/50 text-2xl hidden sm:block">+</span>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center text-white min-w-[140px]">
              <p className="text-3xl font-bold">6</p>
              <p className="text-sm text-blue-100">meses gratis</p>
            </div>
            <span className="text-white/50 text-2xl hidden sm:block">=</span>
            <div className="bg-white rounded-xl p-4 text-center min-w-[140px]">
              <p className="text-3xl font-bold text-blue-600">$0</p>
              <p className="text-sm text-gray-500">Por más de 7 meses</p>
            </div>
          </div>
          <Link
            to="/beta-registro"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold mt-8 hover:bg-blue-50 transition shadow-xl"
          >
            Solicitar acceso beta <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="precios" className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Precios simples, sin sorpresas
            </h2>
            <p className="text-gray-500 text-lg">
              Elige el plan que se ajuste a tu negocio. Paga mensual o anual y ahorra 2 meses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular
                    ? "border-purple-500 shadow-xl shadow-purple-100"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    Más popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{plan.nombre}</h3>
                    <p className="text-sm text-gray-500">
                      {plan.popular ? "Para negocios en crecimiento" : "Para empezar"}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.precioMensual.toLocaleString("es-CL")}
                    </span>
                    <span className="text-gray-500">/mes</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    o ${plan.precioAnual.toLocaleString("es-CL")}/año (ahorras 2 meses)
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/beta-registro"
                  className={`block w-full text-center py-3 rounded-xl font-bold transition ${
                    plan.popular
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  {plan.popular ? "Empezar con Pro" : "Empezar con Básico"}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            🔒 Pago seguro. Cancela cuando quieras. Sin contratos de permanencia.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
            <p className="text-gray-500">Todo lo que necesitas saber antes de empezar.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-800">{faq.pregunta}</span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${faqAbierta === i ? "rotate-180" : ""}`}
                  />
                </button>
                {faqAbierta === i && (
                  <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">
                    {faq.respuesta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para modernizar tu almacén?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Únete al programa beta y empieza a vender mejor hoy mismo.
            Sin tarjeta de crédito, sin compromiso.
          </p>
          <Link
            to="/beta-registro"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition shadow-lg shadow-blue-200"
          >
            Crear cuenta gratis <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            Programa beta limitado. Solicita tu código de invitación.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Loventa</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                El punto de venta diseñado para almacenes de barrio en Chile.
                Vende offline, controla tu stock y haz crecer tu negocio.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#caracteristicas" className="hover:text-white transition">Características</a></li>
                <li><a href="#precios" className="hover:text-white transition">Precios</a></li>
                <li><Link to="/beta-registro" className="hover:text-white transition">Programa Beta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Cuenta</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition">Iniciar sesión</Link></li>
                <li><Link to="/beta-registro" className="hover:text-white transition">Registrarme</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © 2026 Loventa. Hecho con ❤️ en Chile.
            </p>
            <p className="text-xs text-gray-500">
              POS Almacén de Barrio — Tu celular, tu caja registradora.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
````

## File: src/pages/Login.jsx
````javascript
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, registerDueño, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorLocal("");
    setCargando(true);
    try {
      if (modo === "login") {
        await login(email, password);
      } else {
        await registerDueño(email, password, nombre, nombreNegocio);
      }
      navigate("/");
    } catch (err) {
      setErrorLocal(err.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  const error = errorLocal || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏪</div>
          <h1 className="text-2xl font-bold text-gray-800">
            {modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Almacén de Barrio — POS</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "registro" && (
            <>
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Tu nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label htmlFor="nombreNegocio" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del negocio
                </label>
                <input
                  id="nombreNegocio"
                  name="nombreNegocio"
                  type="text"
                  autoComplete="organization"
                  required
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Mi Almacén"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={modo === "login" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando
              ? "Cargando..."
              : modo === "login"
              ? "🔐 Iniciar Sesión"
              : "✨ Crear Cuenta"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setModo(modo === "login" ? "registro" : "login");
              setErrorLocal("");
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {modo === "login"
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
````

## File: src/pages/PaymentPortal.jsx
````javascript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { PRECIOS, formatMoney, activarPlan } from "../services/paymentService";
import { useNavigate } from "react-router-dom";
import { 
  Crown, Zap, Check, Loader2, Calendar, CreditCard, 
  AlertTriangle, ArrowRight, ShieldCheck, WifiOff 
} from "lucide-react";

export default function PaymentPortal() {
  const { user, userData, logout, isSuspendido, suscripcionInfo } = useAuth();
  const navigate = useNavigate();
  const [planSeleccionado, setPlanSeleccionado] = useState("basico");
  const [periodo, setPeriodo] = useState("mensual");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  // Si no está suspendido, redirigir al dashboard
  useEffect(() => {
    if (!isSuspendido && userData?.plan && userData.plan !== "suspendido") {
      navigate("/");
    }
  }, [isSuspendido, userData, navigate]);

  const precioActual = PRECIOS[planSeleccionado][periodo];
  const ahorroAnual = periodo === "anual" 
    ? Math.round((PRECIOS[planSeleccionado].mensual * 12 - PRECIOS[planSeleccionado].anual))
    : 0;

  async function handlePagar() {
    if (!user || !userData?.almacenId) return;
    setLoading(true);
    setError("");

    try {
      // 🔥 SIMULACIÓN: En producción, aquí iría Stripe/MercadoPago
      // Se abre el checkout, el usuario paga, y al confirmar se llama activarPlan

      // Simulamos 2 segundos de "procesando pago"
      await new Promise(r => setTimeout(r, 2000));

      await activarPlan(user.uid, userData.almacenId, planSeleccionado, periodo, {
        monto: precioActual,
        metodo: "simulado",
        transactionId: `sim_${Date.now()}`,
      });

      setExito(true);
      setTimeout(() => {
        window.location.reload(); // Recargar para que useAuth detecte el nuevo plan
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al procesar el pago. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Plan activado!</h2>
          <p className="text-gray-600">
            Tu plan <strong>{PRECIOS[planSeleccionado].label}</strong> ha sido activado exitosamente.
          </p>
          <p className="text-sm text-gray-400 mt-4">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">POS Almacén de Barrio</h1>
          </div>
          <button 
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Alerta de suspensión */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800">Tu periodo de prueba ha finalizado</h3>
            <p className="text-sm text-red-700 mt-1">
              Gracias por ser beta tester. Tu acceso gratuito ha terminado. 
              Activa un plan para seguir usando el sistema.
            </p>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Elige tu plan</h2>
          <p className="text-gray-500 mt-2">Sin contratos. Cancela cuando quieras.</p>
        </div>

        {/* Selector de periodo */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setPeriodo("mensual")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                periodo === "mensual" 
                  ? "bg-white text-gray-800 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setPeriodo("anual")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                periodo === "anual" 
                  ? "bg-white text-gray-800 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Anual
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                Ahorra 2 meses
              </span>
            </button>
          </div>
        </div>

        {/* Cards de planes */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Plan Básico */}
          <button
            onClick={() => setPlanSeleccionado("basico")}
            className={`relative bg-white rounded-2xl border-2 p-6 text-left transition hover:shadow-lg ${
              planSeleccionado === "basico" 
                ? "border-blue-500 shadow-md" 
                : "border-gray-200"
            }`}
          >
            {planSeleccionado === "basico" && (
              <div className="absolute -top-3 left-6 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Seleccionado
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Plan Básico</h3>
                <p className="text-xs text-gray-500">Para almacenes de barrio</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-800">{formatMoney(PRECIOS.basico[periodo])}</span>
              <span className="text-gray-500">/{periodo === "mensual" ? "mes" : "año"}</span>
              {periodo === "anual" && (
                <p className="text-xs text-green-600 mt-1">
                  Equivalente a {formatMoney(Math.round(PRECIOS.basico.anual / 12))}/mes
                </p>
              )}
            </div>

            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Hasta 500 productos</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 1 vendedor</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> POS 100% offline</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Ventas y fiados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Control de stock</li>
            </ul>
          </button>

          {/* Plan Pro */}
          <button
            onClick={() => setPlanSeleccionado("pro")}
            className={`relative bg-white rounded-2xl border-2 p-6 text-left transition hover:shadow-lg ${
              planSeleccionado === "pro" 
                ? "border-purple-500 shadow-md" 
                : "border-gray-200"
            }`}
          >
            {planSeleccionado === "pro" && (
              <div className="absolute -top-3 left-6 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Seleccionado
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                Recomendado
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Plan Pro</h3>
                <p className="text-xs text-gray-500">Para negocios en crecimiento</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-800">{formatMoney(PRECIOS.pro[periodo])}</span>
              <span className="text-gray-500">/{periodo === "mensual" ? "mes" : "año"}</span>
              {periodo === "anual" && (
                <p className="text-xs text-green-600 mt-1">
                  Equivalente a {formatMoney(Math.round(PRECIOS.pro.anual / 12))}/mes
                </p>
              )}
            </div>

            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> <strong>Productos ilimitados</strong></li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> <strong>Vendedores ilimitados</strong></li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> POS 100% offline</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Reportes avanzados</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Multi-sucursal</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Ofertas y promociones</li>
            </ul>
          </button>
        </div>

        {/* Resumen de pago */}
        <div className="max-w-md mx-auto mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-bold text-gray-800 mb-4">Resumen</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium">{PRECIOS[planSeleccionado].label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Periodo</span>
              <span className="font-medium">{periodo === "mensual" ? "Mensual" : "Anual (12 meses)"}</span>
            </div>
            {ahorroAnual > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Ahorro anual</span>
                <span className="font-medium">{formatMoney(ahorroAnual)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total a pagar</span>
              <span>{formatMoney(precioActual)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handlePagar}
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
            ) : (
              <><CreditCard size={18} /> Pagar {formatMoney(precioActual)}</>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            🔒 Pago seguro. En producción se conectará con Webpay o MercadoPago.
            <br/>Por ahora es una simulación para pruebas.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h3 className="font-bold text-gray-800 mb-4">¿Tienes dudas?</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-left text-sm">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-800 mb-1">¿Puedo cambiar de plan después?</p>
              <p className="text-gray-500">Sí. Puedes upgradear de Básico a Pro pagando solo la diferencia.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-800 mb-1">¿Qué pasa si no pago?</p>
              <p className="text-gray-500">Tu cuenta se suspende pero no se borra. Al pagar, recuperas todo.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-800 mb-1">¿Pago anual tiene descuento?</p>
              <p className="text-gray-500">Sí. Pagas 10 meses y usas 12. Es un ahorro de 2 meses gratis.</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-800 mb-1">¿Mis datos están seguros?</p>
              <p className="text-gray-500">Sí. Toda la información se guarda en Firebase con encriptación.</p>
            </div>
          </div>
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

## File: src/services/betaAuth.js
````javascript
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection } from "firebase/firestore";

const ROLES = { DUEÑO: "dueño" };

function getTrialDates() {
  const now = new Date();
  const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const proGratisUntil = new Date(trialExpiresAt.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
  return {
    trialStartedAt: now.toISOString(),
    trialExpiresAt: trialExpiresAt.toISOString(),
    proGratisUntil: proGratisUntil.toISOString(),
  };
}

// 🔥 FIX #2: Unificado a "codigosBeta"
export async function validarCodigoBeta(codigo) {
  if (!codigo || codigo.trim() === "") return { valido: false, mensaje: "Ingresa un código de invitación." };
  const cleanCode = codigo.trim().toUpperCase();
  const codeRef = doc(db, "codigosBeta", cleanCode);
  const snap = await getDoc(codeRef);
  if (!snap.exists()) return { valido: false, mensaje: "Código de invitación no válido." };
  const data = snap.data();
  if (data.activo === false) return { valido: false, mensaje: "Este código ha sido desactivado." };
  const usados = data.usados || 0;
  const maximo = data.usosMaximos || 1;
  if (usados >= maximo) return { valido: false, mensaje: "Este código ya alcanzó el límite de usos." };
  return { valido: true, codigoDoc: { id: snap.id, ...data } };
}

export async function registerBetaDueño({ email, password, nombre, nombreAlmacen, codigoBeta }) {
  const validation = await validarCodigoBeta(codigoBeta);
  if (!validation.valido) throw new Error(validation.mensaje);
  const { trialStartedAt, trialExpiresAt, proGratisUntil } = getTrialDates();
  const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await updateProfile(result.user, { displayName: nombre });
  const uid = result.user.uid;
  const almacenRef = doc(collection(db, "almacenes"));
  
  await setDoc(almacenRef, { nombre: nombreAlmacen.trim(), dueñoId: uid, plan: "trial_pro", trialStartedAt, trialExpiresAt, proGratisUntil, createdAt: new Date().toISOString() });
  
  const userData = { email: email.trim().toLowerCase(), nombre, role: ROLES.DUEÑO, almacenId: almacenRef.id, plan: "trial_pro", trialStartedAt, trialExpiresAt, proGratisUntil, createdAt: new Date().toISOString() };
  await setDoc(doc(db, "users", uid), userData);
  
  // 🔥 FIX #2: Unificado a "codigosBeta"
  const codeRef = doc(db, "codigosBeta", codigoBeta.trim().toUpperCase());
  await runTransaction(db, async (transaction) => {
    const codeSnap = await transaction.get(codeRef);
    if (!codeSnap.exists()) throw new Error("Código no encontrado");
    const codeData = codeSnap.data();
    const usados = (codeData.usados || 0) + 1;
    if (usados > (codeData.usosMaximos || 1)) throw new Error("Código agotado");
    transaction.update(codeRef, { usados, updatedAt: new Date().toISOString() });
  });
  return { user: result.user, userData, almacenId: almacenRef.id };
}

export async function crearCodigoBeta({ codigo, usosMaximos = 1, notas = "" }) {
  const cleanCode = codigo.trim().toUpperCase();
  const existing = await getDoc(doc(db, "codigosBeta", cleanCode));
  if (existing.exists()) throw new Error(`El código "${cleanCode}" ya existe.`);
  await setDoc(doc(db, "codigosBeta", cleanCode), { codigo: cleanCode, usosMaximos: Number(usosMaximos) || 1, usados: 0, activo: true, notas: notas || "", createdAt: new Date().toISOString() });
  return { id: cleanCode, codigo: cleanCode, usosMaximos, usados: 0, activo: true };
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

// 🔥 FIX #4: Validar duplicados por código de barras antes de crear
export async function createProduct(almacenId, productData) {
  const check = await puedeCrearProducto(almacenId);
  if (!check.permitido) throw new Error(check.mensaje);

  if (productData.codigoBarras && productData.codigoBarras.trim() !== "") {
    const existente = await getProductByBarcode(almacenId, productData.codigoBarras.trim());
    if (existente) {
      throw new Error(`Ya existe un producto con el código de barras "${productData.codigoBarras}". Usa el producto existente o cambia el código.`);
    }
  }

  const data = {
    ...productData,
    almacenId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
}

// 🔥 FIX #4: Validar duplicados por código de barras al actualizar (excluyendo el propio producto)
export async function updateProduct(productId, updates) {
  // Si se actualiza el código de barras, verificar que no exista otro producto con el mismo código
  if (updates.codigoBarras && updates.codigoBarras.trim() !== "") {
    // Necesitamos el almacenId para buscar duplicados
    const currentProduct = await getProduct(productId);
    if (!currentProduct) throw new Error("Producto no encontrado");

    const almacenId = currentProduct.almacenId;
    const existente = await getProductByBarcode(almacenId, updates.codigoBarras.trim());

    // Si existe OTRO producto (distinto al que se está editando) con el mismo código
    if (existente && existente.id !== productId) {
      throw new Error(`Ya existe otro producto con el código de barras "${updates.codigoBarras}".`);
    }
  }

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

// 🔥 FIX: Si hay múltiples productos con el mismo código, devolver el que tenga stock > 0
export async function getProductByBarcode(almacenId, barcode) {
  if (!almacenId || !barcode) return null;
  try {
    const q = query(
      collection(db, COLLECTION),
      where("almacenId", "==", almacenId),
      where("codigoBarras", "==", barcode)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (docs.length === 1) return docs[0];
    const conStock = docs.find(p => (p.stock || 0) > 0);
    if (conStock) return conStock;
    return docs[0];
  } catch (err) {
    const cached = getCachedProducts(almacenId);
    if (cached) {
      const matches = cached.filter(p => p.codigoBarras === barcode);
      if (matches.length === 0) return null;
      if (matches.length === 1) return matches[0];
      const conStock = matches.find(p => (p.stock || 0) > 0);
      return conStock || matches[0];
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

    let res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    let data = await res.json();

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
      data = loginData;
    } else if (!res.ok) {
      if (data.error?.message === "WEAK_PASSWORD") {
        throw new Error("Contraseña muy débil (mínimo 6 caracteres)");
      }
      throw new Error(data.error?.message || "Error al crear vendedor");
    }

    const uid = data.localId;

    await setDoc(doc(db, "users", uid), {
      uid,
      nombre,
      username,
      email,
      role: "vendedor",
      almacenId,
      activo: true,
      privilegios: {
        productos: false,
        mermas: false,
        ofertas: false,
        fiados: true,
        informes: true,
        configuracion: false,
        vendedores: false,
      },
      createdAt: new Date().toISOString(),
    });

    await setDoc(doc(db, "publicUsernames", username), {
      uid,
      email,
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
    const ref = doc(db, "users", uid);
    await updateDoc(ref, {
      passwordPending: nuevaPassword,
      updatedAt: new Date().toISOString(),
    });
  },
};
````

## File: src/services/paymentService.js
````javascript
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

// 🔥 FIX #10: Exportaciones faltantes para PlanUpgrade y PaymentPortal
export const PRECIOS = {
  basico: { label: "Plan Básico", mensual: 5990, anual: 59900 },
  pro: { label: "Plan Pro", mensual: 11990, anual: 119900 }
};

export function formatMoney(val) {
  if (val === undefined || val === null) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", minimumFractionDigits: 0
  }).format(val);
}

export function calcularCompensacion(planActual, periodoActual, planDestino, periodoDestino, fechaInicioActual) {
  const precioNuevo = PRECIOS[planDestino]?.[periodoDestino] || 0;
  const precioActual = PRECIOS[planActual]?.[periodoActual] || 0;
  const inicio = new Date(fechaInicioActual).getTime();
  const ahora = Date.now();
  const diasTranscurridos = Math.max(0, Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24)));
  const diasTotales = periodoActual === "anual" ? 365 : 30;
  const diasRestantes = Math.max(0, diasTotales - diasTranscurridos);
  const valorRestante = (precioActual / diasTotales) * diasRestantes;
  
  const monto = Math.max(0, precioNuevo - valorRestante);
  return {
    monto: Math.round(monto),
    mensaje: `Se prorratean los ${diasRestantes} días restantes de tu plan actual.`,
    prorrateo: true,
    detalle: { precioNuevo, valorRestante: Math.round(valorRestante) }
  };
}

export async function activarPlan(uid, almacenId, plan, periodo, pagoData) {
  const ahora = Date.now();
  const dias = periodo === "anual" ? 365 : 30;
  const planExpiresAt = ahora + (dias * 24 * 60 * 60 * 1000);
  
  await updateDoc(doc(db, "users", uid), {
    plan,
    planPeriodo: periodo,
    planStartedAt: new Date(ahora).toISOString(),
    planExpiresAt: new Date(planExpiresAt).toISOString(),
    ultimoPago: pagoData,
    updatedAt: serverTimestamp()
  });
  
  await updateDoc(doc(db, "almacenes", almacenId), {
    plan,
    updatedAt: serverTimestamp()
  });
}

// 🔥 FIX #1: Comparación de fechas segura (convierte strings ISO a timestamps)
export async function verificarEstadoV2(userData) {
  // Acepta objeto userData directo (evita lectura extra a Firestore)
  const u = userData;
  if (!u) return { estado: "no_encontrado", activo: false, suspendido: true, mensaje: "Usuario no encontrado" };
  
  const ahora = Date.now();
  const plan = u.plan || "basico";

  if (u.role === "admin" || u.isAdmin === true) {
    return { estado: "admin", activo: true, suspendido: false, plan: "admin", mensaje: "Admin ilimitado" };
  }

  const tieneFechas = u.trialExpiresAt || u.proGratisUntil || u.planExpiresAt;
  if (!tieneFechas) {
    return { estado: "activo_legacy", activo: true, suspendido: false, plan, mensaje: "Plan activo (usuario legacy)" };
  }

  // 🔥 FIX #1: Usamos new Date().getTime() para comparar correctamente strings ISO
  if (plan === "trial" && u.trialExpiresAt) {
    const expira = new Date(u.trialExpiresAt).getTime();
    const activo = ahora < expira;
    return { estado: activo ? "trial_activo" : "trial_expirado", activo, suspendido: !activo, plan: "trial", mensaje: activo ? "Trial activo" : "Trial expirado" };
  }

  if (plan === "pro_gratis" && u.proGratisUntil) {
    const expira = new Date(u.proGratisUntil).getTime();
    const activo = ahora < expira;
    return { estado: activo ? "pro_gratis_activo" : "pro_gratis_expirado", activo, suspendido: !activo, plan: "pro_gratis", mensaje: activo ? "Pro gratis activo" : "Pro gratis expirado" };
  }

  if ((plan === "basico" || plan === "pro") && u.planExpiresAt) {
    const expira = new Date(u.planExpiresAt).getTime();
    const activo = ahora < expira;
    return { estado: activo ? `${plan}_activo` : `${plan}_expirado`, activo, suspendido: !activo, plan, mensaje: activo ? `Plan ${plan} activo` : `Plan ${plan} expirado` };
  }

  return { estado: "activo_fallback", activo: true, suspendido: false, plan, mensaje: "Plan activo (fallback)" };
}

export async function autoUpgradeFases(uid, userData) {
  const estado = await verificarEstadoV2(userData);
  const ref = doc(db, "users", uid);
  if (estado.estado === "trial_expirado") {
    await updateDoc(ref, { plan: "basico", trialExpirado: true, updatedAt: serverTimestamp() });
  }
  if (estado.estado === "pro_gratis_expirado") {
    await updateDoc(ref, { plan: "basico", proGratisExpirado: true, updatedAt: serverTimestamp() });
  }
  return estado;
}

export async function activarTrial(uid) {
  const trialExpiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { plan: "trial", trialExpiresAt: new Date(trialExpiresAt).toISOString(), trialIniciado: serverTimestamp(), updatedAt: serverTimestamp() });
  return trialExpiresAt;
}

export async function activarProGratis(uid, dias = 30) {
  const proGratisUntil = Date.now() + dias * 24 * 60 * 60 * 1000;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { plan: "pro_gratis", proGratisUntil: new Date(proGratisUntil).toISOString(), proGratisActivado: serverTimestamp(), updatedAt: serverTimestamp() });
  return proGratisUntil;
}

// 🔥 FIX #2: Unificado a colección "codigosBeta"
export async function validarCodigoBeta(codigo) {
  const ref = doc(db, "codigosBeta", codigo.toUpperCase().trim());
  const snap = await getDoc(ref);
  if (!snap.exists()) return { valido: false, mensaje: "Código no encontrado" };
  const data = snap.data();
  if (data.usado) return { valido: false, mensaje: "Código ya utilizado" };
  if (data.expiresAt && Date.now() > new Date(data.expiresAt).getTime()) return { valido: false, mensaje: "Código expirado" };
  return { valido: true, data, mensaje: "Código válido" };
}

export async function usarCodigoBeta(codigo, uid) {
  const ref = doc(db, "codigosBeta", codigo.toUpperCase().trim());
  await updateDoc(ref, { usado: true, usadoPor: uid, usadoEn: serverTimestamp() });
}
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

## File: src/services/printerService.js
````javascript
// printerService.js
// Impresión de tickets en impresoras térmicas de 58mm/80mm vía Bluetooth (BLE),
// usando la Web Bluetooth API del navegador y comandos ESC/POS crudos.
//
// LIMITACIONES IMPORTANTES (léelas antes de reportar un bug):
// 1. Web Bluetooth SOLO funciona en Chrome/Edge para Android y en Chrome/Edge
//    de escritorio. Safari de iPhone/iPad NO lo soporta (Apple lo bloquea en
//    WebKit) y por lo tanto esta función NO puede imprimir desde un iPhone,
//    sea con Safari o con la app instalada como PWA. Es una limitación del
//    navegador, no de este código.
// 2. Solo funciona con impresoras que soportan Bluetooth LOW ENERGY (BLE).
//    Muchas impresoras térmicas chinas baratas usan Bluetooth Clásico (SPP),
//    que el navegador no puede usar. Si al presionar "Emparejar impresora" no
//    aparece tu impresora en la lista, probablemente sea Bluetooth Clásico y
//    esta función no podrá usarla (se necesitaría una app nativa, no una web).
// 3. La primera vez que se imprime en cada sesión del navegador, Chrome pedirá
//    elegir el dispositivo Bluetooth (esto lo exige el navegador por seguridad,
//    no se puede omitir). Mientras la pestaña/app siga abierta, no debería
//    volver a pedirlo.

// UUIDs de servicio/característica más comunes en impresoras térmicas BLE
// genéricas (módulos tipo "BT" usados por marcas como Goojprt, MPT-II, POS58,
// Rongta, y varios clones sin marca que se venden en Chile). Si tu impresora
// no conecta con estos, prueba el modo "auto-detectar" que revisa todos los
// servicios del dispositivo buscando una característica que acepte escritura.
const SERVICE_UUID_CANDIDATES = [
  "000018f0-0000-1000-8000-00805f9b34fb",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
];

const STORAGE_KEY = "pos_printer_config";

let cachedDevice = null;
let cachedCharacteristic = null;

export function getPrinterConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { habilitada: false, nombreDispositivo: null };
  } catch {
    return { habilitada: false, nombreDispositivo: null };
  }
}

export function setPrinterConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function isWebBluetoothSupported() {
  return typeof navigator !== "undefined" && !!navigator.bluetooth;
}

export function isConnected() {
  return !!(cachedDevice && cachedDevice.gatt && cachedDevice.gatt.connected);
}

// Busca, entre TODOS los servicios/características del dispositivo, la primera
// característica que acepte escritura. Sirve como respaldo cuando la
// impresora no usa ninguno de los UUIDs conocidos de arriba.
async function encontrarCaracteristicaEscritura(server) {
  const services = await server.getPrimaryServices();
  for (const service of services) {
    const chars = await service.getCharacteristics();
    const writable = chars.find((c) => c.properties.write || c.properties.writeWithoutResponse);
    if (writable) return writable;
  }
  return null;
}

async function obtenerCaracteristica(server) {
  for (const uuid of SERVICE_UUID_CANDIDATES) {
    try {
      const service = await server.getPrimaryService(uuid);
      const chars = await service.getCharacteristics();
      const writable = chars.find((c) => c.properties.write || c.properties.writeWithoutResponse);
      if (writable) return writable;
    } catch {
      // este dispositivo no tiene ese servicio, se prueba el siguiente
    }
  }
  return encontrarCaracteristicaEscritura(server);
}

// Abre el selector de dispositivos Bluetooth del navegador. Debe llamarse
// directamente desde un click del usuario (requisito de seguridad del navegador).
export async function emparejarImpresora() {
  if (!isWebBluetoothSupported()) {
    throw new Error(
      "Este navegador no soporta Bluetooth web. En iPhone no es posible (limitación de Apple); en Android usa Chrome."
    );
  }
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: SERVICE_UUID_CANDIDATES,
  });
  const server = await device.gatt.connect();
  const characteristic = await obtenerCaracteristica(server);
  if (!characteristic) {
    throw new Error(
      "Se conectó al dispositivo pero no se encontró una característica de escritura. Puede que esta impresora no sea compatible con Web Bluetooth."
    );
  }
  cachedDevice = device;
  cachedCharacteristic = characteristic;
  setPrinterConfig({ habilitada: true, nombreDispositivo: device.name || "Impresora Bluetooth" });
  device.addEventListener("gattserverdisconnected", () => {
    cachedCharacteristic = null;
  });
  return device.name || "Impresora Bluetooth";
}

async function asegurarConexion() {
  if (isConnected() && cachedCharacteristic) return cachedCharacteristic;
  if (cachedDevice) {
    // Ya se emparejó antes en esta sesión: se puede reconectar sin volver a
    // mostrar el selector.
    const server = await cachedDevice.gatt.connect();
    cachedCharacteristic = await obtenerCaracteristica(server);
    if (cachedCharacteristic) return cachedCharacteristic;
  }
  // No hay dispositivo en memoria (recién se abrió la app/pestaña): hay que
  // volver a pedirle al usuario que elija la impresora.
  await emparejarImpresora();
  return cachedCharacteristic;
}

function quitarTildes(texto) {
  // Muchas impresoras térmicas baratas no soportan UTF-8 ni acentos/ñ
  // correctamente. Para que el ticket se lea bien SIEMPRE, se reemplazan por
  // su equivalente sin tilde antes de imprimir.
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7E]/g, (c) => (c === "\u00f1" || c === "\u00d1" ? (c === "\u00f1" ? "n" : "N") : c));
}

const ESC = 0x1b;
const GS = 0x1d;

function construirComandosTicket({ almacenNombre, fecha, vendedor, productos, total, descuento, totalSinDescuento, metodoPago }) {
  const bytes = [];
  const push = (arr) => bytes.push(...arr);
  const texto = (s) => push(Array.from(new TextEncoder().encode(quitarTildes(s))));
  const linea = (s = "") => { texto(s); push([0x0a]); };

  push([ESC, 0x40]); // init
  push([ESC, 0x61, 0x01]); // centrar
  push([ESC, 0x45, 0x01]); // negrita ON
  linea(almacenNombre || "Almacen");
  push([ESC, 0x45, 0x00]); // negrita OFF
  linea(fecha);
  linea("--------------------------------");
  push([ESC, 0x61, 0x00]); // alinear izquierda

  productos.forEach((p) => {
    linea(`${p.cantidad} x ${p.nombre}`);
    const totalStr = `$${Number(p.total).toLocaleString("es-CL")}`;
    linea(`${" ".repeat(Math.max(0, 32 - totalStr.length))}${totalStr}`);
  });

  linea("--------------------------------");
  if (descuento) {
    linea(`Subtotal: $${Number(totalSinDescuento).toLocaleString("es-CL")}`);
    linea(`Descuento: -$${Number(descuento).toLocaleString("es-CL")}`);
  }
  push([ESC, 0x45, 0x01]);
  linea(`TOTAL: $${Number(total).toLocaleString("es-CL")}`);
  push([ESC, 0x45, 0x00]);
  linea(`Pago: ${metodoPago}`);
  if (vendedor) linea(`Atendido por: ${vendedor}`);
  linea("");
  push([ESC, 0x61, 0x01]);
  linea("Gracias por su compra!");
  push([0x0a, 0x0a, 0x0a, 0x0a]);
  // No se envía comando de corte automático: muchas impresoras térmicas de
  // 58mm de bajo costo no tienen cuchilla y el comando de corte queda
  // ignorado o produce un error. Si tu impresora SÍ corta automáticamente,
  // puedes agregar aquí: push([GS, 0x56, 0x00]);

  return new Uint8Array(bytes);
}

// Envía los bytes en trozos pequeños (los módulos BLE de estas impresoras
// suelen aceptar ~20 bytes por escritura) con una pequeña pausa entre cada
// uno para no saturar el buffer del dispositivo.
async function enviarPorPartes(characteristic, data) {
  const CHUNK = 20;
  for (let i = 0; i < data.length; i += CHUNK) {
    const chunk = data.slice(i, i + CHUNK);
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValue(chunk);
    }
    await new Promise((r) => setTimeout(r, 20));
  }
}

// receiptData: { almacenNombre, vendedor, productos:[{nombre,cantidad,total}],
//                total, descuento, totalSinDescuento, metodoPago }
export async function imprimirTicket(receiptData) {
  const characteristic = await asegurarConexion();
  if (!characteristic) throw new Error("No se pudo conectar con la impresora");
  const datos = construirComandosTicket({
    fecha: new Date().toLocaleString("es-CL"),
    ...receiptData,
  });
  await enviarPorPartes(characteristic, datos);
}

export function desconectarImpresora() {
  if (cachedDevice && cachedDevice.gatt && cachedDevice.gatt.connected) {
    cachedDevice.gatt.disconnect();
  }
  cachedDevice = null;
  cachedCharacteristic = null;
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
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CanjearCodigo from "./components/CanjearCodigo";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: canjear código beta (no requiere login) */}
          <Route path="/canjear-beta" element={<CanjearCodigo />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard con todas las rutas internas */}
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
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

    // ─── Funciones helpers (solo ASCII) ───
    function isAuthenticated() {
      return request.auth != null;
    }
    function isDueno() {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data["role"] == "dueño";
    }
    function isVendedor() {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data["role"] == "vendedor";
    }
    function belongsToAlmacen(almacenId) {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data["almacenId"] == almacenId;
    }
    function isDuenoOfAlmacen(almacenId) {
      return isDueno() && belongsToAlmacen(almacenId);
    }
    function isSameUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    function isNotSuspended() {
      return isAuthenticated() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data["plan"] != "suspendido";
    }

    // ─── Beta Codes ───
    match /beta_codes/{code} {
      allow read: if true;
      allow create: if isDueno();
      allow update: if isDueno();
      allow delete: if isDueno();
    }

    // ─── Users ───
    match /users/{userId} {
      allow create: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data["role"] == "dueño"
        && request.resource.data.keys().hasAll(["email", "nombre", "role", "almacenId", "plan"]);

      allow read: if isSameUser(userId) || isDueno();

      allow update: if isSameUser(userId)
        && (
          (resource.data["plan"] == "suspendido" && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["plan", "planPeriodo", "planStartedAt", "planExpiresAt", "planActivatedAt", "suspendido", "ultimoPago", "updatedAt"]))
          ||
          (resource.data["plan"] != "suspendido" && (
            request.resource.data.diff(resource.data).affectedKeys().hasOnly(["plan", "planPeriodo", "planStartedAt", "planExpiresAt", "planActivatedAt", "ultimoPago", "updatedAt", "nombre", "photoURL", "privilegios"])
            || isDueno()
          ))
        );

      allow delete: if isDueno();
    }

    // ─── Almacenes ───
    match /almacenes/{almacenId} {
      allow create: if request.auth != null 
        && request.resource.data["dueñoId"] == request.auth.uid
        && request.resource.data.keys().hasAll(["nombre", "dueñoId", "plan", "createdAt"]);

      allow read: if isDuenoOfAlmacen(almacenId);

      allow update: if isDuenoOfAlmacen(almacenId)
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["plan", "planExpiresAt", "updatedAt", "nombre"]);

      allow delete: if false;
    }

    // ─── Productos ───
    match /productos/{productoId} {
      allow read: if isAuthenticated() && belongsToAlmacen(resource.data["almacenId"]);
      allow create: if isAuthenticated() 
        && belongsToAlmacen(request.resource.data["almacenId"])
        && isNotSuspended();
      allow update: if isAuthenticated() 
        && belongsToAlmacen(resource.data["almacenId"])
        && isNotSuspended();
      allow delete: if isDuenoOfAlmacen(resource.data["almacenId"]);
    }

    // ─── Ventas ───
    match /ventas/{ventaId} {
      allow read: if isAuthenticated() && belongsToAlmacen(resource.data["almacenId"]);
      allow create: if isAuthenticated() 
        && belongsToAlmacen(request.resource.data["almacenId"])
        && isNotSuspended();
      allow update: if isDuenoOfAlmacen(resource.data["almacenId"]);
      allow delete: if false;
    }

    // ─── Turnos ───
    match /turnos/{turnoId} {
      allow read: if isAuthenticated() && belongsToAlmacen(resource.data["almacenId"]);
      allow create: if isAuthenticated() 
        && belongsToAlmacen(request.resource.data["almacenId"])
        && isNotSuspended();
      allow update: if isAuthenticated() && belongsToAlmacen(resource.data["almacenId"]);
      allow delete: if false;
    }

    // ─── Fiados ───
    match /fiados/{fiadoId} {
      allow read: if isAuthenticated() && belongsToAlmacen(resource.data["almacenId"]);
      allow create: if isAuthenticated() 
        && belongsToAlmacen(request.resource.data["almacenId"])
        && isNotSuspended();
      allow update: if isAuthenticated() && belongsToAlmacen(resource.data["almacenId"]);
      allow delete: if isDuenoOfAlmacen(resource.data["almacenId"]);
    }

    // ─── Configuración de impresora ───
    match /printerConfig/{configId} {
      allow read: if isAuthenticated() && belongsToAlmacen(resource.data["almacenId"]);
      allow write: if isDuenoOfAlmacen(request.resource.data["almacenId"]);
    }

    // ─── Usernames públicos ───
    match /publicUsernames/{username} {
      allow read: if true;
      allow create: if isDueno();
      allow update: if false;
      allow delete: if isDueno();
    }

    // ─── Planes / Límites ───
    match /planLimits/{docId} {
      allow read: if true;
      allow write: if false;
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
# 🎁 Sistema de Códigos Beta — Loventa POS

## 📁 Estructura del paquete

```
src/
├── services/
│   └── paymentService.js          ← Compatibilidad legacy + funciones beta
├── components/
│   ├── BetaCodesAdmin.jsx         ← Panel admin para crear códigos
│   ├── CanjearCodigo.jsx          ← Formulario para canjear códigos
│   └── Navbar.jsx                 ← Navbar con botón "Códigos Beta"
├── pages/
│   ├── Dashboard.jsx              ← Rutas del dashboard (incluye /admin-beta)
│   └── Login.jsx                  ← Login accesible (sin warnings)
└── App.jsx                        ← Rutas principales (incluye /canjear-beta)
```

---

## 🚀 Instalación (1 solo paso)

Copia cada archivo a la ruta correspondiente en tu proyecto, **reemplazando** los existentes.

---

## 🔐 Paso obligatorio: Configurar tu UID de admin

Abre `src/components/BetaCodesAdmin.jsx`, línea 18.

Reemplaza esto:
```jsx
const ADMIN_UIDS = [
  // "PEGA-TU-UID-AQUI",
];
```

Por esto (con TU UID real):
```jsx
const ADMIN_UIDS = [
  "tu-uid-de-firebase-aqui",
];
```

### ¿Cómo obtener tu UID?
1. Abre tu app en el navegador y loguéate con tu cuenta de dueño
2. Presiona **F12** → pestaña **Console**
3. Pega y ejecuta:
   ```js
   console.log(JSON.parse(localStorage.getItem("pos_offline_session")).uid)
   ```
4. Copia el string que aparece (ej: `"AbC123XyZ..."`)
5. Pégalo en `ADMIN_UIDS`

> ⚠️ **Sin este paso, el panel admin mostrará "Acceso Restringido" para TODOS, incluyéndote a ti.**

---

## 🔄 Flujo de uso

### 1. Crear un código beta (como admin)
1. Entra a tu app como dueño
2. En el Navbar, haz clic en **🔑 Códigos Beta**
3. Completa el formulario:
   - **Código**: déjalo vacío para auto-generar, o escribe uno personalizado
   - **Días Pro**: cuántos días de plan Pro gratis otorga (ej: 30)
   - **Cantidad**: cuántos códigos crear (ej: 10)
4. Haz clic en **➕ Crear Código(s)**
5. El código aparece en la tabla con estado 🟢 Activo

### 2. Canjear un código beta (como usuario nuevo)
1. El usuario nuevo entra a: `https://tu-app.com/canjear-beta`
2. Ingresa el código (ej: `ABC12345`) y haz clic en **🎁 Canjear Código**
3. Si es válido:
   - Su plan cambia a **pro_gratis**
   - Tiene acceso Pro por los días configurados
   - El código queda marcado como ✅ Usado
4. Cuando expire, `paymentService.js` lo baja automáticamente a plan **básico**

---

## 🛠️ Qué arregla cada archivo

| Archivo | Problema original | Solución |
|---------|------------------|----------|
| `paymentService.js` | Usuarios creados antes del sistema de pagos quedaban suspendidos (sin fechas de expiración) | Detecta usuarios "legacy" sin fechas y los marca como activos automáticamente |
| `BetaCodesAdmin.jsx` | Cualquier dueño podía crear códigos beta | Solo los UIDs en `ADMIN_UIDS` pueden crear códigos. Muestra "Acceso Restringido" para el resto |
| `CanjearCodigo.jsx` | No existía | Nuevo componente para que usuarios canjeen códigos y activen Pro gratis |
| `Login.jsx` | Warnings de DevTools: inputs sin `id`/`name`, labels sin `htmlFor` | Todos los campos tienen atributos de accesibilidad correctos. Autocompletado del navegador funciona |
| `Dashboard.jsx` | No tenía ruta para el panel admin | Agrega `/admin-beta` protegida por `isDueño` |
| `Navbar.jsx` | No tenía botón para acceder al panel admin | Agrega botón **🔑 Códigos Beta** visible solo para dueños |
| `App.jsx` | No tenía ruta pública para canjear códigos | Agrega `/canjear-beta` accesible sin login |

---

## ⚠️ Notas importantes

- **No modifiques** `firestore.rules` para restringir `codigosBeta` por ahora. El control de acceso se hace por UID en el frontend.
- Los códigos beta son **de un solo uso**. Una vez canjeados, no se pueden reutilizar.
- Los códigos pueden tener **fecha de expiración**. Si expiran antes de ser usados, el usuario verá "Código expirado".
- El plan **pro_gratis** es distinto de **pro** pagado. Cuando expire, el usuario baja a **básico**, no a **pro expirado**.

---

## 🆘 Si algo no funciona

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| "Acceso Restringido" en panel admin | No pusiste tu UID en `ADMIN_UIDS` | Sigue el paso "Configurar tu UID de admin" arriba |
| "Error al cargar códigos" | No existe la colección `codigosBeta` en Firestore | Crea un código manualmente desde el panel, o crea la colección vacía en Firebase Console |
| "Error al canjear: Código no encontrado" | El código no existe o tiene espacios | Verifica que el código esté escrito exactamente igual (mayúsculas) |
| Mi cuenta sigue suspendida | `paymentService.js` no se está usando en `useAuth.jsx` | Verifica que `useAuth.jsx` importe `verificarEstadoV2` y `autoUpgradeFases` de `paymentService.js` |

---

Generado para Loventa POS — Almacén de Barrio v5.0
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

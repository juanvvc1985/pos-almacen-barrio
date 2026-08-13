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
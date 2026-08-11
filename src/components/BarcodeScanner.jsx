import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, Smartphone } from "lucide-react";

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// Formatos que soportamos: códigos de barras lineales + QR
const FORMATOS_SOPORTADOS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.QR_CODE,
];

export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState("");
  const [modoFoto, setModoFoto] = useState(isIOS());
  const [procesando, setProcesando] = useState(false);
  const scannerRef = useRef(null);
  const activeRef = useRef(true);
  const fileInputRef = useRef(null);
  const hiddenReaderRef = useRef(null);

  // Modo cámara en vivo
  useEffect(() => {
    if (modoFoto) return;
    const container = document.getElementById("scanner-container");
    if (!container) return;
    activeRef.current = true;

    const scanner = new Html5Qrcode("scanner-container", false);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, formatsToSupport: FORMATOS_SOPORTADOS },
        (decodedText) => {
          onScan(decodedText);
          onClose();
        },
        () => {}
      )
      .then(() => {
        if (!activeRef.current) {
          scanner.stop().then(() => scanner.clear()).catch(() => {});
        }
      })
      .catch((err) => {
        if (activeRef.current) {
          setError("No se pudo iniciar la cámara. Asegúrate de dar permisos.");
          console.error(err);
        }
      });

    return () => {
      activeRef.current = false;
      const s = scannerRef.current;
      if (!s) return;
      if (s.getState() === Html5QrcodeScannerState.SCANNING) {
        s.stop().then(() => s.clear()).catch(() => {});
      }
    };
  }, [onScan, onClose, modoFoto]);

  // Modo foto - procesar imagen seleccionada con TODOS los formatos habilitados
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setProcesando(true);

    let scanner = null;
    try {
      // Crear instancia con elemento oculto y formatos configurados
      scanner = new Html5Qrcode("hidden-reader", false);

      const config = {
        formatsToSupport: FORMATOS_SOPORTADOS,
      };

      const decodedText = await scanner.scanFile(file, false, config);
      onScan(decodedText);
      onClose();
    } catch (err) {
      console.error("Error escaneando foto:", err);
      setError("No se detectó código en la foto. Intenta con mejor iluminación, más cerca y sin reflejos.");
    } finally {
      setProcesando(false);
      // Limpiar scanner oculto
      if (scanner) {
        try {
          await scanner.clear();
        } catch (e) { /* ignorar */ }
      }
      // Resetear input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
      {/* Elemento oculto para html5-qrcode en modo foto */}
      <div id="hidden-reader" ref={hiddenReaderRef} style={{ display: "none", width: 0, height: 0 }} />

      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white">
            <Camera size={20} />
            <span className="font-medium">Escanear código</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Selector de modo */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setModoFoto(false); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
              !modoFoto ? "bg-blue-600 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Camera size={16} /> Cámara en vivo
          </button>
          <button
            onClick={() => { setModoFoto(true); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
              modoFoto ? "bg-blue-600 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Smartphone size={16} /> Tomar foto
          </button>
        </div>

        {modoFoto ? (
          /* Modo foto */
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Camera size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-2">Toma una foto del código de barras</p>
            <p className="text-gray-500 text-sm mb-4">
              Asegúrate de que el código sea legible y haya buena luz.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={procesando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {procesando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Camera size={20} /> Abrir cámara
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 mt-3">
              En iPhone usa este modo. La cámara en vivo requiere HTTPS.
            </p>
          </div>
        ) : (
          /* Modo cámara en vivo */
          <div
            id="scanner-container"
            className="w-full aspect-square bg-black rounded-xl overflow-hidden"
          />
        )}

        <p className="text-white/70 text-sm text-center mt-4">
          {modoFoto
            ? "Toma la foto y el sistema detectará el código automáticamente"
            : "Apunta la cámara al código de barras"}
        </p>
      </div>
    </div>
  );
}

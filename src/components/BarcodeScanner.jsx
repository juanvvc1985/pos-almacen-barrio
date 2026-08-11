import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { X, Camera, Smartphone, Image } from "lucide-react";

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isSafari() {
  const ua = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
}

export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState("");
  const [modoFoto, setModoFoto] = useState(isIOS() || isSafari());
  const scannerRef = useRef(null);
  const activeRef = useRef(true);
  const fileInputRef = useRef(null);

  // Modo cámara en vivo (Android / Chrome desktop)
  useEffect(() => {
    if (modoFoto) return; // iPhone usa modo foto
    if (!document.getElementById("scanner-container")) return;
    activeRef.current = true;

    const scanner = new Html5Qrcode("scanner-container");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          onClose();
        },
        () => {}
      )
      .then(() => {
        if (!activeRef.current) {
          scanner
            .stop()
            .then(() => scanner.clear())
            .catch(() => {});
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
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
      }
    };
  }, [onScan, onClose, modoFoto]);

  // Modo foto (iPhone / Safari / HTTP)
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    const scanner = new Html5Qrcode("dummy-reader");
    try {
      const result = await scanner.scanFile(file, false);
      onScan(result);
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se detectó código en la foto. Intenta de nuevo con mejor iluminación.");
    }
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
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
          /* Modo foto - funciona en iPhone/Safari/HTTP */
          <div className="bg-white rounded-xl p-6 text-center">
            <Image size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="text-gray-700 font-medium mb-2">Toma una foto del código de barras</p>
            <p className="text-gray-500 text-sm mb-4">
              Apunta bien, asegúrate de que el código sea legible y haya buena luz.
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Camera size={20} /> Abrir cámara
            </button>
            <p className="text-xs text-gray-400 mt-3">
              En iPhone/Safari usa este modo. La cámara en vivo requiere HTTPS.
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

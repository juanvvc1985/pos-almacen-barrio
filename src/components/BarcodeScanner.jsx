import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { X, Camera, Upload, Smartphone } from "lucide-react";

export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState("");
  const [mode, setMode] = useState("camera"); // "camera" | "file"
  const [isStarting, setIsStarting] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeRef = useRef(true);

  // Detectar iPhone/Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const stopScanner = useCallback(async () => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      if (s.getState() === Html5QrcodeScannerState.SCANNING) {
        await s.stop();
      }
      await s.clear();
    } catch {
      // ignorar errores de limpieza
    }
    scannerRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setError("");
    setIsStarting(true);

    if (!containerRef.current) {
      setIsStarting(false);
      return;
    }

    activeRef.current = true;

    try {
      await stopScanner();
    } catch {
      // nada
    }

    const scanner = new Html5Qrcode("scanner-container");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          onClose();
        },
        () => {} // ignorar errores de frame
      );

      if (!activeRef.current) {
        await stopScanner();
      }
    } catch (err) {
      console.error(err);
      if (activeRef.current) {
        setError(
          "No se pudo iniciar la cámara. " +
          (isIOS
            ? "En iPhone usa la opción 'Elegir archivo' abajo."
            : "Verifica que diste permisos de cámara.")
        );
        // Si falla la cámara, ofrecer modo archivo automáticamente en iOS
        if (isIOS) setMode("file");
      }
    } finally {
      setIsStarting(false);
    }
  }, [onScan, onClose, stopScanner, isIOS]);

  const handleFileSelect = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError("");
      const scanner = new Html5Qrcode("file-scanner-container");

      try {
        const result = await scanner.scanFile(file, true);
        onScan(result);
        onClose();
      } catch (err) {
        console.error(err);
        setError("No se pudo leer el código en la imagen. Intenta con otra foto más nítida.");
      } finally {
        scanner.clear().catch(() => {});
      }
    },
    [onScan, onClose]
  );

  useEffect(() => {
    return () => {
      activeRef.current = false;
      stopScanner();
    };
  }, [stopScanner]);

  const containerRef = useRef(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col items-center justify-center p-4">
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
            onClick={() => setMode("camera")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
              mode === "camera"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Camera size={16} />
            Cámara
          </button>
          <button
            onClick={() => setMode("file")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
              mode === "file"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Upload size={16} />
            {isIOS ? "Elegir foto" : "Subir imagen"}
          </button>
        </div>

        {mode === "camera" ? (
          <>
            {/* En iOS mostramos botón de inicio explícito */}
            {isIOS && (
              <button
                onClick={startCamera}
                disabled={isStarting}
                className="w-full mb-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-3 rounded-xl font-medium transition"
              >
                <Smartphone size={18} />
                {isStarting ? "Iniciando cámara..." : "Iniciar cámara"}
              </button>
            )}

            <div
              id="scanner-container"
              ref={containerRef}
              className="w-full aspect-square bg-black rounded-xl overflow-hidden"
            />

            {/* En Android/PC iniciamos automáticamente al montar */}
            {!isIOS && (
              <AutoStart startCamera={startCamera} />
            )}

            <p className="text-white/70 text-sm text-center mt-4">
              {isIOS
                ? "Presiona 'Iniciar cámara' y apunta al código"
                : "Apunta la cámara al código de barras"}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div
              id="file-scanner-container"
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-6 rounded-xl transition"
            >
              <Upload size={40} />
              <span className="font-medium">
                {isIOS ? "Tomar foto del código" : "Seleccionar imagen del código"}
              </span>
            </button>
            <p className="text-white/50 text-xs text-center max-w-xs">
              {isIOS
                ? "Se abrirá la cámara nativa del iPhone. Toma la foto y confirma."
                : "Puedes tomar una foto directamente o elegir una de la galería."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-componente para iniciar automáticamente en Android/PC (no iOS)
function AutoStart({ startCamera }) {
  const started = useRef(false);
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      startCamera();
    }
  }, [startCamera]);
  return null;
}

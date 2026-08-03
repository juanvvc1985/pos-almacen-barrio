import { useEffect, useRef, useState } from "react";
import { X, Camera, Upload } from "lucide-react";

let Html5Qrcode;
try {
  const mod = await import("html5-qrcode");
  Html5Qrcode = mod.Html5Qrcode;
} catch {
  Html5Qrcode = null;
}

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [modo, setModo] = useState("camara"); // "camara" o "archivo"

  useEffect(() => {
    if (!Html5Qrcode || modo !== "camara") return;

    let scanner;
    let isMounted = true;

    async function start() {
      try {
        scanner = new Html5Qrcode("scanner-video");
        if (!isMounted) return;

        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length > 0) {
          const backCamera = devices.find((d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("trasera") ||
            d.label.toLowerCase().includes("environment")
          );
          const cameraId = backCamera ? backCamera.id : devices[0].id;

          await scanner.start(
            cameraId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              onScan(decodedText);
              onClose();
            },
            () => {}
          );
        } else {
          setError("No se encontró cámara. Usa la opción de subir foto.");
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo acceder a la cámara. Usa la opción de subir foto.");
      }
    }

    start();

    return () => {
      isMounted = false;
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [modo]);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !Html5Qrcode) return;

    try {
      const scanner = new Html5Qrcode("temp-scanner");
      const result = await scanner.scanFile(file, false);
      onScan(result);
      onClose();
    } catch {
      setError("No se pudo leer el código de barras de la imagen. Intenta otra foto.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Escanear código de barras</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Selector de modo */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setModo("camara"); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                modo === "camara"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Camera size={16} className="inline mr-1" /> Cámara
            </button>
            <button
              onClick={() => { setModo("archivo"); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                modo === "archivo"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Upload size={16} className="inline mr-1" /> Subir foto
            </button>
          </div>

          {modo === "camara" && (
            <>
              <div
                id="scanner-video"
                ref={scannerRef}
                className="w-full aspect-[4/3] bg-black rounded-lg overflow-hidden"
              />
              {error && (
                <p className="text-sm text-red-600 mt-3 text-center bg-red-50 p-2 rounded">
                  {error}
                </p>
              )}
            </>
          )}

          {modo === "archivo" && (
            <div className="text-center py-8">
              <Upload size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 mb-4">
                Toma una foto del código de barras y súbela aquí.
                Funciona en todos los celulares.
              </p>
              <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Camera size={18} className="inline mr-2" />
                Tomar foto / Elegir archivo
              </label>
              <p className="text-xs text-gray-400 mt-3">
                En iPhone: usa Safari y permite acceso a la cámara
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

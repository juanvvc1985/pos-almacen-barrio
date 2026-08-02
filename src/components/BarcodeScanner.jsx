import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera } from "lucide-react";

export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

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
      .catch((err) => {
        setError("No se pudo iniciar la cámara. Asegúrate de dar permisos.");
        console.error(err);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
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

        <div
          id="scanner-container"
          ref={containerRef}
          className="w-full aspect-square bg-black rounded-xl overflow-hidden"
        />

        <p className="text-white/70 text-sm text-center mt-4">
          Apunta la cámara al código de barras
        </p>
      </div>
    </div>
  );
}

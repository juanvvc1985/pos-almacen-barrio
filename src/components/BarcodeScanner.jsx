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
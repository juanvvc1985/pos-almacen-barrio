import { useState, useRef, useCallback, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { X, Camera, Image as ImageIcon, Scan, AlertTriangle, Keyboard } from 'lucide-react';

// ───────────────────────────────────────────────
// LECTOR ZXING CONFIGURADO PARA EAN-13 Y MÁS
// ───────────────────────────────────────────────
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
  reader.timeBetweenDecodingAttempts = 100;
  return reader;
};

// ───────────────────────────────────────────────
// LEER ORIENTACIÓN EXIF DEL IPHONE
// ───────────────────────────────────────────────
const getExifOrientation = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target.result);
      if (view.getUint16(0, false) !== 0xFFD8) { resolve(-1); return; }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        const marker = view.getUint16(offset, false);
        if (marker === 0xFFE1) {
          const exifOffset = offset + 4;
          if (view.getUint32(exifOffset, false) === 0x45786966) {
            const tiffOffset = exifOffset + 6;
            const little = view.getUint16(tiffOffset, false) === 0x4949;
            const dirOffset = view.getUint32(tiffOffset + 4, little);
            const entries = view.getUint16(tiffOffset + dirOffset, little);
            for (let i = 0; i < entries; i++) {
              const entryOffset = tiffOffset + dirOffset + 2 + i * 12;
              if (view.getUint16(entryOffset, little) === 0x0112) {
                resolve(view.getUint16(entryOffset + 8, little));
                return;
              }
            }
          }
          offset += 2 + view.getUint16(offset + 2, false);
        } else if (marker === 0xFFD9) {
          break;
        } else {
          offset += 2 + view.getUint16(offset + 2, false);
        }
      }
      resolve(-1);
    };
    reader.onerror = () => resolve(-1);
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
};

// ───────────────────────────────────────────────
// CORREGIR ORIENTACIÓN DE IMAGEN
// ───────────────────────────────────────────────
const fixImageOrientation = (img, orientation) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const w = img.naturalWidth || img.width || 300;
  const h = img.naturalHeight || img.height || 300;

  if (orientation > 4) {
    canvas.width = h;
    canvas.height = w;
  } else {
    canvas.width = w;
    canvas.height = h;
  }

  ctx.save();
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, w, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, w, h); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, h); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, h, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, h, w); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, w); break;
    default: break;
  }
  ctx.drawImage(img, 0, 0);
  ctx.restore();
  return canvas;
};

// ───────────────────────────────────────────────
// ESTRATEGIA PRINCIPAL: ZXing desde imagen
// ───────────────────────────────────────────────
const scanWithZXing = async (file) => {
  const reader = createZXingReader();
  const url = URL.createObjectURL(file);

  try {
    // 1. Intentar decodificar directamente desde la URL de la imagen
    const result = await reader.decodeFromImageUrl(url);
    if (result) return result.getText();
  } catch {
    // 2. Si falla, corregir orientación EXIF y reintentar desde canvas
    try {
      const orientation = await getExifOrientation(file);
      const img = new Image();
      img.src = url;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const fixedCanvas = fixImageOrientation(img, orientation > 0 ? orientation : 1);
      const result2 = await reader.decodeFromCanvas(fixedCanvas);
      if (result2) return result2.getText();
    } catch {
      // 3. Último intento: rotar la imagen en múltiples ángulos
      try {
        const img = new Image();
        img.src = url;
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

        const baseCanvas = document.createElement('canvas');
        baseCanvas.width = img.naturalWidth;
        baseCanvas.height = img.naturalHeight;
        baseCanvas.getContext('2d').drawImage(img, 0, 0);

        const rotations = [0, 90, 180, 270];
        for (const deg of rotations) {
          const c = document.createElement('canvas');
          const ctx = c.getContext('2d');
          const rad = (deg * Math.PI) / 180;

          if (deg === 90 || deg === 270) {
            c.width = baseCanvas.height;
            c.height = baseCanvas.width;
          } else {
            c.width = baseCanvas.width;
            c.height = baseCanvas.height;
          }

          ctx.save();
          ctx.translate(c.width / 2, c.height / 2);
          ctx.rotate(rad);
          ctx.drawImage(baseCanvas, -baseCanvas.width / 2, -baseCanvas.height / 2);
          ctx.restore();

          try {
            const r = await reader.decodeFromCanvas(c);
            if (r) return r.getText();
          } catch { /* continuar */ }
        }
      } catch { /* fallar */ }
    }
  } finally {
    URL.revokeObjectURL(url);
    reader.reset();
  }

  throw new Error('ZXing no pudo detectar el código de barras');
};

// ───────────────────────────────────────────────
// ESTRATEGIA FALLBACK: html5-qrcode scanFile
// ───────────────────────────────────────────────
let Html5QrcodeModule = null;
const scanWithHtml5Qrcode = async (file) => {
  try {
    if (!Html5QrcodeModule) {
      Html5QrcodeModule = await import('html5-qrcode');
    }
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = Html5QrcodeModule;
    const decodedText = await Html5Qrcode.scanFile(file, false, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
    });
    return decodedText;
  } catch {
    return null;
  }
};

// ───────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: ZXing → html5-qrcode → error
// ───────────────────────────────────────────────
const scanBarcodeFromFile = async (file) => {
  // 1. ZXing (pura JS, funciona en iPhone)
  try {
    const result = await scanWithZXing(file);
    if (result) return result;
  } catch (err) {
    console.log('ZXing falló:', err.message);
  }

  // 2. html5-qrcode (fallback)
  const result = await scanWithHtml5Qrcode(file);
  if (result) return result;

  throw new Error('No se pudo detectar el código de barras en la foto. Intenta con mejor iluminación o usa el modo manual.');
};

// ───────────────────────────────────────────────
// COMPONENTE
// ───────────────────────────────────────────────
export default function BarcodeScanner({ onScan, onClose, products = [] }) {
  const [activeTab, setActiveTab] = useState('photo');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const zxingLiveRef = useRef(null);
  const [scannerReady, setScannerReady] = useState(false);

  const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  useEffect(() => {
    return () => {
      if (zxingLiveRef.current) {
        try { zxingLiveRef.current.reset(); } catch {}
      }
    };
  }, []);

  const startLiveScanner = useCallback(async () => {
    setError('');
    try {
      const reader = createZXingReader();
      zxingLiveRef.current = reader;

      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: { facingMode: 'environment' },
        },
        videoRef.current,
        (result, err) => {
          if (result) {
            handleCodeFound(result.getText());
          }
        }
      );
      setScannerReady(true);
    } catch (err) {
      setError('No se pudo iniciar la cámara. Usa el modo "Tomar foto" en iPhone.');
      setScannerReady(false);
    }
  }, []);

  const stopLiveScanner = useCallback(() => {
    if (zxingLiveRef.current) {
      try { zxingLiveRef.current.reset(); } catch {}
      zxingLiveRef.current = null;
    }
    setScannerReady(false);
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

  useEffect(() => {
    if (isIPhone || isSafari) {
      setActiveTab('photo');
    } else {
      setActiveTab('camera');
      startLiveScanner();
    }
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setError('');

    try {
      const code = await scanBarcodeFromFile(file);
      handleCodeFound(code);
    } catch (err) {
      setError(err.message || 'No se detectó código. Intenta con mejor iluminación, más cerca y sin reflejos.');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeFound(manualCode.trim());
  };

  const handleCodeFound = (code) => {
    stopLiveScanner();
    onScan(code);
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
            onClick={() => handleTabChange('photo')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'photo' ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Tomar foto
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
              {!scannerReady && (
                <p className="text-center text-gray-400 text-sm mt-3">
                  Iniciando cámara...
                </p>
              )}
              {(isIPhone || isSafari) && (
                <p className="text-center text-amber-400 text-xs mt-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  En iPhone/Safari la cámara en vivo puede no funcionar en HTTP. Usa "Tomar foto".
                </p>
              )}
            </div>
          )}

          {activeTab === 'photo' && (
            <div className="text-center">
              <div className="bg-gray-800 rounded-lg p-8 mb-4">
                <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">
                  Toma una foto del código de barras
                </p>
                <p className="text-gray-400 text-sm">
                  Asegúrate de que el código sea legible y haya buena luz.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="camera-input"
              />

              <label
                htmlFor="camera-input"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                  processing
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {processing ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Abrir cámara
                  </>
                )}
              </label>

              {isIPhone && (
                <p className="text-gray-500 text-xs mt-3">
                  En iPhone usa este modo. Toma la foto y el sistema detectará el código automáticamente.
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

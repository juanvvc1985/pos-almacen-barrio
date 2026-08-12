import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader, BrowserCodeReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Image as ImageIcon, Keyboard, ScanLine, Loader2 } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose }) => {
  const [activeTab, setActiveTab] = useState('camera');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const codeReaderRef = useRef(null);
  const streamRef = useRef(null);
  const controlsRef = useRef(null);

  const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // FIX 1: Enumera cámaras y fuerza la cámara trasera principal (wide) en iPhone
  const enumerateCameras = useCallback(async () => {
    try {
      // Primero pedimos permiso con getUserMedia genérico
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      console.log('[SCANNER] Video devices found:', videoDevices.map(d => ({ label: d.label, id: d.deviceId.slice(0,8) })));
      
      setDevices(videoDevices);
      
      // Buscar la cámara trasera principal (wide) en iPhone
      // El iPhone 13 Pro tiene labels como "Back Camera", "Back Ultra Wide Camera", "Back Telephoto Camera"
      const backCamera = videoDevices.find(d => {
        const label = d.label.toLowerCase();
        return (
          (label.includes('back') || label.includes('trasera') || label.includes('rear') || label.includes('environment')) &&
          !label.includes('ultra') &&
          !label.includes('tele') &&
          !label.includes('front') &&
          !label.includes('selfie')
        );
      });
      
      // Si no encontramos la wide, usar la última cámara trasera disponible
      const fallbackCamera = videoDevices.find(d => {
        const label = d.label.toLowerCase();
        return label.includes('back') || label.includes('trasera') || label.includes('rear') || label.includes('environment');
      });
      
      const chosen = backCamera || fallbackCamera || videoDevices[videoDevices.length - 1] || null;
      
      if (chosen) {
        console.log('[SCANNER] Selected camera:', chosen.label);
        setSelectedDeviceId(chosen.deviceId);
      }
    } catch (err) {
      console.error('[SCANNER] enumerateCameras error:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  }, []);

  // FIX 2: Iniciar escáner en vivo con deviceId específico y play() explícito
  const startLiveScanner = useCallback(async () => {
    if (!videoRef.current) return;
    
    setScanning(true);
    setError(null);
    
    try {
      // Detener stream anterior si existe
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.QR_CODE,
      ]);
      
      const reader = new BrowserMultiFormatReader(hints, 500);
      codeReaderRef.current = reader;
      
      // Constraints: usar deviceId específico si lo tenemos, si no facingMode
      const constraints = selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId } }
        : { facingMode: { ideal: 'environment' } };
      
      console.log('[SCANNER] Starting with constraints:', constraints);
      
      // Obtener stream manualmente para tener control total
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          ...constraints,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      
      // FIX CRÍTICO: Atributos obligatorios en iOS
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      
      // FIX CRÍTICO: Forzar play() explícito — en iOS el video a veces se queda pausado
      // aunque tenga el stream asignado
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('[SCANNER] video.play() error:', err);
        });
      }
      
      // Esperar a que el video esté listo
      await new Promise((resolve) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          video.onloadeddata = resolve;
          setTimeout(resolve, 1000); // timeout de seguridad
        }
      });
      
      console.log('[SCANNER] Video ready, dimensions:', video.videoWidth, 'x', video.videoHeight);
      
      // Ahora arrancar ZXing desde el elemento video ya listo
      controlsRef.current = await reader.decodeFromVideoElement(video, (result, err) => {
        if (result) {
          console.log('[SCANNER] Code detected:', result.getText());
          const code = result.getText();
          onScan(code);
          stopLiveScanner();
        }
        if (err && err.name !== 'NotFoundException') {
          console.warn('[SCANNER] ZXing error:', err.name);
        }
      });
      
    } catch (err) {
      console.error('[SCANNER] startLiveScanner error:', err);
      setError('Error al iniciar la cámara: ' + (err.message || err.name));
      setScanning(false);
    }
  }, [selectedDeviceId, onScan]);

  const stopLiveScanner = useCallback(() => {
    console.log('[SCANNER] Stopping scanner...');
    
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    
    if (codeReaderRef.current) {
      codeReaderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
  }, []);

  // FIX 3: useEffect que maneja cambios de pestaña correctamente
  useEffect(() => {
    if (activeTab === 'camera') {
      // Pequeño delay para asegurar que el DOM está listo
      const timer = setTimeout(() => {
        startLiveScanner();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopLiveScanner();
    }
  }, [activeTab, startLiveScanner, stopLiveScanner]);

  // Enumerar cámaras al montar
  useEffect(() => {
    enumerateCameras();
    return () => stopLiveScanner();
  }, [enumerateCameras, stopLiveScanner]);

  // ==================== TOMAR FOTO ====================
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setScanning(true);
    setError(null);
    
    try {
      console.log('[SCANNER] File selected:', file.name, file.type, file.size);
      
      const imageUrl = URL.createObjectURL(file);
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
      ]);
      
      const reader = new BrowserMultiFormatReader(hints);
      
      // Intento 1: Directo desde URL
      let result = null;
      try {
        result = await reader.decodeFromImageUrl(imageUrl);
      } catch (e) {
        console.log('[SCANNER] Intent 1 failed:', e.message);
      }
      
      // Intento 2: Procesar con canvas corrigiendo orientación y reduciendo resolución
      if (!result) {
        try {
          const img = new Image();
          img.src = imageUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            setTimeout(() => reject(new Error('Image load timeout')), 5000);
          });
          
          // Crear canvas con resolución manejable (ZXing se pierde con fotos de 12MP del iPhone)
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1200;
          let w = img.width;
          let h = img.height;
          
          if (w > h && w > MAX_SIZE) { h = (h * MAX_SIZE) / w; w = MAX_SIZE; }
          else if (h > MAX_SIZE) { w = (w * MAX_SIZE) / h; h = MAX_SIZE; }
          
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          
          console.log('[SCANNER] Trying canvas decode, size:', w, 'x', h);
          result = await reader.decodeFromCanvas(canvas);
        } catch (e) {
          console.log('[SCANNER] Intent 2 failed:', e.message);
        }
      }
      
      // Intento 3: 4 rotaciones diferentes
      if (!result) {
        const img = new Image();
        img.src = imageUrl;
        await new Promise(r => { img.onload = r; });
        
        for (const rotation of [0, 90, 180, 270]) {
          try {
            const canvas = document.createElement('canvas');
            const rad = (rotation * Math.PI) / 180;
            const sin = Math.abs(Math.sin(rad));
            const cos = Math.abs(Math.cos(rad));
            const w = img.width * cos + img.height * sin;
            const h = img.width * sin + img.height * cos;
            
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.translate(w/2, h/2);
            ctx.rotate(rad);
            ctx.drawImage(img, -img.width/2, -img.height/2);
            
            console.log('[SCANNER] Trying rotation:', rotation);
            result = await reader.decodeFromCanvas(canvas);
            if (result) break;
          } catch (e) {
            // continue
          }
        }
      }
      
      // Intento 4: html5-qrcode como fallback
      if (!result) {
        try {
          console.log('[SCANNER] Trying html5-qrcode fallback...');
          const html5QrCode = new Html5Qrcode("dummy-qr-reader");
          // Usamos scanFile que acepta File directamente
          const qrResult = await html5QrCode.scanFile(file, false);
          result = { getText: () => qrResult };
        } catch (e) {
          console.log('[SCANNER] html5-qrcode failed:', e.message);
        }
      }
      
      URL.revokeObjectURL(imageUrl);
      
      if (result) {
        const code = typeof result.getText === 'function' ? result.getText() : result;
        console.log('[SCANNER] Photo scan success:', code);
        onScan(code);
      } else {
        setError('No se detectó código en la foto. Intenta con mejor iluminación, más cerca y sin reflejos.');
      }
      
    } catch (err) {
      console.error('[SCANNER] Photo scan error:', err);
      setError('Error al procesar la foto: ' + (err.message || err.name));
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ==================== MANUAL ====================
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <h2 className="text-white text-lg font-bold flex items-center gap-2">
          <ScanLine size={20} /> Escanear Código
        </h2>
        <button onClick={() => { stopLiveScanner(); onClose(); }} className="text-white p-2">
          <X size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-800">
        <button
          onClick={() => handleTabChange('camera')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium ${
            activeTab === 'camera' ? 'bg-blue-600 text-white' : 'text-gray-400'
          }`}
        >
          <Camera size={16} /> Cámara en vivo
        </button>
        <button
          onClick={() => handleTabChange('photo')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium ${
            activeTab === 'photo' ? 'bg-blue-600 text-white' : 'text-gray-400'
          }`}
        >
          <ImageIcon size={16} /> Tomar foto
        </button>
        <button
          onClick={() => handleTabChange('manual')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium ${
            activeTab === 'manual' ? 'bg-blue-600 text-white' : 'text-gray-400'
          }`}
        >
          <Keyboard size={16} /> Manual
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* CÁMARA EN VIVO — video SIEMPRE montado, solo oculto con CSS */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${activeTab === 'camera' ? 'block' : 'hidden'}`}>
          <div className="relative w-full h-full max-w-md mx-auto bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
              style={{ transform: 'scaleX(1)' }}
            />
            
            {scanning && activeTab === 'camera' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-48 border-2 border-blue-400 rounded-lg opacity-70">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
                </div>
              </div>
            )}
            
            {!scanning && activeTab === 'camera' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={32} />
              </div>
            )}
          </div>
          
          {devices.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 px-4">
              <select
                value={selectedDeviceId || ''}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 text-sm"
              >
                {devices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Cámara ${d.deviceId.slice(0,8)}`}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* TOMAR FOTO */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 ${activeTab === 'photo' ? 'block' : 'hidden'}`}>
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera size={32} className="text-blue-400" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Tomar foto del código</h3>
            <p className="text-gray-400 text-sm mb-6">
              Enfoca el código de barras dentro del recuadro y toma la foto.
            </p>
            
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {scanning ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
              {scanning ? 'Procesando...' : 'Abrir cámara'}
            </button>
            
            <p className="text-gray-500 text-xs mt-4">
              Funciona mejor con buena iluminación y sin reflejos.
            </p>
          </div>
        </div>

        {/* MANUAL */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 ${activeTab === 'manual' ? 'block' : 'hidden'}`}>
          <div className="text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Keyboard size={32} className="text-blue-400" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Ingreso manual</h3>
            <p className="text-gray-400 text-sm mb-6">
              Escribe el código de barras si el escáner no funciona.
            </p>
            
            <form onSubmit={handleManualSubmit} className="w-full">
              <input
                type="text"
                inputMode="numeric"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ej: 7804682632213"
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 mb-3 text-center text-lg tracking-widest"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium"
              >
                Buscar producto
              </button>
            </form>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute bottom-20 left-4 right-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
# FIX: Escáner no detecta códigos de barras EAN/UPC en iPhone

## Problema
La foto del código de barras se procesa pero no detecta nada. El código EAN-13 (7804682632213) es perfectamente legible.

## Causa
`html5-qrcode` por defecto solo escanea **QR codes**. Los códigos de barras lineales (EAN-13, UPC, CODE_128) necesitan habilitarse explícitamente mediante `Html5QrcodeSupportedFormats`.

## Solución
Se importan y configuran todos los formatos de código de barras soportados:
- EAN_13, EAN_8
- UPC_A, UPC_E
- CODE_128, CODE_39, CODE_93
- ITF
- QR_CODE

Tanto en modo cámara en vivo como en modo foto, se pasan los formatos en la configuración.

## Instalación
1. Copia `BarcodeScanner.jsx` a `src/components/BarcodeScanner.jsx`
2. En VS Code: Ctrl+K, Ctrl+S
3. `npm run build`
4. `npx serve dist -l 4173`

## Cómo probar
1. Toma foto al código de barras del producto
2. El sistema ahora debería detectar el EAN-13 automáticamente

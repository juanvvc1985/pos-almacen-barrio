# FIX OFFLINE v5.2 + Cache de Productos

## Archivos incluidos

| Archivo | Ruta en tu proyecto | Cambio |
|---------|---------------------|--------|
| firebase.js | src/firebase/firebase.js | Firestore cache persistente moderna |
| useAuth.jsx | src/hooks/useAuth.jsx | Login offline con sesión cacheada |
| useOffline.js | src/hooks/useOffline.js | Sync automático con mapeo de IDs de turno |
| POS.jsx | src/components/POS.jsx | Turno offline, ventas offline, cache de productos |
| App.jsx | src/App.jsx | isAuthenticated por userData |
| firestoreProducts.js | src/services/firestoreProducts.js | **NUEVO: Cache localStorage + fallback offline** |

## Pasos para instalar

1. Cierra el servidor de desarrollo (Ctrl+C en la ventana de Vite)
2. Copia cada archivo a su ruta correspondiente, reemplazando el anterior
3. En VS Code: Ctrl+K, luego Ctrl+S (Guardar Todo)
4. Compila para producción y prueba offline:
   ```
   npm run build
   npx serve dist -l 4173
   ```
5. Abre http://localhost:4173

## Qué se arregló (Pendiente #1)

- **Productos vacíos al recargar offline**: Ahora se guardan en localStorage al cargar online. Si recargas sin internet, lee del cache local.
- **Stock persistente offline**: Al vender offline, el descuento de stock se aplica a los productos en memoria y se recalcula al cargar, leyendo la cola de operaciones pendientes.
- **Escáner offline**: Si escaneas sin internet, busca en el cache local de productos.
- **Sync de turnos**: Al reconectar, los turnos offline se crean en Firestore con ID real, y las ventas/fiados se actualizan con ese ID.

## Cómo probar

1. Con internet: entra a la app, abre turno, vende 2 productos
2. Verifica en DevTools → Application → Local Storage → `pos_products_cache_XXX` existe
3. Pon DevTools → Network → Offline
4. Recarga la página (F5)
5. **Esperado**: Los productos aparecen, el turno sigue activo, el stock refleja las ventas offline

## Notas

- No uses `npm run dev` para probar offline. Vite en modo dev NO sirve archivos sin internet.
- Usa siempre `npm run build` + `npx serve dist -l 4173` (o el script COMPILAR_Y_VER.bat)

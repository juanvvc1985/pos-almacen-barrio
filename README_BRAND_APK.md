# BRAND + APK - Cambios para el Negocio

## Archivos incluidos

| Archivo | Ruta en tu proyecto | Cambio |
|---------|---------------------|--------|
| Navbar.jsx | src/components/Navbar.jsx | Muestra nombre del negocio desde configuración |
| Login.jsx | src/pages/Login.jsx | Muestra nombre del negocio guardado en localStorage |
| Register.jsx | src/pages/Register.jsx | Guarda nombre del negocio en localStorage al registrar |
| ConfiguracionAlmacen.jsx | src/pages/ConfiguracionAlmacen.jsx | Guarda nombre en localStorage al configurar |
| App.jsx | src/App.jsx | Cambia document.title dinámicamente |
| manifest.json | public/manifest.json | Nombre genérico "Negocio" |
| index.html | index.html | Título genérico "Negocio" |
| CAPACITOR_APK.md | (raíz) | Guía completa para crear APK |
| CREAR_APK.bat | (raíz) | Script automático para Windows |

## Instalación

1. Copia cada archivo a su ruta correspondiente, reemplazando el anterior
2. En VS Code: Ctrl+K, luego Ctrl+S
3. `npm run build` + `npx serve dist -l 4173` para probar

## Cómo funciona el nombre del negocio

1. El dueño va a **Configuración** y escribe el nombre de su negocio
2. Al guardar, se guarda en Firestore Y en `localStorage` del navegador
3. La próxima vez que abra la app (incluso en login), aparece el nombre
4. El Navbar muestra el nombre en vivo desde Firestore
5. La pestaña del navegador cambia al nombre del negocio

## Para crear la APK

Lee `CAPACITOR_APK.md` para la guía completa. Resumen:

**Opción A (Recomendada - 0 minutos):**
- El dueño abre la URL en Chrome del celular
- Menú → "Agregar a pantalla de inicio"
- Funciona como app nativa, offline incluido

**Opción B (APK real):**
1. Instala Android Studio
2. Corre `CREAR_APK.bat` (doble clic)
3. En Android Studio: Build → Build APK
4. Pasa el archivo `app-debug.apk` al celular del dueño

## Nota sobre el manifest.json

El `manifest.json` es estático (no puede cambiar sin compilar). Si quieres que el icono del celular diga exactamente el nombre del negocio en la Opción B (APK), edita `capacitor.config.json` después de correr `CREAR_APK.bat`:

```json
{
  "appName": "Nombre Del Negocio"
}
```

Luego `npx cap sync` y vuelve a generar el APK.

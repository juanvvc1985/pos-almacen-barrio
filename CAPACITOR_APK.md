# GUÍA: Crear APK para Android (Beta en celular del dueño)

## Opción A: Instalar como PWA (MÁS FÁCIL, recomendada primero)

No necesitas APK. El dueño abre la URL de la app en Chrome del celular y:

1. Abre Chrome → ve a la URL de tu app (ej: `https://tuproyecto.web.app`)
2. Toca los **3 puntos** (menú) → **"Agregar a pantalla de inicio"**
3. Aparece un icono en el celular como si fuera una app nativa
4. Funciona offline (gracias al Service Worker de la PWA)

**Ventajas:** Sin Android Studio, sin compilar, actualizas la web y el celular se actualiza solo.

---

## Opción B: APK real con Capacitor (para distribuir el .apk)

Si el dueño quiere un archivo `.apk` para instalar sin depender del navegador, sigue estos pasos.

### Requisitos

1. **Node.js** (ya lo tienes)
2. **Android Studio** (descarga gratis de [developer.android.com/studio](https://developer.android.com/studio))
3. **Java JDK 17** (Android Studio suele instalarlo solo, o baja de Oracle)
4. **Variables de entorno** en Windows:
   - `ANDROID_HOME` → apuntando a `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk`
   - Agregar al PATH: `%ANDROID_HOME%\platform-tools`

### Paso 1: Instalar Capacitor en tu proyecto

Abre CMD o PowerShell en la carpeta del proyecto y ejecuta:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Paso 2: Compilar la app web

```bash
npm run build
```

Esto genera la carpeta `dist/` con todos los archivos estáticos.

### Paso 3: Inicializar Capacitor

```bash
npx cap init "NombreNegocio" "com.tuempresa.nombreapp" --web-dir dist
```

Ejemplo:
```bash
npx cap init "Almacen La Esquina" "com.esquina.pos" --web-dir dist
```

Esto crea el archivo `capacitor.config.json`.

### Paso 4: Agregar Android

```bash
npx cap add android
```

Esto crea la carpeta `android/` con todo el proyecto Android.

### Paso 5: Sincronizar cambios

Cada vez que hagas `npm run build`, ejecuta:

```bash
npx cap sync
```

Esto copia los archivos de `dist/` al proyecto Android.

### Paso 6: Abrir en Android Studio

```bash
npx cap open android
```

Se abre Android Studio. La primera vez tardará en descargar dependencias (Gradle).

### Paso 7: Generar la APK

En Android Studio:

1. Espera que termine de cargar (barra de progreso abajo)
2. Arriba a la derecha donde dice el nombre del proyecto, selecciona **"app"**
3. Menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. Espera unos minutos
5. Abajo derecha aparece "Build Analyzer" o un aviso. Toca **"locate"** o ve a:
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

### Paso 8: Instalar en el celular

**Opción A - Por cable:**
1. Conecta el celular por USB
2. Activa "Modo desarrollador" y "Depuración USB" en el celular
3. En Android Studio, toca el botón verde **"Run"** (▶️) arriba
4. Elige tu celular de la lista → se instala automáticamente

**Opción B - Enviar el .apk:**
1. Copia el archivo `app-debug.apk` al celular (WhatsApp, email, cable)
2. En el celular, toca el archivo → "Instalar"
3. Si pide permiso: Configuración → Permitir instalar de esta fuente

---

## Script automático para Windows (CREAR_APK.bat)

Haz doble clic en `CREAR_APK.bat` (incluido en este ZIP) después de haber instalado Android Studio. El script hará:

1. `npm install` de Capacitor
2. `npm run build`
3. `cap init` (si no existe)
4. `cap add android` (si no existe)
5. `cap sync`
6. `cap open android`

Luego en Android Studio solo presionas **Build → Build APK**.

---

## Personalizar el nombre de la app en el celular

El nombre que aparece debajo del icono en el celular sale de `capacitor.config.json`:

```json
{
  "appId": "com.tuempresa.nombreapp",
  "appName": "Almacen La Esquina",
  "webDir": "dist"
}
```

Cambia `appName` al nombre del negocio, luego ejecuta `npx cap sync`.

---

## Icono de la app en el celular

Capacitor usa los iconos de `public/icon-192x192.png` y `public/icon-512x512.png`.

Para generar iconos Android de todos los tamaños automáticamente:

```bash
npm install @capacitor/assets
npx capacitor-assets generate --android
```

Esto crea los iconos en `android/app/src/main/res/` en todos los tamaños necesarios.

---

## Actualizar la app después de cambios

1. Haces cambios en el código
2. `npm run build`
3. `npx cap sync`
4. En Android Studio: **Build → Build APK** o presiona **Run**

Si usas la Opción A (PWA), solo haces `firebase deploy` y el celular se actualiza solo al abrir la app.

---

## Resumen: ¿Qué opción elegir?

| | PWA (Opción A) | APK (Opción B) |
|---|---|---|
| Esfuerzo | 0 minutos | 30-60 min primera vez |
| Instalación | Agregar a inicio desde Chrome | Instalar .apk |
| Actualizaciones | Automáticas (deploy web) | Hay que generar APK nueva |
| Offline | ✅ Sí | ✅ Sí |
| Escáner cámara | ✅ Funciona | ✅ Funciona |
| Recomendado para | Beta rápida | Cliente final que no entiende de URLs |

**Mi recomendación:** Empieza con la Opción A (PWA). Es inmediata y el dueño puede probar hoy mismo. Si luego quiere un .apk "de verdad", pasas a la Opción B.

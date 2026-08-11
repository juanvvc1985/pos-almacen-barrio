@echo off
chcp 65001 >nul
title Crear APK - POS Negocio
color 0B
cls

echo ==========================================
echo    CREAR APK PARA ANDROID
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no encontrado. Instálalo primero.
    pause
    exit /b 1
)

echo [2/6] Instalando Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/android
if errorlevel 1 (
    echo [ERROR] Fallo al instalar Capacitor.
    pause
    exit /b 1
)

echo [3/6] Compilando app web...
call npm run build
if errorlevel 1 (
    echo [ERROR] Fallo al compilar. Revisa errores arriba.
    pause
    exit /b 1
)

echo [4/6] Inicializando Capacitor (si es primera vez)...
if not exist "capacitor.config.json" (
    echo Creando capacitor.config.json...
    call npx cap init "Negocio" "com.negocio.pos" --web-dir dist
)

echo [5/6] Agregando Android (si es primera vez)...
if not exist "android" (
    call npx cap add android
)

echo [6/6] Sincronizando archivos...
call npx cap sync

echo.
echo ==========================================
echo    LISTO. Abriendo Android Studio...
echo ==========================================
echo.
echo Pasos finales en Android Studio:
echo 1. Espera que cargue (descarga Gradle la primera vez)
echo 2. Arriba a la derecha: selecciona "app"
echo 3. Build -^> Build Bundle(s)/APK(s) -^> Build APK(s)
echo 4. El APK queda en: androidppuild\outputspk\debugpp-debug.apk
echo.

call npx cap open android
pause

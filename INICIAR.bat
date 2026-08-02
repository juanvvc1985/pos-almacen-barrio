@echo off
setlocal EnableDelayedExpansion
chcp 1252 >nul
title POS Almacen Barrio - Iniciando...
color 0A
cls

echo ==========================================
echo    POS ALMACEN BARRIO
echo ==========================================
echo.

cd /d "%~dp0"
echo [1/4] Carpeta: %cd%
echo.

if not exist "package.json" (
    echo [ERROR] No se encontro package.json
    echo.
    pause
    exit /b 1
)

echo [2/4] package.json OK
echo.

if not exist "node_modules" (
    echo [3/4] node_modules NO encontrado. Instalando...
    echo Esto puede tardar 1-3 minutos...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] Fallo npm install
        echo.
        pause
        exit /b 1
    )
    echo [3/4] node_modules instalado OK
) else (
    echo [3/4] node_modules OK
)
echo.

echo [4/4] Iniciando servidor Vite...
echo.
echo ------------------------------------------
echo Si todo va bien, veras "ready in X ms"
echo y la app se abrira en el navegador.
echo ------------------------------------------
echo.
echo Si hay un error, aparecera abajo:
echo.

npm run dev

set EXITCODE=%errorlevel%
echo.
echo ==========================================
if %EXITCODE% equ 0 (
    echo Servidor detenido normalmente.
) else (
    echo [ERROR] El servidor termino con codigo %EXITCODE%
    echo.
    echo Posibles causas:
    echo - Error en algun archivo .jsx o .js
    echo - Falta algun archivo del proyecto
    echo - Puerto 5173 ocupado por otra app
)
echo ==========================================
echo.
echo NO CIERRES esta ventana si necesitas ayuda.
echo Tomale una foto al error de arriba.
echo.
pause

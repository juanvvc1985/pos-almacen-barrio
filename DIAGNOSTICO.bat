@echo off
chcp 1252 >nul
title Diagnostico POS Almacen
color 0E
cls

echo ==========================================
echo    DIAGNOSTICO POS ALMACEN BARRIO
echo ==========================================
echo.

cd /d "%~dp0"
echo Carpeta actual: %cd%
echo.

echo --- Verificando archivos ---
if exist "package.json" (
    echo [OK] package.json     : ENCONTRADO
) else (
    echo [ERROR] package.json  : NO ENCONTRADO
)

if exist "node_modules" (
    echo [OK] node_modules     : ENCONTRADO
) else (
    echo [ERROR] node_modules  : NO ENCONTRADO (ejecuta: npm install)
)

if exist "vite.config.js" (
    echo [OK] vite.config.js   : ENCONTRADO
) else (
    echo [ERROR] vite.config.js: NO ENCONTRADO
)

echo.
echo --- Verificando Node.js ---
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] node           : NO INSTALADO
) else (
    for /f "tokens=*" %%a in ('node --version') do echo [OK] node           : %%a
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm            : NO INSTALADO
) else (
    for /f "tokens=*" %%a in ('npm --version') do echo [OK] npm            : v%%a
)

echo.
echo ==========================================
echo Si ves algun [ERROR] arriba, ese es el problema.
echo.
pause

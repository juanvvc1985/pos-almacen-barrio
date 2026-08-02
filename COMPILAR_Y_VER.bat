@echo off
chcp 1252 >nul
title POS Almacen - Compilar
color 0E
cls

echo ==========================================
echo    COMPILANDO POS ALMACEN BARRIO
echo ==========================================
echo.

cd /d "%~dp0"

echo Instalando dependencias (si faltan)...
call npm install
echo.

echo Compilando para produccion...
call npm run build
echo.

echo Compilacion lista. Abriendo en navegador...
start http://localhost:4173/
echo.
echo Servidor de prueba iniciado.
call npx serve dist -l 4173
pause

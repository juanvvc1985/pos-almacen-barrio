@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)
echo Iniciando servidor...
npm run dev
pause

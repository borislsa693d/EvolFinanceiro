@echo off
echo Iniciando servidor Vite com exposicao na rede local...
echo.
cd /d "%~dp0"
call npm run dev -- --host
pause






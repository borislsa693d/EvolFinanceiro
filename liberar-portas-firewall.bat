@echo off
echo ========================================
echo   Liberando portas no Firewall
echo ========================================
echo.
echo Este script precisa ser executado como Administrador!
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

powershell -ExecutionPolicy Bypass -File "%~dp0liberar-portas-firewall.ps1"

pause



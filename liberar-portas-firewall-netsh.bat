@echo off
echo ========================================
echo   Liberando portas no Firewall (Netsh)
echo ========================================
echo.
echo Este script precisa ser executado como Administrador!
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo.
echo Liberando porta 8000 (Backend)...
netsh advfirewall firewall add rule name="EvolFinanceiro-Backend-8000" dir=in action=allow protocol=TCP localport=8000
if %errorlevel% equ 0 (
    echo   [OK] Porta 8000 liberada!
) else (
    echo   [AVISO] Erro ao liberar porta 8000 (pode ja estar liberada)
)

echo.
echo Liberando porta 5173 (Frontend)...
netsh advfirewall firewall add rule name="EvolFinanceiro-Frontend-5173" dir=in action=allow protocol=TCP localport=5173
if %errorlevel% equ 0 (
    echo   [OK] Porta 5173 liberada!
) else (
    echo   [AVISO] Erro ao liberar porta 5173 (pode ja estar liberada)
)

echo.
echo ========================================
echo   Portas liberadas no Firewall!
echo ========================================
echo.
echo Agora voce pode acessar a aplicacao no celular.
echo.
pause



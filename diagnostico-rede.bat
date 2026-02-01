@echo off
echo ========================================
echo   DIAGNOSTICO DE REDE
echo ========================================
echo.

echo [1] Verificando IP da maquina...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
echo    Seu IP: %IP%
echo.

echo [2] Verificando se as portas estao abertas...
netstat -ano | findstr "LISTENING" | findstr ":8000 :5173"
if %errorlevel% equ 0 (
    echo    [OK] Portas 8000 e 5173 estao escutando
) else (
    echo    [ERRO] Portas nao estao escutando!
)
echo.

echo [3] Verificando regras do firewall...
netsh advfirewall firewall show rule name="EvolFinanceiro-Backend-8000" | findstr "Habilitado"
netsh advfirewall firewall show rule name="EvolFinanceiro-Frontend-5173" | findstr "Habilitado"
echo.

echo [4] Testando conectividade local...
echo    Testando backend: http://localhost:8000/health
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing -TimeoutSec 2; Write-Host '    [OK] Backend respondendo: ' $response.Content } catch { Write-Host '    [ERRO] Backend nao esta respondendo' }"
echo.

echo ========================================
echo   INSTRUCOES PARA ACESSO NO CELULAR
echo ========================================
echo.
echo 1. Certifique-se que o celular esta na MESMA rede Wi-Fi
echo 2. No navegador do celular, acesse:
echo    http://%IP%:5173
echo.
echo 3. Se ainda nao funcionar, teste o backend primeiro:
echo    http://%IP%:8000/health
echo    (Deve retornar: {"status": "ok", "database": "SQLite with WAL"})
echo.
echo 4. Verifique se o antivirus nao esta bloqueando
echo.
pause



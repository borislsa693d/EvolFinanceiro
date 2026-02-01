@echo off
echo ================================================
echo  FINANCEFLOW - Sistema de Controle Financeiro
echo  Modo: Acesso pela Rede Local (Celular)
echo ================================================
echo.

REM Obter IP da máquina
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
echo Seu IP na rede: %IP%
echo.

echo Iniciando Backend Python (SQLite + WAL)...
echo.

cd backend
start cmd /k "python main.py"

echo Aguardando backend iniciar...
ping 127.0.0.1 -n 4 >nul

echo.
echo Iniciando Frontend React + Vite (modo rede local)...
echo.

cd ..\project
start cmd /k "npm run dev -- --host"

ping 127.0.0.1 -n 3 >nul

echo.
echo ================================================
echo  Servidores iniciados para acesso na rede!
echo.
echo  Backend:  http://%IP%:8000
echo  Frontend: http://%IP%:5173
echo  API Docs: http://%IP%:8000/docs
echo.
echo  Para acessar no celular:
echo  1. Certifique-se que esta na mesma rede Wi-Fi
echo  2. Abra o navegador e acesse:
echo     http://%IP%:5173
echo.
echo  Pressione qualquer tecla para sair...
echo ================================================
pause >nul





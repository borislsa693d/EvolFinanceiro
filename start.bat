@echo off
echo ================================================
echo  FINANCEFLOW - Sistema de Controle Financeiro
echo ================================================
echo.
echo Iniciando Backend Python (SQLite + WAL)...
echo.

cd backend
start cmd /k "python main.py"

timeout /t 3 >nul

echo.
echo Iniciando Frontend React + Vite...
echo.

cd ..\project
start cmd /k "npm run dev"

echo.
echo ================================================
echo  Servidores iniciados!
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo  API Docs: http://localhost:8000/docs
echo ================================================
echo.
echo Pressione qualquer tecla para sair...
pause >nul





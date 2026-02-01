#!/bin/bash

echo "================================================"
echo " FINANCEFLOW - Sistema de Controle Financeiro"
echo "================================================"
echo ""
echo "Iniciando Backend Python (SQLite + WAL)..."
echo ""

cd backend
python3 main.py &
BACKEND_PID=$!

sleep 3

echo ""
echo "Iniciando Frontend React + Vite..."
echo ""

cd ../project
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo " Servidores iniciados!"
echo " Backend:  http://localhost:8000"
echo " Frontend: http://localhost:5173"
echo " API Docs: http://localhost:8000/docs"
echo "================================================"
echo ""
echo "Pressione Ctrl+C para parar os servidores"

# Aguardar interrupção
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait





# Script para iniciar o Vite com exposição na rede local
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Write-Host "🚀 Iniciando servidor Vite com exposição na rede local..." -ForegroundColor Green
Write-Host ""

cd $PSScriptRoot
npm run dev -- --host




# Script para liberar portas no Firewall do Windows
# Portas: 8000 (Backend) e 5173 (Frontend)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Liberando portas no Firewall" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "AVISO: Este script precisa ser executado como Administrador!" -ForegroundColor Yellow
    Write-Host "Clique com botão direito e selecione 'Executar como administrador'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pressione qualquer tecla para tentar mesmo assim..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
}

# Porta 8000 - Backend
Write-Host "Liberando porta 8000 (Backend)..." -ForegroundColor Green
try {
    # Remover regra existente se houver
    $ruleName1 = "EvolFinanceiro-Backend-8000"
    Remove-NetFirewallRule -DisplayName $ruleName1 -ErrorAction SilentlyContinue
    
    # Criar nova regra
    New-NetFirewallRule -DisplayName $ruleName1 -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow -Profile Any | Out-Null
    
    Write-Host "  [OK] Porta 8000 liberada com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Erro ao liberar porta 8000: $_" -ForegroundColor Red
}

# Porta 5173 - Frontend
Write-Host "Liberando porta 5173 (Frontend)..." -ForegroundColor Green
try {
    # Remover regra existente se houver
    $ruleName2 = "EvolFinanceiro-Frontend-5173"
    Remove-NetFirewallRule -DisplayName $ruleName2 -ErrorAction SilentlyContinue
    
    # Criar nova regra
    New-NetFirewallRule -DisplayName $ruleName2 -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -Profile Any | Out-Null
    
    Write-Host "  [OK] Porta 5173 liberada com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Erro ao liberar porta 5173: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Portas liberadas no Firewall!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora você pode acessar a aplicação no celular." -ForegroundColor Green
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


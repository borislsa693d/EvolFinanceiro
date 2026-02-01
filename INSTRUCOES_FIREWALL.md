# 🔥 Como Liberar Portas no Firewall do Windows

Se você não conseguir acessar a aplicação no celular, o firewall do Windows pode estar bloqueando as conexões.

## 🚀 Método 1: Script Automático (Recomendado)

### Opção A: Usando PowerShell
1. **Clique com botão direito** em `liberar-portas-firewall.bat`
2. Selecione **"Executar como administrador"**
3. Aguarde a conclusão

### Opção B: Usando Netsh (Alternativa)
1. **Clique com botão direito** em `liberar-portas-firewall-netsh.bat`
2. Selecione **"Executar como administrador"**
3. Aguarde a conclusão

## 🔧 Método 2: Manual pelo Painel do Windows

1. Abra o **Painel de Controle** → **Sistema e Segurança** → **Firewall do Windows Defender**
2. Clique em **"Configurações avançadas"** (no lado esquerdo)
3. Clique em **"Regras de Entrada"** (Inbound Rules)
4. Clique em **"Nova Regra..."** (New Rule...)
5. Selecione **"Porta"** e clique em **Próximo**
6. Selecione **TCP** e digite **8000** (ou **5173** para o frontend)
7. Selecione **"Permitir a conexão"**
8. Marque todas as opções (Domínio, Privada, Pública)
9. Dê um nome: **"EvolFinanceiro Backend 8000"** (ou **"EvolFinanceiro Frontend 5173"**)
10. Clique em **Concluir**

**Repita o processo para a porta 5173**

## 🔍 Verificar se as Portas Estão Liberadas

Execute no PowerShell (como administrador):
```powershell
netsh advfirewall firewall show rule name=all | findstr "EvolFinanceiro"
```

Ou verifique no Firewall:
- Painel de Controle → Firewall → Configurações Avançadas → Regras de Entrada
- Procure por "EvolFinanceiro"

## ⚠️ Importante

- Você precisa executar como **Administrador**
- Se ainda não funcionar, verifique se o antivírus não está bloqueando
- Certifique-se que ambos (PC e celular) estão na **mesma rede Wi-Fi**

## 🧪 Testar Conexão

Após liberar as portas, teste no celular:
- Backend: `http://[SEU_IP]:8000/health`
- Frontend: `http://[SEU_IP]:5173`

Se o backend responder com `{"status": "ok"}`, está funcionando!



# 🔧 Solução para Acesso pela Rede Local

## Problema
Ao acessar pelo IP da rede (`http://172.20.10.2:5173`), estava dando erro de "Email ou senha inválidos" porque:
- O frontend estava tentando se conectar a `http://localhost:8000` (que não funciona no celular)
- O CORS do backend não estava configurado para aceitar requisições da rede local

## ✅ Solução Implementada

### 1. Frontend ajustado automaticamente
O frontend agora **detecta automaticamente** o IP da rede e usa para a API:
- Acessando por `http://172.20.10.2:5173` → API usa `http://172.20.10.2:8000`
- Acessando por `http://localhost:5173` → API usa `http://localhost:8000`

### 2. CORS do backend configurado
O backend agora aceita requisições de qualquer IP na porta 5173 (rede local)

## 🚀 Como Usar Agora

### Passo 1: Reiniciar o Backend
**IMPORTANTE:** Você precisa reiniciar o backend Python para aplicar as mudanças de CORS:

1. **Parar o backend atual** (Ctrl+C no terminal onde está rodando)
2. **Iniciar novamente:**
   ```bash
   cd backend
   python main.py
   ```

### Passo 2: Iniciar o Frontend na Rede
```bash
cd project
npm run dev:network
```

Ou use um dos scripts criados:
- **Windows:** Clique duplo em `project/start-dev-network.bat`
- **PowerShell:** Execute `project/start-dev-network.ps1`

### Passo 3: Acessar pelo Celular
1. Certifique-se que o **backend está rodando** (`python main.py` no terminal)
2. Certifique-se que o **frontend está rodando** com `--host`
3. No celular (mesma rede Wi-Fi), acesse:
   ```
   http://172.20.10.2:5173
   ```
   (Use o IP que aparecer no terminal do Vite)

## ⚠️ Verificações Importantes

### Backend rodando?
Verifique se você vê algo assim no terminal:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Frontend acessível na rede?
Verifique se você vê algo assim no terminal:
```
Network: http://172.20.10.2:5173
```

### Testar conexão do backend
No celular ou navegador, tente acessar:
```
http://172.20.10.2:8000/health
```

Deveria retornar: `{"status": "ok", "database": "SQLite with WAL"}`

## 🔍 Se ainda não funcionar

1. **Verificar Firewall do Windows:**
   - O Windows pode estar bloqueando as conexões na porta 8000
   - Permitir Node.js e Python pelo firewall

2. **Verificar se ambos estão na mesma rede:**
   - Celular e computador devem estar na mesma Wi-Fi

3. **Verificar IP atual:**
   ```bash
   ipconfig | findstr /i "IPv4"
   ```
   (O IP pode mudar se você conectar em outra rede)

4. **Testar no console do navegador (F12):**
   - Veja se há erros de CORS ou conexão
   - Verifique se a URL da API está correta (deve ser `http://172.20.10.2:8000`)






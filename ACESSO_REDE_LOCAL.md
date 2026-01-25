# 🌐 Como Acessar o Site pela Rede Local

## 📱 Acessar pelo Celular ou Compartilhar na Rede

### Opção 1: Usar o script configurado (Recomendado)

1. **Parar o servidor atual** (Ctrl+C se estiver rodando)

2. **Iniciar o servidor expondo na rede:**
   ```bash
   cd project
   npm run dev:network
   ```

3. **Acessar no celular ou outro dispositivo:**
   - Certifique-se que o celular/dispositivo está na **mesma rede Wi-Fi** que seu computador
   - No celular, abra o navegador e acesse:
     ```
     http://172.20.10.2:5173
     ```
   - Ou use o IP que aparecer no terminal após iniciar (ex: `Network: http://192.168.x.x:5173`)

### Opção 2: Usar --host manualmente

```bash
cd project
npm run dev -- --host
```

### Opção 3: Expor em IP específico

Se quiser usar um IP específico:
```bash
cd project
npm run dev -- --host 0.0.0.0
```

## 🔒 Segurança e Recomendações

### ✅ Durante Desenvolvimento (Seguro)
- O servidor Vite é seguro para uso na rede local durante desenvolvimento
- Apenas pessoas na mesma rede Wi-Fi conseguem acessar
- Não expõe seu código fonte completo, apenas o app compilado

### ⚠️ Importante:
1. **Mesma Rede Wi-Fi**: O celular/dispositivo deve estar na mesma rede que seu computador
2. **Firewall**: O Windows pode pedir permissão para o Node.js acessar a rede. Permita se necessário
3. **Backend**: Se estiver usando o backend Python, certifique-se que ele também está rodando e acessível na rede (configurar CORS se necessário)

## 📡 Verificar IP da Máquina

Para ver seu IP atual (pode mudar dependendo da rede):
```bash
# Windows PowerShell
ipconfig | findstr /i "IPv4"

# Ou verificar diretamente
ipconfig
```

## 🔄 Se o IP mudar

Se você conectar em outra rede Wi-Fi, o IP muda. Nesse caso:
1. Verifique o novo IP com `ipconfig`
2. Use o novo IP no celular: `http://[NOVO_IP]:5173`

## 🌍 Compartilhar com Pessoas Fora da Rede Local

Para acessar de fora da sua rede local, você precisaria:
1. **Túnel (Ngrok, Cloudflare Tunnel, etc.)** - Mais seguro
2. **Expor porta no roteador** - Menos seguro, requer configuração
3. **Deploy em servidor** (Vercel, Netlify, etc.) - Melhor para produção

**Recomendação:** Para desenvolvimento, usar apenas na rede local é o mais seguro e simples.




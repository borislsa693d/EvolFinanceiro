# 🚀 Início Rápido - FinanceFlow

## ✅ Pré-requisitos

- ✅ Node.js instalado
- ✅ Python 3.8+ instalado

## 📦 Instalação (Primeira vez)

### 1. Instalar dependências do Backend

```bash
cd backend
pip install -r requirements.txt
```

### 2. Instalar dependências do Frontend

```bash
cd project
npm install
```

## 🏃 Como Rodar

### Opção 1: Usar o script automático (Windows)

```bash
start.bat
```

### Opção 2: Manualmente

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd project
npm run dev
```

## 🌐 Acessar

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## 📝 Primeiro Uso

1. Acesse http://localhost:5173
2. Clique em "Criar conta"
3. Preencha email e senha
4. Faça login
5. Pronto! O sistema criará dados de exemplo automaticamente

## 🗄️ Banco de Dados

O banco SQLite será criado automaticamente em `backend/finance.db` quando você iniciar o backend pela primeira vez.

### Arquivos do banco:
- `finance.db` - Banco principal
- `finance.db-wal` - Write-Ahead Log (permite leituras/escritas simultâneas)
- `finance.db-shm` - Shared memory

## 🔧 Solução de Problemas

### Backend não inicia

```bash
# Reinstalar dependências
cd backend
pip install -r requirements.txt --upgrade
```

### Frontend não inicia

```bash
# Reinstalar dependências
cd project
rm -rf node_modules
npm install
```

### Erro de CORS

Verifique se o backend está rodando em `http://localhost:8000`

### Porta já em uso

**Backend (porta 8000):**
- Edite `backend/main.py` e altere a porta

**Frontend (porta 5173):**
- Edite `project/vite.config.ts` e adicione:
```typescript
export default defineConfig({
  server: {
    port: 3000  // sua porta
  }
})
```

## 📚 Próximos Passos

1. Explore a documentação da API em http://localhost:8000/docs
2. Crie categorias personalizadas
3. Adicione suas contas e cartões
4. Registre suas transações
5. Visualize os gráficos e análises

## 🎯 Funcionalidades Principais

- ✅ Autenticação com JWT
- ✅ Gerenciamento de transações
- ✅ Categorias personalizadas
- ✅ Contas bancárias
- ✅ Cartões de crédito
- ✅ Dashboard com gráficos
- ✅ Análises financeiras
- ✅ Extrato detalhado
- ✅ Previsão de gastos

## 💡 Dicas

- O sistema cria dados de exemplo no primeiro login
- Todas as senhas são criptografadas com bcrypt
- Os tokens JWT expiram em 7 dias
- O banco SQLite com WAL permite múltiplos acessos simultâneos

---

**Desenvolvido com ❤️ usando React, FastAPI e SQLite com WAL**



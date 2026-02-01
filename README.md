# 💰 FinanceFlow - Sistema de Controle Financeiro Pessoal

Sistema completo de controle financeiro com frontend React e backend Python usando SQLite com WAL (Write-Ahead Logging).

## 🚀 Tecnologias

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool rápido
- **React Router** - Navegação
- **Tailwind CSS** + CSS customizado
- **Lucide React** - Ícones

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLite com WAL** - Banco de dados com Write-Ahead Logging
- **SQLAlchemy** - ORM
- **JWT** - Autenticação segura
- **Bcrypt** - Hash de senhas

## 📊 O que é WAL?

WAL (Write-Ahead Logging) é um modo do SQLite que permite:
- ✅ **Leituras e escritas simultâneas** - Múltiplos usuários podem ler enquanto outro escreve
- ✅ **Melhor performance** - Até 2x mais rápido que o modo padrão
- ✅ **Menos locks** - Menos bloqueios durante operações
- ✅ **Ideal para dashboards** - Perfeito para aplicações com muitas consultas

## 🎯 Funcionalidades

- ✅ **Autenticação** - Registro e login com JWT
- ✅ **Dashboard** - Visão geral das finanças
- ✅ **Transações** - Controle de receitas e despesas
- ✅ **Categorias** - Organize suas transações
- ✅ **Contas** - Gerencie contas bancárias
- ✅ **Cartões de Crédito** - Controle de cartões
- ✅ **Análises** - Gráficos e relatórios
- ✅ **Extrato** - Visualização detalhada de movimentações
- ✅ **Previsão** - Planejamento financeiro

## 📦 Instalação

### Pré-requisitos
- **Node.js** (v18+)
- **Python** (v3.8+)
- **pip** (gerenciador de pacotes Python)

### 1. Instalar dependências do Frontend

```bash
cd project
npm install
```

### 2. Instalar dependências do Backend

```bash
cd backend
pip install -r requirements.txt
```

## 🏃 Como Executar

### Opção 1: Iniciar tudo de uma vez (Windows)

```bash
start.bat
```

### Opção 2: Iniciar tudo de uma vez (Linux/Mac)

```bash
chmod +x start.sh
./start.sh
```

### Opção 3: Iniciar manualmente

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

## 🌐 Acessar Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## 📚 Estrutura do Projeto

```
EvolFinanceiro/
├── backend/                    # Backend Python
│   ├── routers/               # Endpoints da API
│   │   ├── auth.py           # Autenticação
│   │   ├── transactions.py   # Transações
│   │   ├── categories.py     # Categorias
│   │   ├── accounts.py       # Contas
│   │   └── credit_cards.py   # Cartões
│   ├── database.py           # Configuração SQLite + WAL
│   ├── models.py             # Modelos do banco
│   ├── schemas.py            # Schemas Pydantic
│   ├── auth.py               # Lógica de autenticação JWT
│   ├── main.py               # Aplicação principal
│   └── requirements.txt      # Dependências Python
│
├── project/                   # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── Auth/        # Login e Registro
│   │   │   ├── Dashboard/   # Dashboard e gráficos
│   │   │   ├── Transactions/# Nova transação
│   │   │   ├── Configuracoes/# Configurações
│   │   │   └── Layout/      # Layout e navegação
│   │   ├── contexts/        # Context API (Auth)
│   │   ├── lib/
│   │   │   ├── api.ts       # Cliente da API
│   │   │   └── supabase.ts  # (Deprecated)
│   │   ├── styles/          # Estilos CSS
│   │   └── main.tsx         # Entry point
│   └── package.json
│
├── start.bat                  # Script de inicialização (Windows)
├── start.sh                   # Script de inicialização (Linux/Mac)
└── README.md                  # Este arquivo
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação:

1. **Registro**: Crie uma conta com email e senha
2. **Login**: Receba um token JWT válido por 7 dias
3. **Requisições**: Token é enviado automaticamente no header `Authorization: Bearer <token>`

## 🗄️ Banco de Dados

### Tabelas

- **users** - Usuários do sistema
- **categories** - Categorias de transações
- **accounts** - Contas bancárias
- **credit_cards** - Cartões de crédito
- **transactions** - Transações financeiras

### Row Level Security

Cada usuário só tem acesso aos seus próprios dados. Todas as queries são filtradas automaticamente pelo `user_id`.

## 📖 API Endpoints

### Autenticação
- `POST /auth/register` - Registrar
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário

### Transações
- `GET /transactions` - Listar (com filtros)
- `POST /transactions` - Criar
- `GET /transactions/{id}` - Obter
- `PUT /transactions/{id}` - Atualizar
- `DELETE /transactions/{id}` - Deletar

### Categorias
- `GET /categories` - Listar
- `POST /categories` - Criar
- `PUT /categories/{id}` - Atualizar
- `DELETE /categories/{id}` - Deletar

### Contas
- `GET /accounts` - Listar
- `POST /accounts` - Criar
- `PUT /accounts/{id}` - Atualizar
- `DELETE /accounts/{id}` - Deletar

### Cartões de Crédito
- `GET /credit-cards` - Listar
- `POST /credit-cards` - Criar
- `PUT /credit-cards/{id}` - Atualizar
- `DELETE /credit-cards/{id}` - Deletar

## 🎨 Interface

- **Design Moderno** - Interface clean e responsiva
- **Dark Mode** - Visual elegante em tons escuros
- **Mobile First** - Funciona perfeitamente em dispositivos móveis
- **Gráficos Interativos** - Visualização clara dos dados

## 🔧 Configuração

### Alterar porta do backend

Edite `backend/main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8000)  # Altere 8000 para sua porta
```

### Alterar URL da API no frontend

Edite `project/src/lib/api.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Ou crie `project/.env`:
```
VITE_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se o Python está instalado: `python --version`
- Instale as dependências: `pip install -r backend/requirements.txt`

### Frontend não inicia
- Verifique se o Node.js está instalado: `node --version`
- Instale as dependências: `npm install` (dentro da pasta project)

### Erro de CORS
- Verifique se o backend está rodando
- Confirme que a URL do frontend está em `backend/main.py` na configuração de CORS

## 📝 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

**Desenvolvido com ❤️ usando React, FastAPI e SQLite com WAL**





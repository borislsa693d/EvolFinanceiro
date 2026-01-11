# Finance API - Backend Python

Backend completo para o sistema de controle financeiro, usando:
- **FastAPI** - Framework web moderno e rápido
- **SQLite com WAL** - Banco de dados com Write-Ahead Logging para melhor performance
- **SQLAlchemy** - ORM para gerenciar o banco
- **JWT** - Autenticação segura com tokens

## 🚀 Como iniciar

### 1. Instalar dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Iniciar servidor

```bash
python main.py
```

Ou usando uvicorn diretamente:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Acessar documentação

A API estará disponível em: `http://localhost:8000`
Documentação interativa: `http://localhost:8000/docs`

## 📊 SQLite com WAL

O banco está configurado com WAL (Write-Ahead Logging), que permite:
- ✅ Leituras e escritas simultâneas
- ✅ Melhor performance
- ✅ Menos locks
- ✅ Ideal para dashboards com muitas consultas

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Fluxo:
1. Registrar: `POST /auth/register`
2. Login: `POST /auth/login` - retorna token
3. Usar token no header: `Authorization: Bearer <token>`

## 📚 Endpoints

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login e obter token
- `GET /auth/me` - Obter dados do usuário autenticado

### Transações
- `GET /transactions` - Listar transações (com filtros)
- `POST /transactions` - Criar transação
- `GET /transactions/{id}` - Obter transação específica
- `PUT /transactions/{id}` - Atualizar transação
- `DELETE /transactions/{id}` - Deletar transação

### Categorias
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria
- `GET /categories/{id}` - Obter categoria
- `PUT /categories/{id}` - Atualizar categoria
- `DELETE /categories/{id}` - Deletar categoria

### Contas
- `GET /accounts` - Listar contas
- `POST /accounts` - Criar conta
- `GET /accounts/{id}` - Obter conta
- `PUT /accounts/{id}` - Atualizar conta
- `DELETE /accounts/{id}` - Deletar conta

### Cartões de Crédito
- `GET /credit-cards` - Listar cartões
- `POST /credit-cards` - Criar cartão
- `GET /credit-cards/{id}` - Obter cartão
- `PUT /credit-cards/{id}` - Atualizar cartão
- `DELETE /credit-cards/{id}` - Deletar cartão

## 🗄️ Estrutura do Banco

### Tabelas:
- **users** - Usuários do sistema
- **categories** - Categorias de transações
- **accounts** - Contas bancárias
- **credit_cards** - Cartões de crédito
- **transactions** - Transações financeiras

Todas as tabelas têm relacionamento com `users` e seguem Row Level Security (os usuários só veem seus próprios dados).

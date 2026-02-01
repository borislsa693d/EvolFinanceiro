# Finance API - Backend Python

Backend completo para o sistema de controle financeiro, usando:
- FastAPI
- SQLite com WAL
- SQLAlchemy
- JWT
- Alembic (migracoes)

## Como iniciar

### 1. Instalar dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar URL do banco

Por padrao o SQLite fica em `./finance.db`. Para usar um caminho seguro na VPS:

```bash
export SQLALCHEMY_DATABASE_URL=sqlite:////var/lib/finance/finance.db
```

### 3. Rodar migracoes

Para um banco novo:

```bash
alembic upgrade head
```

Para banco existente (na primeira vez), apenas marcar a versao sem alterar dados:

```bash
alembic stamp head
```

### 4. Iniciar servidor

```bash
python main.py
```

Ou:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## SQLite com WAL

O banco esta configurado com WAL (Write-Ahead Logging), que permite:
- Leituras e escritas simultaneas
- Melhor performance
- Menos locks

## Autenticacao

Fluxo:
1. Registrar: `POST /auth/register`
2. Login: `POST /auth/login`
3. Usar token no header: `Authorization: Bearer <token>`

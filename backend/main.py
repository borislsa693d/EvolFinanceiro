"""
Backend FastAPI com SQLite + WAL
Sistema de controle financeiro pessoal
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models

# Importar routers
from routers import auth, transactions, categories, accounts, credit_cards, fixed_transactions

# Criar tabelas no banco
Base.metadata.create_all(bind=engine)

# Migrações do banco de dados
from database import SessionLocal
from sqlalchemy import text, inspect
from datetime import datetime

try:
    db = SessionLocal()
    inspector = inspect(engine)
    
    # Migração 1: Adicionar coluna type à tabela categories
    try:
        columns = [col['name'] for col in inspector.get_columns('categories')]
        if 'type' not in columns:
            print("Adicionando coluna 'type' à tabela categories...")
            db.execute(text("ALTER TABLE categories ADD COLUMN type TEXT DEFAULT 'expense'"))
            db.execute(text("UPDATE categories SET type = 'expense' WHERE type IS NULL OR type = ''"))
            db.commit()
            print("Coluna 'type' adicionada com sucesso!")
        else:
            result = db.execute(text("SELECT COUNT(*) FROM categories WHERE type IS NULL OR type = ''"))
            count = result.scalar()
            if count > 0:
                db.execute(text("UPDATE categories SET type = 'expense' WHERE type IS NULL OR type = ''"))
                db.commit()
                print(f"Atualizadas {count} categorias sem tipo")
    except Exception as e:
        print(f"Aviso ao migrar categorias: {e}")
        db.rollback()
    
    # Migração 2: Adicionar colunas de perfil à tabela users
    try:
        user_columns = [col['name'] for col in inspector.get_columns('users')]
        new_columns = {
            'first_name': "ALTER TABLE users ADD COLUMN first_name TEXT",
            'last_name': "ALTER TABLE users ADD COLUMN last_name TEXT",
            'phone': "ALTER TABLE users ADD COLUMN phone TEXT",
            'telegram': "ALTER TABLE users ADD COLUMN telegram TEXT",
            'updated_at': "ALTER TABLE users ADD COLUMN updated_at DATETIME"
        }
        
        for col_name, sql in new_columns.items():
            if col_name not in user_columns:
                print(f"Adicionando coluna '{col_name}' à tabela users...")
                db.execute(text(sql))
                if col_name == 'updated_at':
                    # Definir updated_at para created_at existente ou agora
                    db.execute(text("UPDATE users SET updated_at = created_at WHERE updated_at IS NULL"))
                db.commit()
                print(f"Coluna '{col_name}' adicionada com sucesso!")
    except Exception as e:
        print(f"Aviso ao migrar users: {e}")
        db.rollback()
    
    # Migração 3: Criar tabela fixed_transactions se não existir
    try:
        tables = inspector.get_table_names()
        if 'fixed_transactions' not in tables:
            print("Criando tabela 'fixed_transactions'...")
            models.FixedTransaction.__table__.create(bind=engine)
            print("Tabela 'fixed_transactions' criada com sucesso!")
    except Exception as e:
        print(f"Aviso ao criar tabela fixed_transactions: {e}")
        # Se falhar, tentar criar todas as tabelas (pode ser que a tabela já exista)
        try:
            Base.metadata.create_all(bind=engine)
        except:
            pass

    # Migração 4: Adicionar coluna end_date à tabela fixed_transactions
    try:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('fixed_transactions')]
        if 'end_date' not in columns:
            print("Adicionando coluna 'end_date' à tabela fixed_transactions...")
            db.execute(text("ALTER TABLE fixed_transactions ADD COLUMN end_date DATE"))
            db.commit()
            print("Coluna 'end_date' adicionada com sucesso!")
    except Exception as e:
        print(f"Aviso ao migrar fixed_transactions: {e}")
        db.rollback()

    # Migração 5: Adicionar coluna start_date à tabela fixed_transactions
    try:
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('fixed_transactions')]
        if 'start_date' not in columns:
            print("Adicionando coluna 'start_date' à tabela fixed_transactions...")
            db.execute(text("ALTER TABLE fixed_transactions ADD COLUMN start_date DATE"))
            db.execute(text("UPDATE fixed_transactions SET start_date = DATE(created_at) WHERE start_date IS NULL"))
            db.commit()
            print("Coluna 'start_date' adicionada com sucesso!")
    except Exception as e:
        print(f"Aviso ao migrar fixed_transactions start_date: {e}")
        db.rollback()

    # Migração 6: Remover constraint que exige conta/cartão em despesas fixas
    try:
        result = db.execute(text("SELECT sql FROM sqlite_master WHERE type='table' AND name='fixed_transactions'"))
        row = result.fetchone()
        table_sql = row[0] if row else ""
        if "check_fixed_expense_source" in table_sql or "account_id IS NOT NULL OR credit_card_id IS NOT NULL" in table_sql:
            print("Removendo constraint de conta/cartão em fixed_transactions...")
            db.execute(text("PRAGMA foreign_keys=OFF"))
            db.execute(text("""
                CREATE TABLE fixed_transactions_new (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    description TEXT NOT NULL,
                    amount NUMERIC(10, 2) NOT NULL,
                    day_of_month INTEGER NOT NULL,
                    start_date DATE,
                    end_date DATE,
                    category_id TEXT,
                    account_id TEXT,
                    credit_card_id TEXT,
                    created_at DATETIME,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL,
                    FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE SET NULL,
                    FOREIGN KEY(credit_card_id) REFERENCES credit_cards(id) ON DELETE SET NULL,
                    CONSTRAINT check_fixed_transaction_type CHECK (type IN ('income','expense')),
                    CONSTRAINT check_fixed_transaction_day CHECK (day_of_month >= 1 AND day_of_month <= 31)
                )
            """))
            db.execute(text("""
                INSERT INTO fixed_transactions_new
                (id, user_id, type, description, amount, day_of_month, start_date, end_date, category_id, account_id, credit_card_id, created_at)
                SELECT id, user_id, type, description, amount, day_of_month, start_date, end_date, category_id, account_id, credit_card_id, created_at
                FROM fixed_transactions
            """))
            db.execute(text("DROP TABLE fixed_transactions"))
            db.execute(text("ALTER TABLE fixed_transactions_new RENAME TO fixed_transactions"))
            db.execute(text("PRAGMA foreign_keys=ON"))
            db.commit()
            print("Constraint removida com sucesso!")
    except Exception as e:
        print(f"Aviso ao ajustar constraint fixed_transactions: {e}")
        db.rollback()
    
    db.close()
except Exception as e:
    print(f"Aviso ao fazer migrações: {e}")
    import traceback
    traceback.print_exc()
    try:
        db.close()
    except:
        pass

# Criar aplicação FastAPI
app = FastAPI(
    title="Finance API",
    description="API para controle financeiro pessoal com SQLite + WAL",
    version="1.0.0"
)

# Configurar CORS para permitir requisições do frontend (localhost e rede local)
# Usar regex para permitir qualquer IP na porta 5173 (para acesso pela rede local)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):(5173|3000)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(accounts.router)
app.include_router(credit_cards.router)
app.include_router(fixed_transactions.router)

@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "Finance API - Backend rodando com SQLite + WAL",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok", "database": "SQLite with WAL"}

if __name__ == "__main__":
    import uvicorn
    print("Iniciando servidor FastAPI...")
    print("Banco de dados: SQLite com WAL mode")
    print("Documentacao: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

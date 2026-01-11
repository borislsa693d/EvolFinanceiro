"""
Configuração do banco de dados SQLite com WAL (Write-Ahead Logging)
WAL permite leituras e escritas simultâneas, melhorando performance
"""
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Configurar SQLite com WAL mode
SQLALCHEMY_DATABASE_URL = "sqlite:///./finance.db"

# Criar engine com configurações otimizadas
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={
        "check_same_thread": False,  # Permitir múltiplas threads (necessário para FastAPI)
    },
    poolclass=StaticPool,  # Pool estático para SQLite
    echo=False  # Set True para debug SQL
)

# Ativar WAL mode
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    # Ativar WAL (Write-Ahead Logging)
    cursor.execute("PRAGMA journal_mode=WAL")
    # Otimizações adicionais
    cursor.execute("PRAGMA synchronous=NORMAL")  # Balanço entre segurança e performance
    cursor.execute("PRAGMA cache_size=-64000")   # 64MB de cache
    cursor.execute("PRAGMA temp_store=MEMORY")   # Tabelas temporárias em memória
    cursor.execute("PRAGMA mmap_size=30000000000")  # Memory-mapped I/O
    cursor.execute("PRAGMA foreign_keys=ON")     # Habilitar foreign keys
    cursor.close()

# Session local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

# Dependency para obter sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

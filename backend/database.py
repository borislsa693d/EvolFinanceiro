"""
SQLite database configuration with WAL (Write-Ahead Logging).
If DB_ENCRYPTION_KEY is defined, SQLCipher is used to encrypt the database.
"""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Database URL (SQLite by default)
SQLALCHEMY_DATABASE_URL = (
    os.getenv("SQLALCHEMY_DATABASE_URL")
    or os.getenv("DATABASE_URL")
    or "sqlite:///./finance.db"
)
DB_ENCRYPTION_KEY = os.getenv("DB_ENCRYPTION_KEY")
IS_SQLITE = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

if DB_ENCRYPTION_KEY:
    try:
        import pysqlcipher3  # noqa: F401
        from sqlalchemy.dialects import sqlite as sqlite_dialect  # noqa: F401

        if IS_SQLITE and not SQLALCHEMY_DATABASE_URL.startswith("sqlite+pysqlcipher"):
            SQLALCHEMY_DATABASE_URL = "sqlite+pysqlcipher:///./finance.db"
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "DB_ENCRYPTION_KEY defined, but SQLCipher is not installed. "
            "Install pysqlcipher3 or disable encryption."
        ) from exc

if IS_SQLITE:
    # SQLite engine with WAL-friendly settings
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={
            "check_same_thread": False,  # Required for FastAPI multi-threading
        },
        poolclass=StaticPool,
        echo=False,
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)

if IS_SQLITE:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        if DB_ENCRYPTION_KEY:
            cursor.execute(f"PRAGMA key = '{DB_ENCRYPTION_KEY}'")
            cursor.execute("PRAGMA cipher_compatibility = 4")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=-64000")   # 64MB cache
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.execute("PRAGMA mmap_size=30000000000")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

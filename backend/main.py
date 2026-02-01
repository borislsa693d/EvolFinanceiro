"""
FastAPI backend with SQLite (WAL enabled).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from routers import auth, transactions, categories, accounts, credit_cards, fixed_transactions

app = FastAPI(
    title="Finance API",
    description="API para controle financeiro pessoal com SQLite + WAL",
    version="1.0.0",
)

# CORS for local, LAN dev, and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://impulso.superglok-app.top",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):(5173|3000)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(accounts.router)
app.include_router(credit_cards.router)
app.include_router(fixed_transactions.router)

@app.get("/")
async def root():
    return {
        "message": "Finance API - Backend rodando com SQLite + WAL",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health")
async def health():
    return {"status": "ok", "database": "SQLite with WAL"}

if __name__ == "__main__":
    import uvicorn
    print("Iniciando servidor FastAPI...")
    print("Banco de dados: SQLite com WAL mode")
    print("Documentacao: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

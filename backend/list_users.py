"""Script temporário para listar usuários do banco"""
from database import SessionLocal
from models import User

db = SessionLocal()
try:
    users = db.query(User).all()
    print("=" * 50)
    print("USUÁRIOS CADASTRADOS NO BANCO:")
    print("=" * 50)
    if not users:
        print("Nenhum usuário encontrado.")
    else:
        for user in users:
            print(f"\nEmail: {user.email}")
            print(f"ID: {user.id}")
            print(f"Nome: {user.full_name or 'N/A'}")
            print(f"Criado em: {user.created_at}")
    print("=" * 50)
finally:
    db.close()



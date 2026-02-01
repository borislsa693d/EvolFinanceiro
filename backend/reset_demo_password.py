"""Script para resetar a senha da conta demo"""
from database import SessionLocal
from models import User
from auth import get_password_hash
import sys

def reset_demo_password(new_password: str):
    """Reseta a senha da conta demo"""
    db = SessionLocal()
    try:
        # Buscar usuário demo
        user = db.query(User).filter(User.email == "demo@fin.com").first()
        if not user:
            print("[ERRO] Usuario demo@fin.com nao encontrado!")
            return False
        
        # Atualizar senha
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        
        print("=" * 50)
        print("[OK] SENHA DA CONTA DEMO ATUALIZADA COM SUCESSO!")
        print("=" * 50)
        print(f"Email: demo@fin.com")
        print(f"Nova senha: {new_password}")
        print("=" * 50)
        return True
        
    except Exception as e:
        print(f"[ERRO] Erro: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Se não forneceu senha, usar senha padrão
        new_password = "demo123"
        print("[AVISO] Nenhuma senha fornecida. Usando senha padrao: demo123")
    else:
        new_password = sys.argv[1]
    
    reset_demo_password(new_password)


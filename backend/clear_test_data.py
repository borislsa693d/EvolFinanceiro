"""
Script para limpar dados de teste do banco de dados
USE COM CUIDADO - Remove todos os dados do usuário especificado
"""
from database import SessionLocal
import models
import sys

def clear_user_data(user_email: str):
    """Limpa todos os dados de um usuário específico"""
    db = SessionLocal()
    
    try:
        # Buscar usuário
        user = db.query(models.User).filter(models.User.email == user_email).first()
        if not user:
            print(f"Usuário {user_email} não encontrado!")
            return
        
        print(f"Usuário encontrado: {user.email} (ID: {user.id})")
        
        # Contar dados antes de deletar
        transactions_count = db.query(models.Transaction).filter(models.Transaction.user_id == user.id).count()
        categories_count = db.query(models.Category).filter(models.Category.user_id == user.id).count()
        accounts_count = db.query(models.Account).filter(models.Account.user_id == user.id).count()
        cards_count = db.query(models.CreditCard).filter(models.CreditCard.user_id == user.id).count()
        
        print(f"\nDados encontrados:")
        print(f"  - Transações: {transactions_count}")
        print(f"  - Categorias: {categories_count}")
        print(f"  - Contas: {accounts_count}")
        print(f"  - Cartões: {cards_count}")
        
        # Confirmar
        confirm = input(f"\nDeseja realmente deletar TODOS os dados de {user_email}? (digite 'SIM' para confirmar): ")
        if confirm != 'SIM':
            print("Operação cancelada.")
            return
        
        # Deletar dados (cascade vai cuidar dos relacionamentos)
        db.query(models.Transaction).filter(models.Transaction.user_id == user.id).delete()
        db.query(models.Category).filter(models.Category.user_id == user.id).delete()
        db.query(models.Account).filter(models.Account.user_id == user.id).delete()
        db.query(models.CreditCard).filter(models.CreditCard.user_id == user.id).delete()
        
        db.commit()
        
        print(f"\n✅ Dados deletados com sucesso!")
        print(f"  - {transactions_count} transações deletadas")
        print(f"  - {categories_count} categorias deletadas")
        print(f"  - {accounts_count} contas deletadas")
        print(f"  - {cards_count} cartões deletados")
        
        print("\n💡 As categorias padrão serão recriadas automaticamente no próximo registro ou ao acessar.")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python clear_test_data.py <email_do_usuario>")
        print("Exemplo: python clear_test_data.py demo@fin.com")
        sys.exit(1)
    
    email = sys.argv[1]
    clear_user_data(email)






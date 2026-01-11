"""
Modelos do banco de dados SQLite
"""
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, Integer, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)  # Nome completo (para compatibilidade)
    first_name = Column(String, nullable=True)  # Primeiro nome
    last_name = Column(String, nullable=True)   # Sobrenome
    phone = Column(String, nullable=True)       # Telefone/Celular
    telegram = Column(String, nullable=True)    # @Username Telegram
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)  # Atualizado manualmente no código
    
    # Relacionamentos
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    credit_cards = relationship("CreditCard", back_populates="user", cascade="all, delete-orphan")
    fixed_transactions = relationship("FixedTransaction", back_populates="user", cascade="all, delete-orphan")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String, default="#000000")
    type = Column(String, nullable=True, default="expense")  # 'income' or 'expense' - nullable=True para compatibilidade com migração
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint(
            "type IN ('income', 'expense')",
            name="check_category_type"
        ),
    )
    
    # Relacionamentos
    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)
    initial_balance = Column(Numeric(10, 2), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")

class CreditCard(Base):
    __tablename__ = "credit_cards"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    limit_total = Column(Numeric(10, 2), default=0)
    limit_available = Column(Numeric(10, 2), default=0)
    closing_day = Column(Integer, nullable=True)
    due_day = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", back_populates="credit_cards")
    transactions = relationship("Transaction", back_populates="credit_card")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # 'income' ou 'expense'
    description = Column(String, default="")
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(Date, nullable=False)
    category_id = Column(String, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    account_id = Column(String, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    credit_card_id = Column(String, ForeignKey("credit_cards.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Constraint: para expense, deve ter account_id ou credit_card_id
    __table_args__ = (
        CheckConstraint(
            "(type = 'income') OR (type = 'expense' AND (account_id IS NOT NULL OR credit_card_id IS NOT NULL))",
            name="check_expense_source"
        ),
        CheckConstraint(
            "type IN ('income', 'expense')",
            name="check_transaction_type"
        ),
    )
    
    # Relacionamentos
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
    credit_card = relationship("CreditCard", back_populates="transactions")

class FixedTransaction(Base):
    """Receitas e Despesas Fixas (recorrentes mensais)"""
    __tablename__ = "fixed_transactions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # 'income' ou 'expense'
    description = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    day_of_month = Column(Integer, nullable=False)  # Dia do mês (1-31) em que ocorre
    category_id = Column(String, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    account_id = Column(String, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    credit_card_id = Column(String, ForeignKey("credit_cards.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint(
            "type IN ('income', 'expense')",
            name="check_fixed_transaction_type"
        ),
        CheckConstraint(
            "day_of_month >= 1 AND day_of_month <= 31",
            name="check_fixed_transaction_day"
        ),
        CheckConstraint(
            "(type = 'income') OR (type = 'expense' AND (account_id IS NOT NULL OR credit_card_id IS NOT NULL))",
            name="check_fixed_expense_source"
        ),
    )
    
    # Relacionamentos
    user = relationship("User", back_populates="fixed_transactions")
    category = relationship("Category")
    account = relationship("Account")
    credit_card = relationship("CreditCard")

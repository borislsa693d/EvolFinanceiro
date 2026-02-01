"""
Schemas Pydantic para validação e serialização de dados
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

# ============= User Schemas =============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    telegram: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    telegram: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# ============= Category Schemas =============
class CategoryCreate(BaseModel):
    name: str
    color: Optional[str] = "#000000"
    type: str = "expense"  # 'income' or 'expense'

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    type: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    user_id: str
    name: str
    color: str
    type: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= Account Schemas =============
class AccountCreate(BaseModel):
    name: str
    type: Optional[str] = None
    initial_balance: Optional[Decimal] = Field(default=Decimal("0.00"), decimal_places=2)

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    initial_balance: Optional[Decimal] = None

class AccountResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: Optional[str]
    initial_balance: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= Credit Card Schemas =============
class CreditCardCreate(BaseModel):
    name: str
    limit_total: Optional[Decimal] = Field(default=Decimal("0.00"), decimal_places=2)
    limit_available: Optional[Decimal] = Field(default=Decimal("0.00"), decimal_places=2)
    closing_day: Optional[int] = None
    due_day: Optional[int] = None

class CreditCardUpdate(BaseModel):
    name: Optional[str] = None
    limit_total: Optional[Decimal] = None
    limit_available: Optional[Decimal] = None
    closing_day: Optional[int] = None
    due_day: Optional[int] = None

class CreditCardResponse(BaseModel):
    id: str
    user_id: str
    name: str
    limit_total: Decimal
    limit_available: Decimal
    closing_day: Optional[int]
    due_day: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= Transaction Schemas =============
class TransactionCreate(BaseModel):
    type: str  # 'income' or 'expense'
    description: Optional[str] = ""
    amount: Decimal = Field(..., decimal_places=2)
    date: str  # Formato: YYYY-MM-DD
    category_id: Optional[str] = None
    account_id: Optional[str] = None
    credit_card_id: Optional[str] = None

class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    date: Optional[str] = None
    category_id: Optional[str] = None
    account_id: Optional[str] = None
    credit_card_id: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    description: str
    amount: Decimal
    date: str
    category_id: Optional[str]
    account_id: Optional[str]
    credit_card_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= Fixed Transaction Schemas =============
class FixedTransactionCreate(BaseModel):
    type: str  # 'income' or 'expense'
    description: str
    amount: Decimal = Field(..., decimal_places=2)
    day_of_month: int = Field(..., ge=1, le=31)  # Dia do mês (1-31)
    start_date: Optional[str] = None  # YYYY-MM-DD (inclusive)
    end_date: Optional[str] = None  # YYYY-MM-DD (inclusive)
    category_id: Optional[str] = None
    account_id: Optional[str] = None
    credit_card_id: Optional[str] = None

class FixedTransactionUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    day_of_month: Optional[int] = Field(None, ge=1, le=31)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    category_id: Optional[str] = None
    account_id: Optional[str] = None
    credit_card_id: Optional[str] = None

class FixedTransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    description: str
    amount: Decimal
    day_of_month: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    category_id: Optional[str]
    account_id: Optional[str]
    credit_card_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============= Login Schema =============
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

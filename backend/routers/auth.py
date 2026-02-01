"""
Rotas de autenticação
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_password_hash, authenticate_user, create_access_token, get_current_user, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

def create_default_categories(user_id: str, db: Session):
    """Criar categorias padrão para um novo usuário"""
    default_categories = [
        # Entradas
        {"name": "Salário", "type": "income", "color": "#10b981"},
        {"name": "Freelance", "type": "income", "color": "#10b981"},
        {"name": "Vendas", "type": "income", "color": "#10b981"},
        {"name": "Investimentos", "type": "income", "color": "#10b981"},
        {"name": "Aluguel", "type": "income", "color": "#10b981"},
        {"name": "Cashback", "type": "income", "color": "#10b981"},
        {"name": "Reembolso", "type": "income", "color": "#10b981"},
        {"name": "Prêmios", "type": "income", "color": "#10b981"},
        {"name": "Transferência", "type": "income", "color": "#10b981"},
        {"name": "Outros", "type": "income", "color": "#10b981"},
        # Saídas
        {"name": "Moradia", "type": "expense", "color": "#8b5cf6"},
        {"name": "Alimentação", "type": "expense", "color": "#ef4444"},
        {"name": "Transporte", "type": "expense", "color": "#3b82f6"},
        {"name": "Saúde", "type": "expense", "color": "#f59e0b"},
        {"name": "Educação", "type": "expense", "color": "#06b6d4"},
        {"name": "Lazer", "type": "expense", "color": "#ec4899"},
        {"name": "Compras", "type": "expense", "color": "#6366f1"},
        {"name": "Assinaturas", "type": "expense", "color": "#14b8a6"},
        {"name": "Fatura", "type": "expense", "color": "#f97316"},
        {"name": "Outros", "type": "expense", "color": "#6b7280"},
    ]
    
    for cat_data in default_categories:
        category = models.Category(
            user_id=user_id,
            name=cat_data["name"],
            type=cat_data["type"],
            color=cat_data["color"]
        )
        db.add(category)
    
    db.commit()

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Registrar novo usuário"""
    # Verificar se email já existe
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Criar novo usuário
    hashed_password = get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Criar categorias padrão
    create_default_categories(new_user.id, db)
    
    return new_user

@router.post("/login", response_model=schemas.Token)
async def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Login e obtenção de token JWT"""
    user = authenticate_user(db, login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Criar token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: models.User = Depends(get_current_user)):
    """Obter dados do usuário autenticado"""
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
async def update_me(
    user_data: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar dados do usuário autenticado"""
    # Atualizar campos se fornecidos
    if user_data.first_name is not None:
        current_user.first_name = user_data.first_name
    
    if user_data.last_name is not None:
        current_user.last_name = user_data.last_name
    
    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    elif user_data.first_name or user_data.last_name:
        # Atualizar full_name automaticamente se nome/sobrenome foram alterados
        first = user_data.first_name if user_data.first_name is not None else current_user.first_name
        last = user_data.last_name if user_data.last_name is not None else current_user.last_name
        if first and last:
            current_user.full_name = f"{first} {last}".strip()
        elif first:
            current_user.full_name = first
        elif last:
            current_user.full_name = last
    
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    
    if user_data.telegram is not None:
        current_user.telegram = user_data.telegram
    
    # Atualizar updated_at
    current_user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.put("/change-password")
async def change_password(
    payload: schemas.PasswordChange,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Alterar senha do usuário autenticado"""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    current_user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(current_user)

    return {"message": "Senha atualizada com sucesso"}

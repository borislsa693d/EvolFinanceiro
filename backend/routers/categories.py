"""
Rotas de categorias
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[schemas.CategoryResponse])
async def get_categories(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar categorias do usuário"""
    categories = db.query(models.Category).filter(
        models.Category.user_id == current_user.id
    ).all()
    
    # Garantir que todas as categorias tenham type definido
    updated = False
    for category in categories:
        if not category.type or category.type == '':
            category.type = 'expense'
            updated = True
    
    if updated:
        db.commit()
        # Recarregar categorias após atualização
        categories = db.query(models.Category).filter(
            models.Category.user_id == current_user.id
        ).all()
    
    return categories

@router.get("/{category_id}", response_model=schemas.CategoryResponse)
async def get_category(
    category_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter categoria específica"""
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    # Garantir que a categoria tenha type definido
    if not category.type or category.type == '':
        category.type = 'expense'
        db.commit()
        db.refresh(category)
    
    return category

@router.post("", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: schemas.CategoryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar nova categoria"""
    if category_data.type not in ['income', 'expense']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo deve ser 'income' ou 'expense'"
        )
    
    new_category = models.Category(
        user_id=current_user.id,
        name=category_data.name,
        color=category_data.color or "#000000",
        type=category_data.type or 'expense'  # Garantir que sempre tenha um valor
    )
    
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return new_category

@router.put("/{category_id}", response_model=schemas.CategoryResponse)
async def update_category(
    category_id: str,
    category_data: schemas.CategoryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar categoria"""
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    if category_data.name is not None:
        category.name = category_data.name
    
    if category_data.color is not None:
        category.color = category_data.color
    
    if category_data.type is not None:
        if category_data.type not in ['income', 'expense']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo deve ser 'income' ou 'expense'"
            )
        category.type = category_data.type
    
    db.commit()
    db.refresh(category)
    
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar categoria"""
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    db.delete(category)
    db.commit()
    
    return None


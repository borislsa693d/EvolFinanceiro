"""
Rotas de cartões de crédito
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/credit-cards", tags=["Credit Cards"])

@router.get("", response_model=List[schemas.CreditCardResponse])
async def get_credit_cards(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar cartões de crédito do usuário"""
    credit_cards = db.query(models.CreditCard).filter(
        models.CreditCard.user_id == current_user.id
    ).all()
    
    return credit_cards

@router.get("/{card_id}", response_model=schemas.CreditCardResponse)
async def get_credit_card(
    card_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter cartão de crédito específico"""
    credit_card = db.query(models.CreditCard).filter(
        models.CreditCard.id == card_id,
        models.CreditCard.user_id == current_user.id
    ).first()
    
    if not credit_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cartão de crédito não encontrado"
        )
    
    return credit_card

@router.post("", response_model=schemas.CreditCardResponse, status_code=status.HTTP_201_CREATED)
async def create_credit_card(
    card_data: schemas.CreditCardCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar novo cartão de crédito"""
    new_card = models.CreditCard(
        user_id=current_user.id,
        name=card_data.name,
        limit_total=card_data.limit_total or 0,
        limit_available=card_data.limit_available or 0,
        closing_day=card_data.closing_day,
        due_day=card_data.due_day
    )
    
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    
    return new_card

@router.put("/{card_id}", response_model=schemas.CreditCardResponse)
async def update_credit_card(
    card_id: str,
    card_data: schemas.CreditCardUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar cartão de crédito"""
    credit_card = db.query(models.CreditCard).filter(
        models.CreditCard.id == card_id,
        models.CreditCard.user_id == current_user.id
    ).first()
    
    if not credit_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cartão de crédito não encontrado"
        )
    
    if card_data.name is not None:
        credit_card.name = card_data.name
    
    if card_data.limit_total is not None:
        credit_card.limit_total = card_data.limit_total
    
    if card_data.limit_available is not None:
        credit_card.limit_available = card_data.limit_available
    
    if card_data.closing_day is not None:
        credit_card.closing_day = card_data.closing_day
    
    if card_data.due_day is not None:
        credit_card.due_day = card_data.due_day
    
    db.commit()
    db.refresh(credit_card)
    
    return credit_card

@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_credit_card(
    card_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar cartão de crédito"""
    credit_card = db.query(models.CreditCard).filter(
        models.CreditCard.id == card_id,
        models.CreditCard.user_id == current_user.id
    ).first()
    
    if not credit_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cartão de crédito não encontrado"
        )
    
    db.delete(credit_card)
    db.commit()
    
    return None



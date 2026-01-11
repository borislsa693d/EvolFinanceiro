from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, CreditCard
from schemas import CreditCard as CreditCardSchema, CreditCardCreate, CreditCardUpdate
from auth import get_current_user

router = APIRouter(prefix="/credit-cards", tags=["Credit Cards"])

@router.get("", response_model=List[CreditCardSchema])
def get_credit_cards(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar cartões de crédito do usuário"""
    credit_cards = db.query(CreditCard).filter(
        CreditCard.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return credit_cards

@router.get("/{card_id}", response_model=CreditCardSchema)
def get_credit_card(
    card_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter um cartão de crédito específico"""
    card = db.query(CreditCard).filter(
        CreditCard.id == card_id,
        CreditCard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found"
        )
    
    return card

@router.post("", response_model=CreditCardSchema, status_code=status.HTTP_201_CREATED)
def create_credit_card(
    card_data: CreditCardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar novo cartão de crédito"""
    new_card = CreditCard(
        **card_data.model_dump(),
        user_id=current_user.id
    )
    
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    
    return new_card

@router.put("/{card_id}", response_model=CreditCardSchema)
def update_credit_card(
    card_id: str,
    card_data: CreditCardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar cartão de crédito"""
    card = db.query(CreditCard).filter(
        CreditCard.id == card_id,
        CreditCard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found"
        )
    
    update_data = card_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(card, field, value)
    
    db.commit()
    db.refresh(card)
    
    return card

@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_credit_card(
    card_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar cartão de crédito"""
    card = db.query(CreditCard).filter(
        CreditCard.id == card_id,
        CreditCard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found"
        )
    
    db.delete(card)
    db.commit()
    
    return None


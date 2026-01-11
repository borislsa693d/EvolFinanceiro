"""
Rotas de receitas e despesas fixas (recorrentes mensais)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/fixed-transactions", tags=["Fixed Transactions"])

@router.get("", response_model=List[schemas.FixedTransactionResponse])
async def get_fixed_transactions(
    type: Optional[str] = Query(None, description="Filtrar por tipo: 'income' ou 'expense'"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar receitas/despesas fixas do usuário"""
    query = db.query(models.FixedTransaction).filter(
        models.FixedTransaction.user_id == current_user.id
    )
    
    if type:
        query = query.filter(models.FixedTransaction.type == type)
    
    fixed_transactions = query.order_by(
        models.FixedTransaction.day_of_month,
        models.FixedTransaction.type
    ).all()
    
    result = []
    for ft in fixed_transactions:
        result.append({
            "id": ft.id,
            "user_id": ft.user_id,
            "type": ft.type,
            "description": ft.description,
            "amount": ft.amount,
            "day_of_month": ft.day_of_month,
            "category_id": ft.category_id,
            "account_id": ft.account_id,
            "credit_card_id": ft.credit_card_id,
            "created_at": ft.created_at
        })
    
    return result

@router.get("/{fixed_transaction_id}", response_model=schemas.FixedTransactionResponse)
async def get_fixed_transaction(
    fixed_transaction_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter uma receita/despesa fixa específica"""
    fixed_transaction = db.query(models.FixedTransaction).filter(
        models.FixedTransaction.id == fixed_transaction_id,
        models.FixedTransaction.user_id == current_user.id
    ).first()
    
    if not fixed_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receita/Despesa fixa não encontrada"
        )
    
    return {
        "id": fixed_transaction.id,
        "user_id": fixed_transaction.user_id,
        "type": fixed_transaction.type,
        "description": fixed_transaction.description,
        "amount": fixed_transaction.amount,
        "day_of_month": fixed_transaction.day_of_month,
        "category_id": fixed_transaction.category_id,
        "account_id": fixed_transaction.account_id,
        "credit_card_id": fixed_transaction.credit_card_id,
        "created_at": fixed_transaction.created_at
    }

@router.post("", response_model=schemas.FixedTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_fixed_transaction(
    fixed_data: schemas.FixedTransactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar uma nova receita/despesa fixa"""
    # Validar que expense tem account_id ou credit_card_id
    if fixed_data.type == 'expense':
        if not fixed_data.account_id and not fixed_data.credit_card_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Despesa fixa deve ter account_id ou credit_card_id"
            )
    
    # Validar dia do mês
    if fixed_data.day_of_month < 1 or fixed_data.day_of_month > 31:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dia do mês deve ser entre 1 e 31"
        )
    
    new_fixed = models.FixedTransaction(
        user_id=current_user.id,
        type=fixed_data.type,
        description=fixed_data.description,
        amount=fixed_data.amount,
        day_of_month=fixed_data.day_of_month,
        category_id=fixed_data.category_id,
        account_id=fixed_data.account_id,
        credit_card_id=fixed_data.credit_card_id
    )
    
    db.add(new_fixed)
    db.commit()
    db.refresh(new_fixed)
    
    return {
        "id": new_fixed.id,
        "user_id": new_fixed.user_id,
        "type": new_fixed.type,
        "description": new_fixed.description,
        "amount": new_fixed.amount,
        "day_of_month": new_fixed.day_of_month,
        "category_id": new_fixed.category_id,
        "account_id": new_fixed.account_id,
        "credit_card_id": new_fixed.credit_card_id,
        "created_at": new_fixed.created_at
    }

@router.put("/{fixed_transaction_id}", response_model=schemas.FixedTransactionResponse)
async def update_fixed_transaction(
    fixed_transaction_id: str,
    fixed_data: schemas.FixedTransactionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar uma receita/despesa fixa"""
    fixed_transaction = db.query(models.FixedTransaction).filter(
        models.FixedTransaction.id == fixed_transaction_id,
        models.FixedTransaction.user_id == current_user.id
    ).first()
    
    if not fixed_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receita/Despesa fixa não encontrada"
        )
    
    # Validar se está tentando mudar tipo para expense sem account/credit_card
    if fixed_data.type is not None:
        fixed_transaction.type = fixed_data.type
        if fixed_data.type == 'expense':
            if not fixed_data.account_id and not fixed_data.credit_card_id and not fixed_transaction.account_id and not fixed_transaction.credit_card_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Despesa fixa deve ter account_id ou credit_card_id"
                )
    
    if fixed_data.description is not None:
        fixed_transaction.description = fixed_data.description
    if fixed_data.amount is not None:
        fixed_transaction.amount = fixed_data.amount
    if fixed_data.day_of_month is not None:
        if fixed_data.day_of_month < 1 or fixed_data.day_of_month > 31:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dia do mês deve ser entre 1 e 31"
            )
        fixed_transaction.day_of_month = fixed_data.day_of_month
    if fixed_data.category_id is not None:
        fixed_transaction.category_id = fixed_data.category_id
    if fixed_data.account_id is not None:
        fixed_transaction.account_id = fixed_data.account_id
    if fixed_data.credit_card_id is not None:
        fixed_transaction.credit_card_id = fixed_data.credit_card_id
    
    db.commit()
    db.refresh(fixed_transaction)
    
    return {
        "id": fixed_transaction.id,
        "user_id": fixed_transaction.user_id,
        "type": fixed_transaction.type,
        "description": fixed_transaction.description,
        "amount": fixed_transaction.amount,
        "day_of_month": fixed_transaction.day_of_month,
        "category_id": fixed_transaction.category_id,
        "account_id": fixed_transaction.account_id,
        "credit_card_id": fixed_transaction.credit_card_id,
        "created_at": fixed_transaction.created_at
    }

@router.delete("/{fixed_transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fixed_transaction(
    fixed_transaction_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar uma receita/despesa fixa"""
    fixed_transaction = db.query(models.FixedTransaction).filter(
        models.FixedTransaction.id == fixed_transaction_id,
        models.FixedTransaction.user_id == current_user.id
    ).first()
    
    if not fixed_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receita/Despesa fixa não encontrada"
        )
    
    db.delete(fixed_transaction)
    db.commit()
    
    return None


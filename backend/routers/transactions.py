"""
Rotas de transações
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[schemas.TransactionResponse])
async def get_transactions(
    type: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    account_id: Optional[str] = Query(None),
    credit_card_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar transações do usuário com filtros opcionais"""
    query = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    
    # Aplicar filtros
    if type:
        query = query.filter(models.Transaction.type == type)
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    if account_id:
        query = query.filter(models.Transaction.account_id == account_id)
    if credit_card_id:
        query = query.filter(models.Transaction.credit_card_id == credit_card_id)
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    
    # Ordenar por data (mais recentes primeiro)
    transactions = query.order_by(models.Transaction.date.desc()).all()
    
    # Converter date para string no formato esperado
    result = []
    for trans in transactions:
        trans_dict = {
            "id": trans.id,
            "user_id": trans.user_id,
            "type": trans.type,
            "description": trans.description,
            "amount": trans.amount,
            "date": trans.date.strftime("%Y-%m-%d"),
            "category_id": trans.category_id,
            "account_id": trans.account_id,
            "credit_card_id": trans.credit_card_id,
            "created_at": trans.created_at
        }
        result.append(schemas.TransactionResponse(**trans_dict))
    
    return result

@router.get("/{transaction_id}", response_model=schemas.TransactionResponse)
async def get_transaction(
    transaction_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter transação específica"""
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada"
        )
    
    # Converter date para string
    trans_dict = {
        "id": transaction.id,
        "user_id": transaction.user_id,
        "type": transaction.type,
        "description": transaction.description,
        "amount": transaction.amount,
        "date": transaction.date.strftime("%Y-%m-%d"),
        "category_id": transaction.category_id,
        "account_id": transaction.account_id,
        "credit_card_id": transaction.credit_card_id,
        "created_at": transaction.created_at
    }
    
    return schemas.TransactionResponse(**trans_dict)

@router.post("", response_model=schemas.TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: schemas.TransactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar nova transação"""
    # Validar tipo
    if transaction_data.type not in ['income', 'expense']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo deve ser 'income' ou 'expense'"
        )
    
    # Validar que expense tem account_id ou credit_card_id
    if transaction_data.type == 'expense':
        if not transaction_data.account_id and not transaction_data.credit_card_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transação de despesa deve ter account_id ou credit_card_id"
            )
    
    # Converter string de data para date object
    try:
        date_obj = datetime.strptime(transaction_data.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data deve estar no formato YYYY-MM-DD"
        )
    
    # Criar transação
    new_transaction = models.Transaction(
        user_id=current_user.id,
        type=transaction_data.type,
        description=transaction_data.description,
        amount=transaction_data.amount,
        date=date_obj,
        category_id=transaction_data.category_id,
        account_id=transaction_data.account_id,
        credit_card_id=transaction_data.credit_card_id
    )
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    # Converter para response
    trans_dict = {
        "id": new_transaction.id,
        "user_id": new_transaction.user_id,
        "type": new_transaction.type,
        "description": new_transaction.description,
        "amount": new_transaction.amount,
        "date": new_transaction.date.strftime("%Y-%m-%d"),
        "category_id": new_transaction.category_id,
        "account_id": new_transaction.account_id,
        "credit_card_id": new_transaction.credit_card_id,
        "created_at": new_transaction.created_at
    }
    
    return schemas.TransactionResponse(**trans_dict)

@router.put("/{transaction_id}", response_model=schemas.TransactionResponse)
async def update_transaction(
    transaction_id: str,
    transaction_data: schemas.TransactionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar transação"""
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada"
        )
    
    # Atualizar campos
    if transaction_data.type is not None:
        if transaction_data.type not in ['income', 'expense']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo deve ser 'income' ou 'expense'"
            )
        transaction.type = transaction_data.type
    
    if transaction_data.description is not None:
        transaction.description = transaction_data.description
    
    if transaction_data.amount is not None:
        transaction.amount = transaction_data.amount
    
    if transaction_data.date is not None:
        try:
            transaction.date = datetime.strptime(transaction_data.date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data deve estar no formato YYYY-MM-DD"
            )
    
    if transaction_data.category_id is not None:
        transaction.category_id = transaction_data.category_id
    
    if transaction_data.account_id is not None:
        transaction.account_id = transaction_data.account_id
    
    if transaction_data.credit_card_id is not None:
        transaction.credit_card_id = transaction_data.credit_card_id
    
    db.commit()
    db.refresh(transaction)
    
    # Converter para response
    trans_dict = {
        "id": transaction.id,
        "user_id": transaction.user_id,
        "type": transaction.type,
        "description": transaction.description,
        "amount": transaction.amount,
        "date": transaction.date.strftime("%Y-%m-%d"),
        "category_id": transaction.category_id,
        "account_id": transaction.account_id,
        "credit_card_id": transaction.credit_card_id,
        "created_at": transaction.created_at
    }
    
    return schemas.TransactionResponse(**trans_dict)

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar transação"""
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada"
        )
    
    db.delete(transaction)
    db.commit()
    
    return None





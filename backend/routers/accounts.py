"""
Rotas de contas
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("", response_model=List[schemas.AccountResponse])
async def get_accounts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar contas do usuário"""
    accounts = db.query(models.Account).filter(
        models.Account.user_id == current_user.id
    ).all()
    
    return accounts

@router.get("/{account_id}", response_model=schemas.AccountResponse)
async def get_account(
    account_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter conta específica"""
    account = db.query(models.Account).filter(
        models.Account.id == account_id,
        models.Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )
    
    return account

@router.post("", response_model=schemas.AccountResponse, status_code=status.HTTP_201_CREATED)
async def create_account(
    account_data: schemas.AccountCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar nova conta"""
    new_account = models.Account(
        user_id=current_user.id,
        name=account_data.name,
        type=account_data.type,
        initial_balance=account_data.initial_balance or 0
    )
    
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    
    return new_account

@router.put("/{account_id}", response_model=schemas.AccountResponse)
async def update_account(
    account_id: str,
    account_data: schemas.AccountUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar conta"""
    account = db.query(models.Account).filter(
        models.Account.id == account_id,
        models.Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )
    
    if account_data.name is not None:
        account.name = account_data.name
    
    if account_data.type is not None:
        account.type = account_data.type
    
    if account_data.initial_balance is not None:
        account.initial_balance = account_data.initial_balance
    
    db.commit()
    db.refresh(account)
    
    return account

@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    account_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar conta"""
    account = db.query(models.Account).filter(
        models.Account.id == account_id,
        models.Account.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta não encontrada"
        )
    
    db.delete(account)
    db.commit()
    
    return None



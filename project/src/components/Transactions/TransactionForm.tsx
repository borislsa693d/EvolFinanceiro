import React, { useEffect, useMemo, useState } from 'react';
import { transactionsAPI, categoriesAPI, accountsAPI, creditCardsAPI } from '../../lib/api';
import type { Category, Account, CreditCard, Transaction } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import './NewTransactionPage.css';

interface CombinedAccount {
  id: string;
  name: string;
  type: 'Conta' | 'Cartão';
}

interface TransactionFormProps {
  editTransaction?: Transaction;
  onCancel: () => void;
  onSaved?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ editTransaction, onCancel, onSaved }) => {
  const { user } = useAuth();
  const isEditing = !!editTransaction;

  const [transactionType, setTransactionType] = useState<'Receita' | 'Despesa'>('Despesa');
  const [description, setDescription] = useState('');
  const [amountDigits, setAmountDigits] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [dateType, setDateType] = useState<'Hoje' | 'Ontem' | 'Outra'>('Hoje');
  const [customDate, setCustomDate] = useState(new Date());

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isEditing && editTransaction) {
      setTransactionType(editTransaction.type === 'income' ? 'Receita' : 'Despesa');
      setDescription(editTransaction.description || '');
      const cents = Math.round(editTransaction.amount * 100);
      setAmountDigits(cents > 0 ? String(cents) : '');
      setCategoryId(editTransaction.category_id || '');

      if (editTransaction.account_id) {
        setAccountId(`acc-${editTransaction.account_id}`);
      } else if (editTransaction.credit_card_id) {
        setAccountId(`card-${editTransaction.credit_card_id}`);
      }

      const transDate = new Date(editTransaction.date + 'T00:00:00');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      today.setHours(0, 0, 0, 0);
      yesterday.setHours(0, 0, 0, 0);
      transDate.setHours(0, 0, 0, 0);

      if (transDate.getTime() === today.getTime()) {
        setDateType('Hoje');
      } else if (transDate.getTime() === yesterday.getTime()) {
        setDateType('Ontem');
      } else {
        setDateType('Outra');
        setCustomDate(transDate);
      }
    }
  }, [isEditing, editTransaction]);

  const fetchData = async () => {
    try {
      const [categoriesData, accountsData, cardsData] = await Promise.all([
        categoriesAPI.getAll(),
        accountsAPI.getAll(),
        creditCardsAPI.getAll(),
      ]);

      setCategories(categoriesData);
      setAccounts(accountsData);
      setCreditCards(cardsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const combinedAccounts: CombinedAccount[] = useMemo(
    () => [
      ...accounts.map((a) => ({ id: `acc-${a.id}`, name: a.name, type: 'Conta' as const })),
      ...creditCards.map((c) => ({ id: `card-${c.id}`, name: c.name, type: 'Cartão' as const })),
    ],
    [accounts, creditCards],
  );

  const filteredCategories = useMemo(() => {
    const targetType = transactionType === 'Receita' ? 'income' : 'expense';
    return categories.filter((cat) => cat.type === targetType);
  }, [categories, transactionType]);

  useEffect(() => {
    if (categoryId && !filteredCategories.some((cat) => cat.id === categoryId)) {
      setCategoryId('');
    }
  }, [categoryId, filteredCategories]);

  const handleSave = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    let transactionDate = new Date();
    if (dateType === 'Ontem') {
      transactionDate.setDate(transactionDate.getDate() - 1);
    } else if (dateType === 'Outra') {
      transactionDate = new Date(customDate);
    }

    const amountValue = amountDigits ? Number(amountDigits) / 100 : 0;
    const transactionData = {
      type: transactionType === 'Receita' ? ('income' as const) : ('expense' as const),
      description,
      amount: amountValue,
      category_id: categoryId || undefined,
      account_id: accountId.startsWith('acc-') ? accountId.replace('acc-', '') : undefined,
      credit_card_id: accountId.startsWith('card-') ? accountId.replace('card-', '') : undefined,
      date: transactionDate.toISOString().split('T')[0],
    };

    try {
      if (isEditing && editTransaction) {
        await transactionsAPI.update(editTransaction.id, transactionData);
      } else {
        await transactionsAPI.create(transactionData);
      }
      if (onSaved) {
        onSaved();
      } else {
        onCancel();
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Erro ao salvar transação. Verifique os dados.');
    }
  };

  const formatCurrencyFromDigits = (digits: string) => {
    const normalized = digits ? digits : '0';
    const value = Number(normalized) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleAmountChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    setAmountDigits(digitsOnly);
  };

  return (
    <div className="transaction-form">
      <div className="tipo-toggle">
        <button
          type="button"
          className={transactionType === 'Despesa' ? 'active' : ''}
          onClick={() => setTransactionType('Despesa')}
        >
          Despesa
        </button>
        <button
          type="button"
          className={transactionType === 'Receita' ? 'active' : ''}
          onClick={() => setTransactionType('Receita')}
        >
          Receita
        </button>
      </div>

      <div className="form-field">
        <label>Descrição</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="form-field">
        <label>Valor</label>
        <input
          type="text"
          inputMode="numeric"
          value={formatCurrencyFromDigits(amountDigits)}
          onChange={(e) => handleAmountChange(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label>Categoria</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Selecione...</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Conta/Cartão</label>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Selecione...</option>
          {combinedAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.type})
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>Data</label>
        <div className="date-toggle">
          <button className={dateType === 'Hoje' ? 'active' : ''} onClick={() => setDateType('Hoje')}>
            Hoje
          </button>
          <button className={dateType === 'Ontem' ? 'active' : ''} onClick={() => setDateType('Ontem')}>
            Ontem
          </button>
          <button className={dateType === 'Outra' ? 'active' : ''} onClick={() => setDateType('Outra')}>
            Outra
          </button>
        </div>
        {dateType === 'Outra' && (
          <div className="custom-date-picker">
            <input
              type="date"
              value={customDate.toISOString().split('T')[0]}
              onChange={(e) => setCustomDate(new Date(e.target.value + 'T00:00:00'))}
            />
          </div>
        )}
      </div>

      <div className="modal-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="button-primary" onClick={handleSave}>
          {isEditing ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;

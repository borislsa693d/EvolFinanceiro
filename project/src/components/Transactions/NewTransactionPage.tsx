import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './NewTransactionPage.css'; // Re-using the same CSS for the form

// Mirroring types from inspection
interface Categoria {
  id: string;
  nome: string;
}
interface Conta {
  id: string;
  banco: string;
}
interface Cartao {
  id: string;
  nome: string;
}

const NewTransactionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transactionType, setTransactionType] = useState<'Entrada' | 'Saída'>('Saída');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [dateType, setDateType] = useState<'Hoje' | 'Ontem' | 'Outra'>('Hoje');
  const [customDate, setCustomDate] = useState(new Date());

  const [categories, setCategories] = useState<Categoria[]>([]);
  const [accounts, setAccounts] = useState<Conta[]>([]);
  const [creditCards, setCreditCards] = useState<Cartao[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const { data: categoriesData } = await supabase.from('categories').select('id, name');
      const { data: accountsData } = await supabase.from('accounts').select('id, name AS banco');
      const { data: cardsData } = await supabase.from('credit_cards').select('id, name');

      if (categoriesData) setCategories(categoriesData.map(c => ({...c, nome: c.name})));
      if (accountsData) setAccounts(accountsData.map(a => ({...a, banco: a.banco})));
      if (cardsData) setCreditCards(cardsData.map(c => ({...c, nome: c.name})));
    };

    fetchData();
  }, []);

  const combinedAccounts = [
    ...accounts.map(a => ({ id: `acc-${a.id}`, name: a.banco, type: 'Conta' })),
    ...creditCards.map(c => ({ id: `card-${c.id}`, name: c.nome, type: 'Cartão' }))
  ];

  const handleSave = async () => {
    if (!user) {
        console.error("User not authenticated");
        return;
    }

    let transactionDate = new Date();
    if (dateType === 'Ontem') {
      transactionDate.setDate(transactionDate.getDate() - 1);
    } else if (dateType === 'Outra') {
      transactionDate = new Date(customDate); // Ensure it's a new Date object
    }

    const newTransaction = {
      user_id: user.id,
      type: transactionType === 'Entrada' ? 'income' : 'expense',
      description,
      amount: parseFloat(amount),
      category_id: categoryId || null,
      account_id: accountId.startsWith('acc-') ? accountId.replace('acc-', '') : null,
      credit_card_id: accountId.startsWith('card-') ? accountId.replace('card-', '') : null,
      date: transactionDate.toISOString().split('T')[0],
    };
    
    try {
        const { error } = await supabase.from('transactions').insert([newTransaction]);
        if (error) throw error;
        navigate('/'); // Navigate to dashboard on success
    } catch (error) {
        console.error("Error saving transaction:", error);
        // TODO: Show error to user
    }
  };
  
  // Note: I had to correct the supabase query for accounts to use 'name AS banco'
  // Also corrected the customDate handler to work with the date input value.

  return (
    <div className="new-transaction-page-container">
      <h2 className="new-transaction-page-title">Registrar Transação</h2>
      <div className="transaction-form">
        <div className="tipo-toggle">
          <button
            type="button"
            className={transactionType === 'Saída' ? 'active' : ''}
            onClick={() => setTransactionType('Saída')}
          >
            Saída
          </button>
          <button
            type="button"
            className={transactionType === 'Entrada' ? 'active' : ''}
            onClick={() => setTransactionType('Entrada')}
          >
            Entrada
          </button>
        </div>
        
        <div className="form-field">
          <label>Descrição</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        
        <div className="form-field">
          <label>Valor</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="R$ 0,00" />
        </div>
        
        <div className="form-field">
          <label>Categoria</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Selecione...</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
          </select>
        </div>
        
        <div className="form-field">
          <label>Conta/Cartão</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)}>
            <option value="">Selecione...</option>
            {combinedAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
          </select>
        </div>
        
        <div className="form-field">
          <label>Data</label>
          <div className="date-toggle">
            <button className={dateType === 'Hoje' ? 'active' : ''} onClick={() => setDateType('Hoje')}>Hoje</button>
            <button className={dateType === 'Ontem' ? 'active' : ''} onClick={() => setDateType('Ontem')}>Ontem</button>
            <button className={dateType === 'Outra' ? 'active' : ''} onClick={() => setDateType('Outra')}>Outra</button>
          </div>
          {dateType === 'Outra' && (
            <div className="custom-date-picker">
              <input 
                type="date" 
                value={customDate.toISOString().split('T')[0]}
                onChange={e => setCustomDate(new Date(e.target.value + 'T00:00:00'))} // Fix timezone issues
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={() => navigate(-1)}>Cancelar</button>
          <button type="button" className="button-primary" onClick={handleSave}>Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default NewTransactionPage;


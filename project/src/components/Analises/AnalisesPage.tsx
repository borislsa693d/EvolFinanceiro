import { useEffect, useState } from 'react';
import { supabase, Transaction, Category, CreditCard } from '../../lib/supabase';
import Analyses from '../Dashboard/Analyses';

export default function AnalisesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsRes, categoriesRes, creditCardsRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('credit_cards').select('*'),
      ]);

      if (transactionsRes.data) setTransactions(transactionsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (creditCardsRes.data) setCreditCards(creditCardsRes.data);
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#000000', 
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <Analyses
      transactions={transactions}
      categories={categories}
      creditCards={creditCards}
    />
  );
}


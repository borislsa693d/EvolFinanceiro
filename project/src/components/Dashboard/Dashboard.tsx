import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Transaction, Category, CreditCard } from '../../lib/supabase';
import StatsCards from './StatsCards';
import ExpensesByCategory from './ExpensesByCategory';
import WealthEvolution from './WealthEvolution';
import { LogOut } from 'lucide-react';
import '../../styles/dashboard.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Bypass: seed inicial apenas se houver user
    if (user) {
      seedInitialData();
    }
  }, [user]);

  const loadData = async () => {
    // Bypass: funciona mesmo sem user autenticado
    // if (!user) return;

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
      console.log('Erro ao carregar dados (modo bypass):', error);
    }

    setLoading(false);
  };

  const seedInitialData = async () => {
    // Bypass: desabilitado seed inicial sem user
    if (!user) return;

    const { data: existingCategories } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (existingCategories && existingCategories.length === 0) {
      const defaultCategories = [
        { name: 'Alimentação', color: '#ffffff', user_id: user.id },
        { name: 'Transporte', color: '#cccccc', user_id: user.id },
        { name: 'Moradia', color: '#999999', user_id: user.id },
        { name: 'Lazer', color: '#666666', user_id: user.id },
        { name: 'Saúde', color: '#333333', user_id: user.id },
      ];

      await supabase.from('categories').insert(defaultCategories);

      const { data: newCategories } = await supabase
        .from('categories')
        .select('*');

      if (newCategories) {
        const sampleTransactions = [
          {
            user_id: user.id,
            category_id: newCategories[0].id,
            type: 'expense',
            amount: 450.00,
            description: 'Supermercado',
            date: '2026-01-01',
          },
          {
            user_id: user.id,
            category_id: newCategories[1].id,
            type: 'expense',
            amount: 200.00,
            description: 'Combustível',
            date: '2026-01-02',
          },
          {
            user_id: user.id,
            category_id: newCategories[2].id,
            type: 'expense',
            amount: 1200.00,
            description: 'Aluguel',
            date: '2025-12-28',
          },
          {
            user_id: user.id,
            category_id: newCategories[3].id,
            type: 'expense',
            amount: 150.00,
            description: 'Cinema',
            date: '2025-12-30',
          },
          {
            user_id: user.id,
            type: 'income',
            amount: 5000.00,
            description: 'Salário',
            date: '2025-12-30',
          },
          {
            user_id: user.id,
            type: 'income',
            amount: 5000.00,
            description: 'Salário',
            date: '2026-01-01',
          },
        ];

        await supabase.from('transactions').insert(sampleTransactions);
      }

      await supabase.from('credit_cards').insert({
        user_id: user.id,
        name: 'Cartão Principal',
        limit_total: 5000.00,
        limit_available: 3200.00,
      });

      loadData();
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="dashboard-logo">FINANCEFLOW</div>
        </div>
        <div className="dashboard-content">
          <div className="empty-state">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-logo">FINANCEFLOW</div>
        <div className="dashboard-user">
          <span className="user-email">{user?.email || 'Modo Bypass'}</span>
          {user && (
            <button onClick={signOut} className="logout-button">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <StatsCards
          transactions={transactions}
          creditCards={creditCards}
        />

        <div className="charts-section">
          <h2 className="section-title">Análises</h2>
          <div className="charts-grid">
            <ExpensesByCategory
              transactions={transactions}
              categories={categories}
            />
            <WealthEvolution transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
}

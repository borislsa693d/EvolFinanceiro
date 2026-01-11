import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { transactionsAPI, categoriesAPI, creditCardsAPI, accountsAPI } from '../../lib/api';
import type { Transaction, Category, CreditCard, Account } from '../../lib/api';
import StatsCards from './StatsCards';
import ExpensesByCategory from './ExpensesByCategory';
import WealthEvolution from './WealthEvolution';
import { LogOut, Plus } from 'lucide-react';
import '../../styles/dashboard.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [transactionsData, categoriesData, creditCardsData, accountsData] = await Promise.all([
        transactionsAPI.getAll(),
        categoriesAPI.getAll(),
        creditCardsAPI.getAll(),
        accountsAPI.getAll(),
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setCreditCards(creditCardsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="dashboard-logo">
            Bora economizar, {user?.first_name || user?.full_name?.split(' ')[0] || 'usuário'}?
          </div>
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
        <div className="dashboard-logo">
          Bora economizar, {user?.first_name || user?.full_name?.split(' ')[0] || 'usuário'}?
        </div>
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
          accounts={accounts}
        />

        <div className="charts-section">
          <h2 className="section-title">Visão Geral</h2>
          <div className="charts-grid">
            <ExpensesByCategory
              transactions={transactions}
              categories={categories}
            />
            <WealthEvolution transactions={transactions} />
          </div>
        </div>
      </div>

      {/* Botão flutuante para adicionar transação - apenas desktop */}
      <button 
        className="floating-add-button desktop-only"
        onClick={() => navigate('/new-transaction')}
        title="Nova Transação"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

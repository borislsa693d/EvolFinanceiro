import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { transactionsAPI, categoriesAPI, creditCardsAPI, accountsAPI, fixedTransactionsAPI } from '../../lib/api';
import type { Transaction, Category, CreditCard, Account, FixedTransaction } from '../../lib/api';
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
  const [fixedTransactions, setFixedTransactions] = useState<FixedTransaction[]>([]);
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
      const [transactionsData, categoriesData, creditCardsData, accountsData, fixedData] = await Promise.all([
        transactionsAPI.getAll(),
        categoriesAPI.getAll(),
        creditCardsAPI.getAll(),
        accountsAPI.getAll(),
        fixedTransactionsAPI.getAll(),
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setCreditCards(creditCardsData);
      setAccounts(accountsData);
      setFixedTransactions(fixedData);
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

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date + 'T00:00:00');
    return tDate >= monthStart && tDate <= monthEnd;
  });

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
          transactions={monthTransactions}
          allTransactions={transactions}
          creditCards={creditCards}
          accounts={accounts}
          fixedTransactions={fixedTransactions}
        />

        <div className="charts-section">
          <h2 className="section-title">Visão Geral</h2>
          <div className="charts-grid">
            <ExpensesByCategory
              transactions={monthTransactions}
              categories={categories}
            />
            <WealthEvolution transactions={monthTransactions} />
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

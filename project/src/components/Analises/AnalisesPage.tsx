import { useEffect, useState } from 'react';
import { transactionsAPI, categoriesAPI, creditCardsAPI, accountsAPI } from '../../lib/api';
import type { Transaction, Category, CreditCard, Account } from '../../lib/api';
import Analyses from '../Dashboard/Analyses';
import { FaCalendarAlt, FaUniversity, FaCreditCard, FaFilter, FaTimes } from 'react-icons/fa';
import '../Extrato/Extrato.css';

export default function AnalisesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  const handleFilter = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (selectedAccount) filters.account_id = selectedAccount;
      if (selectedCard) filters.credit_card_id = selectedCard;

      const filtered = await transactionsAPI.getAll(filters);
      setTransactions(filtered);
    } catch (error) {
      console.error('Erro ao filtrar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setStartDate('');
    setEndDate('');
    setSelectedAccount('');
    setSelectedCard('');
    loadData();
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
    <div>
      <div className="filters-panel">
        <div className="filters-container">
          {/* Filtro de Período */}
          <div className="filter-item">
            <label htmlFor="start-date"><FaCalendarAlt /> Período</label>
            <div className="period-inputs">
              <input 
                type="date" 
                id="start-date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>-</span>
              <input 
                type="date" 
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro por Conta */}
          <div className="filter-item">
            <label htmlFor="account-filter"><FaUniversity /> Conta</label>
            <select 
              id="account-filter"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="">Todas</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Cartão de Crédito */}
          <div className="filter-item">
            <label htmlFor="cc-filter"><FaCreditCard /> Cartão de Crédito</label>
            <select 
              id="cc-filter"
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
            >
              <option value="">Todos</option>
              {creditCards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button className="filter-button apply-button" onClick={handleFilter}>
            <FaFilter />
            Aplicar Filtros
          </button>
          <button className="filter-button clear-button" onClick={handleClearFilters}>
            <FaTimes />
            Limpar
          </button>
        </div>
      </div>

      <Analyses
        transactions={transactions}
        categories={categories}
        creditCards={creditCards}
      />
    </div>
  );
}

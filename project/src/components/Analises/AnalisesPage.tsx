import { useEffect, useState } from 'react';
import { transactionsAPI, categoriesAPI, creditCardsAPI, accountsAPI } from '../../lib/api';
import type { Transaction, Category, CreditCard, Account } from '../../lib/api';
import Analyses from '../Dashboard/Analyses';
import { FaCalendarAlt, FaUniversity, FaCreditCard, FaFilter, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../Extrato/Extrato.css';

export default function AnalisesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [periodMode, setPeriodMode] = useState<'month' | 'year' | 'custom'>('month');
  const [periodBase, setPeriodBase] = useState(new Date());
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (periodMode !== 'custom') {
      handleFilter();
    }
  }, [periodMode, periodBase]);

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

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const toISODate = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  const getYearRange = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear(), 11, 31);
    return { start, end };
  };

  const parseBRDate = (value: string) => {
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
    if (!dd || !mm || !yyyy) return null;
    const date = new Date(yyyy, mm - 1, dd);
    if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
      return null;
    }
    return date;
  };

  const handlePeriodNav = (direction: 'prev' | 'next') => {
    const next = new Date(periodBase);
    if (periodMode === 'month') {
      next.setMonth(next.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (periodMode === 'year') {
      next.setFullYear(next.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    setPeriodBase(next);
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (periodMode === 'month') {
        const { start, end } = getMonthRange(periodBase);
        filters.start_date = toISODate(start);
        filters.end_date = toISODate(end);
      } else if (periodMode === 'year') {
        const { start, end } = getYearRange(periodBase);
        filters.start_date = toISODate(start);
        filters.end_date = toISODate(end);
      } else {
        const start = parseBRDate(customStart);
        const end = parseBRDate(customEnd);
        if (!start || !end) {
          alert('Informe o período no formato DD/MM/AAAA');
          setLoading(false);
          return;
        }
        filters.start_date = toISODate(start);
        filters.end_date = toISODate(end);
      }
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
    setPeriodMode('month');
    setPeriodBase(new Date());
    setCustomStart('');
    setCustomEnd('');
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
            <label><FaCalendarAlt /> Período</label>
            <div className="period-select-row">
              {periodMode !== 'custom' && (
                <button className="period-nav-btn" onClick={() => handlePeriodNav('prev')}>
                  <FaChevronLeft />
                </button>
              )}
              <div className="period-select">
                <button
                  className="period-select-button"
                  onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                >
                  {periodMode === 'month'
                    ? `${monthNames[periodBase.getMonth()]}/${periodBase.getFullYear()}`
                    : periodMode === 'year'
                    ? `${periodBase.getFullYear()}`
                    : 'Personalizado'}
                </button>
                {isPeriodMenuOpen && (
                  <div className="period-menu">
                    <button
                      className="period-menu-item"
                      onClick={() => {
                        setPeriodMode('month');
                        setIsPeriodMenuOpen(false);
                      }}
                    >
                      Este Mês
                    </button>
                    <button
                      className="period-menu-item"
                      onClick={() => {
                        setPeriodMode('year');
                        setIsPeriodMenuOpen(false);
                      }}
                    >
                      Este Ano
                    </button>
                    <button
                      className="period-menu-item"
                      onClick={() => {
                        setPeriodMode('custom');
                        setIsPeriodMenuOpen(false);
                      }}
                    >
                      Personalizado
                    </button>
                  </div>
                )}
              </div>
              {periodMode !== 'custom' && (
                <button className="period-nav-btn" onClick={() => handlePeriodNav('next')}>
                  <FaChevronRight />
                </button>
              )}
            </div>

            {periodMode === 'custom' && (
              <div className="period-inputs custom">
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
                <span>-</span>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            )}
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

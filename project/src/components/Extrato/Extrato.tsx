import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { transactionsAPI, categoriesAPI, accountsAPI, creditCardsAPI } from '../../lib/api';
import type { Transaction, Category, Account, CreditCard } from '../../lib/api';
import { FaCalendarAlt, FaUniversity, FaCreditCard, FaFilter, FaTimes, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './Extrato.css';

const Extrato = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
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
      const [transactionsData, categoriesData, accountsData, cardsData] = await Promise.all([
        transactionsAPI.getAll(),
        categoriesAPI.getAll(),
        accountsAPI.getAll(),
        creditCardsAPI.getAll(),
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setAccounts(accountsData);
      setCreditCards(cardsData);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;

    try {
      await transactionsAPI.delete(id);
      // Recarregar dados do servidor após deletar
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      alert('Erro ao excluir transação');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    // Navegar para página de nova transação com dados para edição
    navigate('/new-transaction', { state: { editTransaction: transaction } });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '-';
  };

  const getAccountName = (accountId: string | null, creditCardId: string | null) => {
    if (accountId) {
      const account = accounts.find(a => a.id === accountId);
      return account?.name || '-';
    }
    if (creditCardId) {
      const card = creditCards.find(c => c.id === creditCardId);
      return card?.name || '-';
    }
    return '-';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="extrato-container">
        <div className="empty-state">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="extrato-container">
      <div className="extrato-header">
        <h2 className="text-3xl font-bold mb-6">Extrato Mensal</h2>
        <button 
          className="add-transaction-button desktop-only"
          onClick={() => navigate('/new-transaction')}
          title="Nova Transação"
        >
          <FaPlus />
        </button>
      </div>

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

      <div className="table-container">
        {transactions.length === 0 ? (
          <div className="empty-state">
            Nenhuma transação encontrada
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Conta/Cartão</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.description || '-'}</td>
                  <td>
                    <span className={`transaction-type ${transaction.type}`}>
                      {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td>{getAccountName(transaction.account_id || null, transaction.credit_card_id || null)}</td>
                  <td>{getCategoryName(transaction.category_id || null)}</td>
                  <td className={transaction.type === 'income' ? 'income-value' : 'expense-value'}>
                    <span className="money">
                      <span className="money-symbol">R$</span>
                      <span className="money-value">{formatAmount(transaction.amount)}</span>
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(transaction)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(transaction.id)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Extrato;

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { transactionsAPI, categoriesAPI, accountsAPI, creditCardsAPI, fixedTransactionsAPI } from '../../lib/api';
import type { Transaction, Category, Account, CreditCard, FixedTransaction } from '../../lib/api';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../Modal/Modal';
import './PrevisaoPage.css';

export default function PrevisaoPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedTransactions, setFixedTransactions] = useState<FixedTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado do mês selecionado (iniciando em Janeiro 2026)
  const [selectedMonth, setSelectedMonth] = useState(1); // 1 = Janeiro
  const [selectedYear, setSelectedYear] = useState(2026);

  // Estados para modais de receitas/despesas fixas
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingFixed, setEditingFixed] = useState<FixedTransaction | null>(null);

  // Form state para receitas/despesas fixas
  const [fixedForm, setFixedForm] = useState({
    description: '',
    amount: '',
    day_of_month: '1',
    category_id: '',
    account_id: '',
    credit_card_id: '',
  });

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
      const [transactionsData, fixedData, categoriesData, accountsData, creditCardsData] = await Promise.all([
        transactionsAPI.getAll(),
        fixedTransactionsAPI.getAll(),
        categoriesAPI.getAll(),
        accountsAPI.getAll(),
        creditCardsAPI.getAll(),
      ]);

      setTransactions(transactionsData);
      setFixedTransactions(fixedData);
      setCategories(categoriesData);
      setAccounts(accountsData);
      setCreditCards(creditCardsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const fullMonthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Calcular quantos dias tem o mês selecionado
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getInvoiceMonthYear = (transactionDate: Date, closingDay: number) => {
    const transDay = transactionDate.getDate();
    const transMonth = transactionDate.getMonth() + 1;
    const transYear = transactionDate.getFullYear();

    let invoiceMonth = transMonth;
    let invoiceYear = transYear;

    if (transDay > closingDay) {
      invoiceMonth = transMonth + 1;
      if (invoiceMonth > 12) {
        invoiceMonth = 1;
        invoiceYear = transYear + 1;
      }
    }

    return { invoiceMonth, invoiceYear };
  };

  // Função auxiliar para calcular saldo final de um mês específico (usado para calcular saldo inicial do próximo mês)
  const calculateMonthEndBalance = (month: number, year: number): number => {
    const daysInMonth = getDaysInMonth(month, year);
    const lastDayOfMonth = new Date(year, month - 1, daysInMonth);
    
    // Calcular saldo inicial do mês (recursivamente)
    let balance = accounts.reduce((sum, account) => sum + Number(account.initial_balance || 0), 0);
    
    if (month > 1 || year > 2026) {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      balance = calculateMonthEndBalance(prevMonth, prevYear);
    }
    
    // Calcular transações do mês
    let monthIncome = 0;
    let monthExpense = 0;
    
    // Transações reais do mês
    transactions.forEach((t) => {
      const tDate = new Date(t.date + 'T00:00:00');
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth() + 1;
      
      if (tYear === year && tMonth === month) {
        if (t.type === 'income') {
          monthIncome += Number(t.amount);
        } else if (t.type === 'expense' && t.account_id && !t.credit_card_id) {
          monthExpense += Number(t.amount);
        }
      }
    });
    
    // Transações fixas do mês
    fixedTransactions.forEach((fixed) => {
      let targetDay = fixed.day_of_month;
      if (targetDay > daysInMonth) {
        targetDay = daysInMonth;
      }
      
      if (fixed.type === 'income') {
        monthIncome += Number(fixed.amount);
      } else if (fixed.type === 'expense' && fixed.account_id && !fixed.credit_card_id) {
        monthExpense += Number(fixed.amount);
      }
    });
    
    // Faturas que vencem neste mês
    creditCards.forEach((card) => {
      if (!card.due_day || !card.closing_day) return;
      
      const closingDay = card.closing_day;
      
      const cardTransactions = transactions.filter(
        (t) => t.credit_card_id === card.id && t.type === 'expense'
      );
      
      let invoiceAmount = 0;
      cardTransactions.forEach((transaction) => {
        const transDate = new Date(transaction.date + 'T00:00:00');
        const { invoiceMonth, invoiceYear } = getInvoiceMonthYear(transDate, closingDay);
        
        if (invoiceYear === year && invoiceMonth === month) {
          invoiceAmount += Number(transaction.amount);
        }
      });
      
      monthExpense += invoiceAmount;
    });
    
    return balance + monthIncome - monthExpense;
  };

  // Gerar planilha dia a dia do mês
  const generateDailySpreadsheet = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const days = [];
    
    // Calcular saldo inicial
    // Se for janeiro/2026, usar saldo inicial das contas
    // Se não for janeiro, usar saldo final do mês anterior
    let initialBalance: number;
    
    if (selectedMonth === 1 && selectedYear === 2026) {
      // Janeiro 2026: usar saldo inicial das contas
      initialBalance = accounts.reduce((sum, account) => sum + Number(account.initial_balance || 0), 0);
    } else {
      // Outros meses: calcular saldo final do mês anterior
      const previousMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const previousYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      initialBalance = calculateMonthEndBalance(previousMonth, previousYear);
    }
    
    let runningBalance = initialBalance;

    // Mapear transações fixas e reais do mês
    const monthTransactions: { [day: number]: { income: number; expense: number } } = {};
    
    // Inicializar todos os dias
    for (let day = 1; day <= daysInMonth; day++) {
      monthTransactions[day] = { income: 0, expense: 0 };
    }

    // Adicionar transações fixas do mês
    fixedTransactions.forEach((fixed) => {
      let targetDay = fixed.day_of_month;
      // Se o dia for maior que os dias do mês, usar o último dia (ex: dia 31 em fevereiro)
      if (targetDay > daysInMonth) {
        targetDay = daysInMonth;
      }

      if (fixed.type === 'income') {
        monthTransactions[targetDay].income += Number(fixed.amount);
      } else {
        // Despesas fixas apenas se for conta bancária (não cartão)
        if (fixed.account_id && !fixed.credit_card_id) {
          monthTransactions[targetDay].expense += Number(fixed.amount);
        }
      }
    });

    // Adicionar transações reais do mês
    transactions.forEach((t) => {
      const tDate = new Date(t.date + 'T00:00:00');
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth() + 1;
      const tDay = tDate.getDate();

      if (tYear === selectedYear && tMonth === selectedMonth) {
        if (t.type === 'income') {
          monthTransactions[tDay].income += Number(t.amount);
        } else if (t.type === 'expense' && t.account_id && !t.credit_card_id) {
          // Apenas despesas de conta bancária (não cartão)
          monthTransactions[tDay].expense += Number(t.amount);
        }
      }
    });

    // Adicionar faturas de cartão de crédito no dia de vencimento
    creditCards.forEach((card) => {
      if (!card.due_day) {
        // Se não tem due_day definido, não podemos calcular quando vence
        return;
      }

      if (!card.closing_day) {
        // Se não tem closing_day, não podemos calcular a fatura corretamente
        return;
      }

      const dueDay = card.due_day;
      const closingDay = card.closing_day;

      // Verificar se o dia de vencimento está dentro do mês selecionado
      // Se o due_day for maior que os dias do mês, usar o último dia
      let targetDueDay = dueDay;
      if (targetDueDay > daysInMonth) {
        targetDueDay = daysInMonth;
      }

      // Buscar todas as transações do cartão
      const cardTransactions = transactions.filter(
        (t) => t.credit_card_id === card.id && t.type === 'expense'
      );

      // Calcular o total da fatura que vence no mês selecionado
      let cardInvoice = 0;
      cardTransactions.forEach((transaction) => {
        const transDate = new Date(transaction.date + 'T00:00:00');
        const { invoiceMonth, invoiceYear } = getInvoiceMonthYear(transDate, closingDay);

        if (invoiceYear === selectedYear && invoiceMonth === selectedMonth) {
          cardInvoice += Number(transaction.amount);
        }
      });

      // Adicionar a fatura no dia de vencimento
      if (cardInvoice > 0) {
        monthTransactions[targetDueDay].expense += cardInvoice;
      }
    });

    // Gerar linhas da planilha
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthTransactions[day];
      runningBalance = runningBalance + dayData.income - dayData.expense;

      days.push({
        day,
        income: dayData.income,
        expense: dayData.expense,
        balance: runningBalance,
      });
    }

    return days;
  };

  const handleOpenIncomeModal = (fixed?: FixedTransaction) => {
    if (fixed) {
      setEditingFixed(fixed);
      setFixedForm({
        description: fixed.description,
        amount: fixed.amount.toString(),
        day_of_month: fixed.day_of_month.toString(),
        category_id: fixed.category_id || '',
        account_id: '',
        credit_card_id: '',
      });
    } else {
      setEditingFixed(null);
      setFixedForm({
        description: '',
        amount: '',
        day_of_month: '1',
        category_id: '',
        account_id: '',
        credit_card_id: '',
      });
    }
    setIsIncomeModalOpen(true);
  };

  const handleOpenExpenseModal = (fixed?: FixedTransaction) => {
    if (fixed) {
      setEditingFixed(fixed);
      setFixedForm({
        description: fixed.description,
        amount: fixed.amount.toString(),
        day_of_month: fixed.day_of_month.toString(),
        category_id: fixed.category_id || '',
        account_id: fixed.account_id || '',
        credit_card_id: fixed.credit_card_id || '',
      });
    } else {
      setEditingFixed(null);
      setFixedForm({
        description: '',
        amount: '',
        day_of_month: '1',
        category_id: '',
        account_id: '',
        credit_card_id: '',
      });
    }
    setIsExpenseModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsIncomeModalOpen(false);
    setIsExpenseModalOpen(false);
    setEditingFixed(null);
    setFixedForm({
      description: '',
      amount: '',
      day_of_month: '1',
      category_id: '',
      account_id: '',
      credit_card_id: '',
    });
  };

  const handleSubmitFixed = async (type: 'income' | 'expense') => {
    try {
      const data: any = {
        type,
        description: fixedForm.description,
        amount: parseFloat(fixedForm.amount),
        day_of_month: parseInt(fixedForm.day_of_month),
        category_id: fixedForm.category_id || null,
      };

      if (type === 'expense') {
        if (!fixedForm.account_id && !fixedForm.credit_card_id) {
          alert('Despesa fixa deve ter uma conta ou cartão de crédito');
          return;
        }
        data.account_id = fixedForm.account_id || null;
        data.credit_card_id = fixedForm.credit_card_id || null;
      }

      if (editingFixed) {
        await fixedTransactionsAPI.update(editingFixed.id, data);
      } else {
        await fixedTransactionsAPI.create(data);
      }

      await loadData();
      handleCloseModals();
    } catch (error) {
      console.error('Erro ao salvar receita/despesa fixa:', error);
      alert('Erro ao salvar');
    }
  };

  const handleDeleteFixed = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta receita/despesa fixa?')) return;

    try {
      await fixedTransactionsAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir');
    }
  };

  const incomeFixed = fixedTransactions.filter((f) => f.type === 'income');
  const expenseFixed = fixedTransactions.filter((f) => f.type === 'expense');
  const spreadsheetData = generateDailySpreadsheet();
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

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
    <div className="previsao-page">
      {/* Header com navegação de mês */}
      <div className="previsao-header">
        <button 
          className="month-nav-button"
          onClick={() => navigateMonth('prev')}
          aria-label="Mês anterior"
        >
          <ChevronLeft size={24} />
        </button>
        
        <h2 className="previsao-title">
          {monthNames[selectedMonth - 1]}/{selectedYear}
        </h2>
        
        <button 
          className="month-nav-button"
          onClick={() => navigateMonth('next')}
          aria-label="Próximo mês"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Seções de Receitas Fixas e Despesas Fixas */}
      <div className="fixed-sections-container">
        {/* Receitas Fixas */}
        <div className="fixed-section">
          <div className="fixed-section-header">
            <h3>Receitas Fixas</h3>
            <button 
              className="add-fixed-button"
              onClick={() => handleOpenIncomeModal()}
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="fixed-list">
            {incomeFixed.length === 0 ? (
              <div className="empty-fixed">Nenhuma receita fixa cadastrada</div>
            ) : (
              incomeFixed.map((fixed) => (
                <div key={fixed.id} className="fixed-item">
                  <div className="fixed-item-info">
                    <span className="fixed-day">Dia {fixed.day_of_month}</span>
                    <span className="fixed-description">{fixed.description}</span>
                    <span className="fixed-amount income">{formatCurrency(fixed.amount)}</span>
                  </div>
                  <div className="fixed-item-actions">
                    <button
                      className="icon-button edit"
                      onClick={() => handleOpenIncomeModal(fixed)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="icon-button delete"
                      onClick={() => handleDeleteFixed(fixed.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Despesas Fixas */}
        <div className="fixed-section">
          <div className="fixed-section-header">
            <h3>Despesas Fixas</h3>
            <button 
              className="add-fixed-button"
              onClick={() => handleOpenExpenseModal()}
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="fixed-list">
            {expenseFixed.length === 0 ? (
              <div className="empty-fixed">Nenhuma despesa fixa cadastrada</div>
            ) : (
              expenseFixed.map((fixed) => (
                <div key={fixed.id} className="fixed-item">
                  <div className="fixed-item-info">
                    <span className="fixed-day">Dia {fixed.day_of_month}</span>
                    <span className="fixed-description">{fixed.description}</span>
                    <span className="fixed-amount expense">{formatCurrency(fixed.amount)}</span>
                  </div>
                  <div className="fixed-item-actions">
                    <button
                      className="icon-button edit"
                      onClick={() => handleOpenExpenseModal(fixed)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="icon-button delete"
                      onClick={() => handleDeleteFixed(fixed.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Planilha Dia a Dia */}
      <div className="spreadsheet-card">
        <h3 className="spreadsheet-title">Previsão Mensal - {fullMonthNames[selectedMonth - 1]}/{selectedYear}</h3>
        
        <div className="spreadsheet-container">
          <table className="daily-spreadsheet">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {spreadsheetData.map((row) => (
                <tr key={row.day}>
                  <td className="day-cell">{row.day}</td>
                  <td className={`amount-cell income ${row.income > 0 ? 'has-value' : ''}`}>
                    {row.income > 0 ? formatCurrency(row.income) : '-'}
                  </td>
                  <td className={`amount-cell expense ${row.expense > 0 ? 'has-value' : ''}`}>
                    {row.expense > 0 ? formatCurrency(row.expense) : '-'}
                  </td>
                  <td className={`balance-cell ${row.balance >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Receita Fixa */}
      <Modal 
        isOpen={isIncomeModalOpen} 
        onClose={handleCloseModals}
        title={editingFixed ? 'Editar Receita Fixa' : 'Nova Receita Fixa'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitFixed('income'); }}>
          <div className="form-field">
            <label>Descrição *</label>
            <input
              type="text"
              value={fixedForm.description}
              onChange={(e) => setFixedForm({ ...fixedForm, description: e.target.value })}
              required
              placeholder="Ex: Salário"
            />
          </div>

          <div className="form-field">
            <label>Valor *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fixedForm.amount}
              onChange={(e) => setFixedForm({ ...fixedForm, amount: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-field">
            <label>Dia do Mês *</label>
            <input
              type="number"
              min="1"
              max="31"
              value={fixedForm.day_of_month}
              onChange={(e) => setFixedForm({ ...fixedForm, day_of_month: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label>Categoria</label>
            <select
              value={fixedForm.category_id}
              onChange={(e) => setFixedForm({ ...fixedForm, category_id: e.target.value })}
            >
              <option value="">Selecione...</option>
              {incomeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={handleCloseModals}>
              Cancelar
            </button>
            <button type="submit" className="button-primary">
              {editingFixed ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Despesa Fixa */}
      <Modal 
        isOpen={isExpenseModalOpen} 
        onClose={handleCloseModals}
        title={editingFixed ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitFixed('expense'); }}>
          <div className="form-field">
            <label>Descrição *</label>
            <input
              type="text"
              value={fixedForm.description}
              onChange={(e) => setFixedForm({ ...fixedForm, description: e.target.value })}
              required
              placeholder="Ex: Aluguel"
            />
          </div>

          <div className="form-field">
            <label>Valor *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fixedForm.amount}
              onChange={(e) => setFixedForm({ ...fixedForm, amount: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-field">
            <label>Dia do Mês *</label>
            <input
              type="number"
              min="1"
              max="31"
              value={fixedForm.day_of_month}
              onChange={(e) => setFixedForm({ ...fixedForm, day_of_month: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label>Categoria</label>
            <select
              value={fixedForm.category_id}
              onChange={(e) => setFixedForm({ ...fixedForm, category_id: e.target.value })}
            >
              <option value="">Selecione...</option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Conta Bancária</label>
            <select
              value={fixedForm.account_id}
              onChange={(e) => setFixedForm({ ...fixedForm, account_id: e.target.value, credit_card_id: '' })}
            >
              <option value="">Selecione...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Ou Cartão de Crédito</label>
            <select
              value={fixedForm.credit_card_id}
              onChange={(e) => setFixedForm({ ...fixedForm, credit_card_id: e.target.value, account_id: '' })}
            >
              <option value="">Selecione...</option>
              {creditCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={handleCloseModals}>
              Cancelar
            </button>
            <button type="submit" className="button-primary">
              {editingFixed ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

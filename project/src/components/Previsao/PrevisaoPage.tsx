import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { transactionsAPI, accountsAPI, creditCardsAPI, fixedTransactionsAPI } from '../../lib/api';
import type { Transaction, Account, CreditCard, FixedTransaction } from '../../lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './PrevisaoPage.css';

export default function PrevisaoPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedTransactions, setFixedTransactions] = useState<FixedTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado do mês selecionado (iniciando em Janeiro 2026)
  const [selectedMonth, setSelectedMonth] = useState(1); // 1 = Janeiro
  const [selectedYear, setSelectedYear] = useState(2026);

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
      const [transactionsData, fixedData, accountsData, creditCardsData] = await Promise.all([
        transactionsAPI.getAll(),
        fixedTransactionsAPI.getAll(),
        accountsAPI.getAll(),
        creditCardsAPI.getAll(),
      ]);

      setTransactions(transactionsData);
      setFixedTransactions(fixedData);
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

  const getMonthStart = (month: number, year: number) => {
    return new Date(year, month - 1, 1);
  };

  const isFixedActiveForMonth = (fixed: FixedTransaction, month: number, year: number) => {
    const monthStart = getMonthStart(month, year);
    const startDate = fixed.start_date ? new Date(fixed.start_date + 'T00:00:00') : null;
    const endDate = fixed.end_date ? new Date(fixed.end_date + 'T00:00:00') : null;

    if (startDate && monthStart < startDate) return false;
    if (endDate && monthStart > endDate) return false;
    return true;
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
      if (!isFixedActiveForMonth(fixed, month, year)) return;
      let targetDay = fixed.day_of_month;
      if (targetDay > daysInMonth) {
        targetDay = daysInMonth;
      }
      
      if (fixed.type === 'income') {
        monthIncome += Number(fixed.amount);
      } else if (fixed.type === 'expense') {
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
      if (!isFixedActiveForMonth(fixed, selectedMonth, selectedYear)) return;
      let targetDay = fixed.day_of_month;
      // Se o dia for maior que os dias do mês, usar o último dia (ex: dia 31 em fevereiro)
      if (targetDay > daysInMonth) {
        targetDay = daysInMonth;
      }

      if (fixed.type === 'income') {
        monthTransactions[targetDay].income += Number(fixed.amount);
      } else {
        monthTransactions[targetDay].expense += Number(fixed.amount);
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

  const spreadsheetData = generateDailySpreadsheet();

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
      {/* Planilha Dia a Dia */}
      <div className="spreadsheet-card">
        <div className="spreadsheet-header">
          <button 
            className="month-nav-button"
            onClick={() => navigateMonth('prev')}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h2 className="previsao-title">
            {fullMonthNames[selectedMonth - 1]}/{selectedYear}
          </h2>
          
          <button 
            className="month-nav-button"
            onClick={() => navigateMonth('next')}
            aria-label="Próximo mês"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="spreadsheet-container">
          <table className="daily-spreadsheet">
            <thead>
              <tr>
                <th>Dia</th>
                <th className="amount-col">Receita</th>
                <th className="amount-col">Despesa</th>
                <th className="balance-col">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {spreadsheetData.map((row) => (
                <tr key={row.day}>
                  <td className="day-cell">{row.day}</td>
                  <td className={`amount-cell amount-col income ${row.income > 0 ? 'has-value' : ''}`}>
                    {row.income > 0 ? formatCurrency(row.income) : '-'}
                  </td>
                  <td className={`amount-cell amount-col expense ${row.expense > 0 ? 'has-value' : ''}`}>
                    {row.expense > 0 ? formatCurrency(row.expense) : '-'}
                  </td>
                  <td className={`balance-cell balance-col ${row.balance >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

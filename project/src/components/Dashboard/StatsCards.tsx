import { TrendingUp, TrendingDown, CreditCard, Wallet } from 'lucide-react';
import { Transaction, CreditCard as CreditCardType, Account } from '../../lib/api';

interface StatsCardsProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  creditCards: CreditCardType[];
  accounts: Account[];
}

export default function StatsCards({ transactions, allTransactions, creditCards, accounts }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Entradas (sempre em conta bancária)
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Saídas (despesas) - separar por tipo
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  
  // Despesas com conta bancária (não cartão)
  const expensesWithAccount = expenseTransactions
    .filter((t) => t.account_id && !t.credit_card_id)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Total de saídas (todas as despesas - conta + cartão)
  const expenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  // Saldo = Saldos iniciais das contas + Entradas - Saídas de conta bancária (SEM incluir cartão)
  const initialBalance = accounts.reduce((sum, account) => sum + Number(account.initial_balance || 0), 0);
  const allIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const allExpensesWithAccount = allTransactions
    .filter((t) => t.type === 'expense' && t.account_id && !t.credit_card_id)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = initialBalance + allIncome - allExpensesWithAccount;

  // Calcular fatura do cartão baseado em closing_day
  const calculateCardInvoice = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    let totalInvoice = 0;

    creditCards.forEach((card) => {
      if (!card.closing_day) {
        // Se não tem closing_day definido, usa limite utilizado
        totalInvoice += Number(card.limit_total) - Number(card.limit_available);
        return;
      }

      const closingDay = card.closing_day;
      
      // Determinar qual é a fatura atual baseado no closing_day
      // Exemplo: fecha dia 10, hoje é dia 15 -> fatura atual é deste mês (fechou dia 10)
      // Exemplo: fecha dia 10, hoje é dia 5 -> fatura atual é do mês anterior (ainda não fechou este mês)
      
      let currentInvoiceMonth = currentMonth;
      let currentInvoiceYear = currentYear;
      
      if (currentDay < closingDay) {
        // Ainda não passou o dia de fechamento deste mês
        // A fatura atual é do mês anterior (que já fechou)
        currentInvoiceMonth = currentMonth - 1;
        if (currentInvoiceMonth < 1) {
          currentInvoiceMonth = 12;
          currentInvoiceYear = currentYear - 1;
        }
      }
      // Se currentDay >= closingDay, a fatura atual é do mês atual (que já fechou)
      
      // Transações do cartão
      const cardTransactions = transactions.filter(
        (t) => t.credit_card_id === card.id && t.type === 'expense'
      );

      cardTransactions.forEach((transaction) => {
        const transDate = new Date(transaction.date + 'T00:00:00');
        const transDay = transDate.getDate();
        const transMonth = transDate.getMonth() + 1;
        const transYear = transDate.getFullYear();

        // Determinar a qual fatura pertence a transação
        // Regra do cartão:
        // - Compra no dia X (fechamento) ou antes: vai para fatura do mês da transação
        // - Compra após o dia X: vai para fatura do próximo mês
        
        let invoiceMonth = transMonth;
        let invoiceYear = transYear;

        if (transDay > closingDay) {
          // Compra após o fechamento: vai para fatura do próximo mês
          invoiceMonth = transMonth + 1;
          if (invoiceMonth > 12) {
            invoiceMonth = 1;
            invoiceYear = transYear + 1;
          }
        }
        // Se transDay <= closingDay, a transação vai para a fatura do mês da transação

        // Verificar se esta transação pertence à fatura atual que estamos exibindo
        const belongsToCurrentInvoice = 
          invoiceYear === currentInvoiceYear && invoiceMonth === currentInvoiceMonth;

        if (belongsToCurrentInvoice) {
          totalInvoice += Number(transaction.amount);
        }
      });
    });

    return totalInvoice;
  };

  const cardInvoice = calculateCardInvoice();

  // Calcular limite total de todos os cartões
  const totalLimit = creditCards.reduce(
    (sum, card) => sum + Number(card.limit_total || 0), 
    0
  );

  // Limite disponível = Limite Total - Fatura Atual
  const totalAvailableLimit = totalLimit - cardInvoice;

  return (
    <div className="stats-grid">
      {/* Entrada */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Entrada</span>
          <TrendingUp className="stat-icon" />
        </div>
        <div className="stat-value positive">{formatCurrency(income)}</div>
        <div className="stat-subtitle">Total de receitas</div>
      </div>

      {/* Saída */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Saída</span>
          <TrendingDown className="stat-icon" />
        </div>
        <div className="stat-value negative">{formatCurrency(expenses)}</div>
        <div className="stat-subtitle">Total de despesas</div>
      </div>

      {/* Saldo */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Saldo</span>
          <Wallet className="stat-icon" />
        </div>
        <div className={`stat-value ${balance >= 0 ? 'positive' : 'negative'}`}>
          {formatCurrency(balance)}
        </div>
        <div className="stat-subtitle">Entradas - Saídas (Conta)</div>
      </div>

      {/* Fatura Cartão */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Fatura Cartão</span>
          <CreditCard className="stat-icon" />
        </div>
        <div className="stat-value negative">{formatCurrency(cardInvoice)}</div>
        <div className="stat-subtitle">Limite Disponível: {formatCurrency(totalAvailableLimit)}</div>
      </div>
    </div>
  );
}

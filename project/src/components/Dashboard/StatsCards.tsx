import { TrendingUp, TrendingDown, CreditCard, Wallet } from 'lucide-react';
import { Transaction, CreditCard as CreditCardType } from '../../lib/supabase';

interface StatsCardsProps {
  transactions: Transaction[];
  creditCards: CreditCardType[];
}

export default function StatsCards({ transactions, creditCards }: StatsCardsProps) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  const totalLimit = creditCards.reduce((sum, card) => sum + Number(card.limit_total), 0);
  const availableLimit = creditCards.reduce((sum, card) => sum + Number(card.limit_available), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Entrada</span>
          <TrendingUp className="stat-icon" />
        </div>
        <div className="stat-value positive">{formatCurrency(income)}</div>
        <div className="stat-subtitle">Total de receitas</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Saída</span>
          <TrendingDown className="stat-icon" />
        </div>
        <div className="stat-value negative">{formatCurrency(expenses)}</div>
        <div className="stat-subtitle">Total de despesas</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Fatura Cartão</span>
          <CreditCard className="stat-icon" />
        </div>
        <div className="stat-value positive">{formatCurrency(totalLimit - availableLimit)}</div>
        <div className="stat-subtitle">Limite Disponível: {formatCurrency(availableLimit)}</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Saldo</span>
          <Wallet className="stat-icon" />
        </div>
        <div className={`stat-value ${balance >= 0 ? 'positive' : 'negative'}`}>
          {formatCurrency(balance)}
        </div>
        <div className="stat-subtitle">Patrimônio atual</div>
      </div>
    </div>
  );
}

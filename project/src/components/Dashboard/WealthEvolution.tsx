import { Transaction } from '../../lib/supabase';
import { BarChart3 } from 'lucide-react';

interface WealthEvolutionProps {
  transactions: Transaction[];
}

export default function WealthEvolution({ transactions }: WealthEvolutionProps) {
  const months = ['Dez', 'Jan', 'Fev'];

  const getMonthData = (monthOffset: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() + 1 === month && tDate.getFullYear() === year;
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  };

  const data = [
    getMonthData(-1),
    getMonthData(0),
    getMonthData(1),
  ];

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expenses, Math.abs(d.balance)))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 20;
    return Math.max((value / maxValue) * 100, 5);
  };

  if (transactions.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">Evolução de Patrimônio</h3>
        <div className="empty-state">
          <BarChart3 className="empty-state-icon" />
          <div className="empty-state-text">Nenhuma transação registrada</div>
          <div className="empty-state-subtext">
            Adicione transações para visualizar a evolução
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3 className="chart-title">Evolução de Patrimônio</h3>
      <div className="chart-container">
        <div className="column-chart">
          {data.map((monthData, index) => (
            <div key={index} className="chart-column">
              <div className="column-bars">
                <div
                  className="column-bar income"
                  style={{ height: `${getBarHeight(monthData.income)}%` }}
                >
                  <span className="bar-value">{formatCurrency(monthData.income)}</span>
                </div>
                <div
                  className="column-bar expense"
                  style={{ height: `${getBarHeight(monthData.expenses)}%` }}
                >
                  <span className="bar-value">{formatCurrency(monthData.expenses)}</span>
                </div>
                <div
                  className="column-bar balance"
                  style={{ height: `${getBarHeight(Math.abs(monthData.balance))}%` }}
                >
                  <span className="bar-value">{formatCurrency(monthData.balance)}</span>
                </div>
              </div>
              <div className="column-label">{months[index]}</div>
            </div>
          ))}
        </div>

        <div className="chart-legend-bottom">
          <div className="legend-bottom-item">
            <div className="legend-bottom-color" style={{ background: '#ffffff' }} />
            <span>Entrada</span>
          </div>
          <div className="legend-bottom-item">
            <div className="legend-bottom-color" style={{ background: '#666666' }} />
            <span>Saída</span>
          </div>
          <div className="legend-bottom-item">
            <div
              className="legend-bottom-color"
              style={{ background: 'linear-gradient(to right, #ffffff, #888888)' }}
            />
            <span>Saldo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

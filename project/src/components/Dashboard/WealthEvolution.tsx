import { Transaction } from '../../lib/api';
import { BarChart3 } from 'lucide-react';

interface WealthEvolutionProps {
  transactions: Transaction[];
}

export default function WealthEvolution({ transactions }: WealthEvolutionProps) {
  const monthNames = ['Jan', 'Fev', 'Mar'];
  const year = 2026; // Ano atual para consistência

  const getMonthData = (month: number) => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date + 'T00:00:00');
      return tDate.getMonth() + 1 === month && tDate.getFullYear() === year;
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Despesas apenas de conta bancária (excluir cartão)
    const expenses = monthTransactions
      .filter((t) => t.type === 'expense' && t.account_id && !t.credit_card_id)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  };

  // Mostrar 3 meses: Janeiro, Fevereiro, Março
  const data = [
    getMonthData(1),  // Janeiro
    getMonthData(2),  // Fevereiro
    getMonthData(3),  // Março
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
              <div className="column-label">{monthNames[index]}</div>
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

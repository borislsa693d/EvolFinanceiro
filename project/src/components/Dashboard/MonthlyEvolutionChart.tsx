import { Transaction } from '../../lib/supabase';
import { BarChart3 } from 'lucide-react';

interface MonthlyEvolutionChartProps {
  transactions: Transaction[];
}

export default function MonthlyEvolutionChart({ transactions }: MonthlyEvolutionChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Obter últimos 6 meses
  const getMonthsData = () => {
    const months = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = monthNames[date.getMonth()];
      
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() + 1 === month && tDate.getFullYear() === year;
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const balance = income - expense;
      
      months.push({
        label: `${monthName}/${year.toString().slice(-2)}`,
        income,
        expense,
        balance,
        monthIndex: i,
      });
    }
    
    return months;
  };

  const monthsData = getMonthsData();
  
  // Calcular média de gastos mensal
  const totalExpenses = monthsData.reduce((sum, m) => sum + m.expense, 0);
  const averageExpense = monthsData.length > 0 ? totalExpenses / monthsData.length : 0;

  const maxValue = Math.max(
    ...monthsData.map((d) => Math.max(d.income, d.expense, Math.abs(d.balance), averageExpense)),
    averageExpense
  );

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 5;
    return Math.max((value / maxValue) * 100, 5);
  };

  if (transactions.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">Gráfico de Evolução em Coluna (Mensal)</h3>
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
      <h3 className="chart-title">Gráfico de Evolução em Coluna (Mensal)</h3>
      <div className="chart-container">
        <div className="column-chart-evolution">
          {monthsData.map((monthData, index) => (
            <div key={index} className="chart-column-evolution">
              <div className="column-bars-evolution">
                <div className="bar-group">
                  <div
                    className="column-bar income"
                    style={{ height: `${getBarHeight(monthData.income)}%` }}
                    title={`Entrada: ${formatCurrency(monthData.income)}`}
                  >
                    <span className="bar-value">{formatCurrency(monthData.income)}</span>
                  </div>
                </div>
                <div className="bar-group">
                  <div
                    className="column-bar expense"
                    style={{ height: `${getBarHeight(monthData.expense)}%` }}
                    title={`Saída: ${formatCurrency(monthData.expense)}`}
                  >
                    <span className="bar-value">{formatCurrency(monthData.expense)}</span>
                  </div>
                </div>
                <div className="bar-group">
                  <div
                    className="column-bar balance"
                    style={{ height: `${getBarHeight(Math.abs(monthData.balance))}%` }}
                    title={`Saldo: ${formatCurrency(monthData.balance)}`}
                  >
                    <span className="bar-value">{formatCurrency(monthData.balance)}</span>
                  </div>
                </div>
                <div className="bar-group">
                  <div
                    className="column-bar average"
                    style={{ height: `${getBarHeight(averageExpense)}%` }}
                    title={`Média: ${formatCurrency(averageExpense)}`}
                  >
                    <span className="bar-value">{formatCurrency(averageExpense)}</span>
                  </div>
                </div>
              </div>
              <div className="column-label">{monthData.label}</div>
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
            <div className="legend-bottom-color" style={{ background: 'linear-gradient(to top, #ffffff, #888888)' }} />
            <span>Saldo</span>
          </div>
          <div className="legend-bottom-item">
            <div className="legend-bottom-color" style={{ background: '#999999' }} />
            <span>Média de Gastos</span>
          </div>
        </div>
      </div>
    </div>
  );
}


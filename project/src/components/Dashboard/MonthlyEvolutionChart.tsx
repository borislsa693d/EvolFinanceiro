import { Transaction } from '../../lib/api';

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

  // Obter dados de janeiro a dezembro do ano atual
  const getMonthsData = () => {
    const months = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const year = new Date().getFullYear();

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const month = monthIndex + 1;
      const monthName = monthNames[monthIndex];
      
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
        label: `${monthName}/${year}`,
        income,
        expense,
        balance,
        monthIndex,
      });
    }
    
    return months;
  };

  const monthsData = getMonthsData();
  
  const maxValue = Math.max(
    ...monthsData.map((d) => Math.max(d.income, d.expense, Math.abs(d.balance)))
  );

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 5;
    return Math.max((value / maxValue) * 100, 5);
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">Evolução Patrimonial</h3>
      <div className="chart-container">
        <div className="column-chart-evolution">
          {monthsData.map((monthData, index) => {
            const hasData = monthData.income > 0 || monthData.expense > 0 || monthData.balance !== 0;
            return (
              <div key={index} className="chart-column-evolution">
                {hasData ? (
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
                  </div>
                ) : (
                  <div className="column-bars-evolution empty">
                    <div className="zero-value">R$ 0,00</div>
                  </div>
                )}
                <div className="column-label">{monthData.label}</div>
              </div>
            );
          })}
        </div>

        <div className="chart-legend-bottom">
          <div className="legend-bottom-item">
            <div className="legend-bottom-color" style={{ background: '#22c55e' }} />
            <span>Entrada</span>
          </div>
          <div className="legend-bottom-item">
            <div className="legend-bottom-color" style={{ background: '#ef4444' }} />
            <span>Saída</span>
          </div>
          <div className="legend-bottom-item">
            <div className="legend-bottom-color" style={{ background: 'linear-gradient(to top, #666666, #999999)' }} />
            <span>Saldo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Account, Transaction } from '../../lib/api';

interface WealthEvolutionProps {
  transactions: Transaction[];
  accounts: Account[];
}

export default function WealthEvolution({ transactions, accounts }: WealthEvolutionProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const months: { year: number; monthIndex: number; label: string }[] = [];
  // Add current and previous months (within the same year)
  for (let i = 0; i <= 2; i += 1) {
    const monthIndex = currentMonthIndex - i;
    if (monthIndex >= 0) {
      const date = new Date(currentYear, monthIndex, 1);
      months.unshift({
        year: currentYear,
        monthIndex,
        label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      });
    }
  }
  // If we don't have 3 months yet (Jan/Feb), fill with next months
  let nextOffset = 1;
  while (months.length < 3) {
    const monthIndex = currentMonthIndex + nextOffset;
    const date = new Date(currentYear, monthIndex, 1);
    months.push({
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    });
    nextOffset += 1;
  }

  const getInitialBalanceForMonth = (year: number, monthIndex: number) => {
    return accounts
      .filter((account) => {
        if (!account.initial_balance) return false;
        const createdAt = new Date(account.created_at);
        return createdAt.getFullYear() === year && createdAt.getMonth() === monthIndex;
      })
      .reduce((sum, account) => sum + Number(account.initial_balance || 0), 0);
  };

  const getMonthData = (year: number, monthIndex: number) => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date + 'T00:00:00');
      return tDate.getMonth() === monthIndex && tDate.getFullYear() === year;
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Despesas apenas de conta bancaria (excluir cartao)
    const expenses = monthTransactions
      .filter((t) => t.type === 'expense' && t.account_id && !t.credit_card_id)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const initialBalance = getInitialBalanceForMonth(year, monthIndex);

    return {
      income,
      expenses,
      balance: income - expenses + initialBalance,
    };
  };

  // 3 meses no ano corrente, sempre incluindo o mes atual
  const data = months.map((month) => getMonthData(month.year, month.monthIndex));

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
    return Math.max((value / maxValue) * 85, 5);
  };

  return (
    <div className="chart-card chart-card-wealth">
      <h3 className="chart-title">Evolução de Patrimônio</h3>
      <div className="chart-container">
        <div className="column-chart">
          {data.map((monthData, index) => {
            const hasData = monthData.income > 0 || monthData.expenses > 0 || monthData.balance !== 0;
            return (
              <div key={index} className="chart-column">
                {hasData ? (
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
                ) : (
                  <div className="column-bars empty">
                    <div className="zero-value">R$ 0,00</div>
                  </div>
                )}
                <div className="column-label">{months[index].label}</div>
              </div>
            );
          })}
        </div>

        <div className="chart-legend-bottom">
          <div className="legend-bottom-item">
            <div className="legend-bottom-color" style={{ background: '#22c55e' }} />
            <span>Receita</span>
          </div>
          <div className="legend-bottom-item">
            <div className="legend-bottom-color" style={{ background: '#ef4444' }} />
            <span>Despesa</span>
          </div>
          <div className="legend-bottom-item">
            <div
              className="legend-bottom-color"
              style={{ background: 'linear-gradient(to top, #666666, #999999)' }}
            />
            <span>Saldo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

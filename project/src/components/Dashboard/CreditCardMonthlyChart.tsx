import { Transaction, CreditCard } from '../../lib/supabase';
import { CreditCard as CreditCardIcon } from 'lucide-react';

interface CreditCardMonthlyChartProps {
  transactions: Transaction[];
  creditCards: CreditCard[];
}

export default function CreditCardMonthlyChart({ transactions, creditCards }: CreditCardMonthlyChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Obter últimos 6 meses de fatura do cartão
  const getMonthsData = () => {
    const months = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = monthNames[date.getMonth()];
      
      // Calcular fatura do mês (gastos com cartão)
      // Assumindo que transações sem category_id ou com type 'expense' podem ser do cartão
      // Você pode ajustar essa lógica conforme sua necessidade
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() + 1 === month && tDate.getFullYear() === year && t.type === 'expense';
      });

      // Para simplificar, vamos considerar todas as despesas como possíveis gastos do cartão
      // Em um sistema real, você teria uma flag ou campo indicando se foi pago com cartão
      const cardExpense = monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      months.push({
        label: `${monthName}/${year.toString().slice(-2)}`,
        expense: cardExpense,
        monthIndex: i,
      });
    }
    
    return months;
  };

  const monthsData = getMonthsData();
  
  const maxValue = Math.max(
    ...monthsData.map((d) => d.expense),
    1
  );

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 5;
    return Math.max((value / maxValue) * 100, 5);
  };

  if (transactions.length === 0 && creditCards.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">Gráfico de Cartão em Coluna (Mensal)</h3>
        <div className="empty-state">
          <CreditCardIcon className="empty-state-icon" />
          <div className="empty-state-text">Nenhuma transação registrada</div>
          <div className="empty-state-subtext">
            Adicione transações para visualizar a fatura mensal
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3 className="chart-title">Gráfico de Cartão em Coluna (Mensal)</h3>
      <div className="chart-container">
        <div className="column-chart-credit">
          {monthsData.map((monthData, index) => (
            <div key={index} className="chart-column-credit">
              <div className="column-bar-credit-container">
                <div
                  className="column-bar credit-card"
                  style={{ height: `${getBarHeight(monthData.expense)}%` }}
                  title={`Fatura: ${formatCurrency(monthData.expense)}`}
                >
                  <span className="bar-value">{formatCurrency(monthData.expense)}</span>
                </div>
              </div>
              <div className="column-label">{monthData.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


import { Transaction, CreditCard } from '../../lib/api';
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

  // Obter fatura do cartão por mês para o ano de 2026 (janeiro a dezembro)
  const getMonthsData = () => {
    const months = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const year = 2026;
    
    // Gerar todos os 12 meses de 2026
    for (let month = 1; month <= 12; month++) {
      const monthName = monthNames[month - 1];
      
      // Calcular fatura do mês baseado no closing_day de cada cartão
      let cardInvoice = 0;

      creditCards.forEach((card) => {
        if (!card.closing_day) {
          // Se não tem closing_day, não podemos calcular a fatura mensal corretamente
          // Vamos ignorar este cartão para o cálculo mensal
          return;
        }

        const closingDay = card.closing_day;
        
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

          // Verificar se esta transação pertence à fatura do mês que estamos calculando
          const belongsToThisInvoice = 
            invoiceYear === year && invoiceMonth === month;

          if (belongsToThisInvoice) {
            cardInvoice += Number(transaction.amount);
          }
        });
      });
      
      months.push({
        label: `${monthName}/${year.toString().slice(-2)}`,
        expense: cardInvoice,
        monthIndex: month - 1,
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


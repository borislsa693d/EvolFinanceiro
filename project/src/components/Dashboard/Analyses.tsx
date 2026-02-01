import { Transaction, Category, CreditCard } from '../../lib/api';
import CategoryPieChart from './CategoryPieChart';
import MonthlyEvolutionChart from './MonthlyEvolutionChart';
import CreditCardMonthlyChart from './CreditCardMonthlyChart';

interface AnalysesProps {
  transactions: Transaction[];
  yearlyTransactions: Transaction[];
  categories: Category[];
  creditCards: CreditCard[];
}

export default function Analyses({ transactions, yearlyTransactions, categories, creditCards }: AnalysesProps) {
  return (
    <div className="analyses-section">
      <h2 className="section-title">Análises</h2>
      <div className="analyses-grid">
        <div className="analyses-row">
          <CategoryPieChart
            transactions={transactions}
            categories={categories}
            type="income"
            title="Receitas por Categoria"
          />
          <CategoryPieChart
            transactions={transactions}
            categories={categories}
            type="expense"
            title="Despesas por Categoria"
          />
        </div>
        <CreditCardMonthlyChart transactions={yearlyTransactions} creditCards={creditCards} />
        <MonthlyEvolutionChart transactions={yearlyTransactions} />
      </div>
    </div>
  );
}

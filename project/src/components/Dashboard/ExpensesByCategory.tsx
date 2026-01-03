import { Transaction, Category } from '../../lib/supabase';
import { PieChart } from 'lucide-react';

interface ExpensesByCategoryProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function ExpensesByCategory({
  transactions,
  categories,
}: ExpensesByCategoryProps) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryExpenses = categories.map((category) => {
    const categoryTotal = expenses
      .filter((t) => t.category_id === category.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      ...category,
      amount: categoryTotal,
      percentage: totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0,
    };
  }).filter((c) => c.amount > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (categoryExpenses.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">Gastos por Categoria</h3>
        <div className="empty-state">
          <PieChart className="empty-state-icon" />
          <div className="empty-state-text">Nenhuma despesa registrada</div>
          <div className="empty-state-subtext">
            Adicione transações para visualizar os gastos
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#ffffff', '#cccccc', '#999999', '#666666', '#333333'];

  let currentAngle = 0;
  const slices = categoryExpenses.map((cat, index) => {
    const angle = (cat.percentage / 100) * 360;
    const slice = {
      ...cat,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: COLORS[index % COLORS.length],
    };
    currentAngle += angle;
    return slice;
  });

  const createSlicePath = (startAngle: number, endAngle: number) => {
    const centerX = 100;
    const centerY = 100;
    const radius = 80;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">Gastos por Categoria</h3>
      <div className="chart-container">
        <div className="pie-chart">
          <div className="pie-visual">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {slices.map((slice, index) => (
                <path
                  key={index}
                  d={createSlicePath(slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  stroke="#000000"
                  strokeWidth="2"
                  style={{ transition: 'all 0.3s' }}
                />
              ))}
            </svg>
          </div>

          <div className="pie-legend">
            {categoryExpenses.map((cat, index) => (
              <div key={cat.id} className="legend-item">
                <div className="legend-label">
                  <div
                    className="legend-color"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <span className="legend-name">{cat.name}</span>
                </div>
                <div className="legend-value">
                  <span className="legend-amount">{formatCurrency(cat.amount)}</span>
                  <span className="legend-percentage">{cat.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Transaction, Category } from '../../lib/api';
import { PieChart } from 'lucide-react';
import { getCategoryColor } from '../../lib/chartColors';

interface ExpensesByCategoryProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function ExpensesByCategory({
  transactions,
  categories,
}: ExpensesByCategoryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    xPercent: number;
    yPercent: number;
    name: string;
    amount: number;
    percentage: number;
  } | null>(null);
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  // Calcular gastos por categoria
  let categoryExpenses = categories.map((category) => {
    const categoryTotal = expenses
      .filter((t) => t.category_id === category.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      ...category,
      amount: categoryTotal,
      percentage: totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0,
    };
  }).filter((c) => c.amount > 0);

  // Ordenar por valor (ranking) - maior para menor
  categoryExpenses.sort((a, b) => b.amount - a.amount);

  // Agrupar categorias além das top 6 em "Outros" (recomendado máximo de 5-7 fatias)
  const MAX_SLICES = 6;
  
  if (categoryExpenses.length > MAX_SLICES) {
    let topCategories = categoryExpenses.slice(0, MAX_SLICES);
    const otherCategories = categoryExpenses.slice(MAX_SLICES);

    // Calcular total de "Outros"
    const othersTotal = otherCategories.reduce((sum, cat) => sum + cat.amount, 0);
    const othersPercentage = totalExpenses > 0 ? (othersTotal / totalExpenses) * 100 : 0;

    // Criar categoria "Outros" apenas se houver categorias para agrupar
    if (othersTotal > 0) {
      const othersCategory = {
        id: 'others-grouped',
        name: 'Outros',
        color: '#94A3B8', // Cinza claro conforme recomendação
        type: 'expense' as const,
        amount: othersTotal,
        percentage: othersPercentage,
        created_at: '',
        user_id: '',
      };

      categoryExpenses = [...topCategories, othersCategory];
    }
  }

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

  let currentAngle = 0;
  const slices = categoryExpenses.map((cat, index) => {
    const angle = (cat.percentage / 100) * 360;
    const color = getCategoryColor(cat.id, cat.color, cat.name, index);
    
    const slice = {
      ...cat,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: color,
    };
    currentAngle += angle;
    return slice;
  });

  const createSlicePath = (startAngle: number, endAngle: number) => {
    const centerX = 175;
    const centerY = 175;
    const radius = 140;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getSliceTooltipPosition = (startAngle: number, endAngle: number) => {
    const centerX = 175;
    const centerY = 175;
    const radius = 110;
    const midAngle = (startAngle + endAngle) / 2 - 90;
    const rad = (midAngle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(rad);
    const y = centerY + radius * Math.sin(rad);
    return {
      xPercent: (x / 350) * 100,
      yPercent: (y / 350) * 100,
    };
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">Gastos por Categoria</h3>
      <div className="chart-container">
        <div className="pie-chart legend-bottom compact-legend">
          <div className="pie-visual pie-visual-hover">
            <svg width="350" height="350" viewBox="0 0 350 350">
              {slices.map((slice, index) => (
                <path
                  key={index}
                  d={createSlicePath(slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  stroke="#000000"
                  strokeWidth="3"
                  className={`pie-slice ${hoveredId === slice.id ? 'is-hovered' : ''}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.85';
                    e.currentTarget.style.filter = 'brightness(1.1)';
                    setHoveredId(slice.id);
                    const pos = getSliceTooltipPosition(slice.startAngle, slice.endAngle);
                    setTooltip({
                      xPercent: pos.xPercent,
                      yPercent: pos.yPercent,
                      name: slice.name,
                      amount: slice.amount,
                      percentage: slice.percentage,
                    });
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.filter = 'brightness(1)';
                    setHoveredId(null);
                    setTooltip(null);
                  }}
                />
              ))}
            </svg>
            {tooltip && (
              <div
                className="pie-tooltip"
                style={{ left: `${tooltip.xPercent}%`, top: `${tooltip.yPercent}%` }}
              >
                <div className="pie-tooltip-title">{tooltip.name}</div>
                <div className="pie-tooltip-value">{formatCurrency(tooltip.amount)}</div>
                <div className="pie-tooltip-percent">{tooltip.percentage.toFixed(1)}%</div>
              </div>
            )}
          </div>

          <div className="pie-legend">
            {categoryExpenses.map((cat, index) => {
              const color = getCategoryColor(cat.id, cat.color, cat.name, index);
              
              return (
                <div
                  key={cat.id}
                  className="legend-item"
                  onMouseEnter={() => setHoveredId(cat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="legend-label">
                    <div
                      className="legend-color"
                      style={{ background: color }}
                    />
                    <span className="legend-name">{cat.name}</span>
                  </div>
                  <div className="legend-value">
                    <span className="legend-percentage">{cat.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

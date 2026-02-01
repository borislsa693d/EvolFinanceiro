import { useState } from 'react';
import { Transaction, Category } from '../../lib/api';
import { PieChart } from 'lucide-react';
import { getCategoryColor } from '../../lib/chartColors';

interface CategoryPieChartProps {
  transactions: Transaction[];
  categories: Category[];
  type: 'income' | 'expense';
  title: string;
}

export default function CategoryPieChart({ transactions, categories, type, title }: CategoryPieChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showOthers, setShowOthers] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    xPercent: number;
    yPercent: number;
    name: string;
    amount: number;
    percentage: number;
  } | null>(null);
  const filteredTransactions = transactions.filter((t) => t.type === type);
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const filteredCategories = categories.filter((c) => c.type === type);

  // Calcular gastos por categoria
  let categoryExpenses = filteredCategories.map((category) => {
    const categoryTotal = filteredTransactions
      .filter((t) => t.category_id === category.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      ...category,
      amount: categoryTotal,
      percentage: totalAmount > 0 ? (categoryTotal / totalAmount) * 100 : 0,
    };
  }).filter((c) => c.amount > 0);

  // Ordenar por valor (ranking) - maior para menor
  categoryExpenses.sort((a, b) => b.amount - a.amount);

  // Agrupar categorias além das top 6 em "Outros" (recomendado máximo de 5-7 fatias)
  const MAX_SLICES = 6;
  let otherCategoriesData: typeof categoryExpenses = [];
  
  if (categoryExpenses.length > MAX_SLICES) {
    let topCategories = categoryExpenses.slice(0, MAX_SLICES);
    const otherCategories = categoryExpenses.slice(MAX_SLICES);
    otherCategoriesData = otherCategories;

    // Calcular total de "Outros"
    const othersTotal = otherCategories.reduce((sum, cat) => sum + cat.amount, 0);
    const othersPercentage = totalAmount > 0 ? (othersTotal / totalAmount) * 100 : 0;

    // Criar categoria "Outros" apenas se houver categorias para agrupar
    if (othersTotal > 0) {
      const othersCategory = {
        id: 'others-grouped',
        name: 'Outros',
        color: '#94A3B8', // Cinza claro conforme recomendação
        type,
        amount: othersTotal,
        percentage: othersPercentage,
        created_at: '',
        user_id: '',
      };

      categoryExpenses = [...topCategories, othersCategory];
    }
  }

  const legendItems = showOthers && otherCategoriesData.length > 0 ? otherCategoriesData : categoryExpenses;
  const displayCategories = selectedCategoryId
    ? legendItems.filter((cat) => cat.id === selectedCategoryId)
    : legendItems;
  const displayTotal = displayCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const displayCategoriesWithPercent = displayCategories.map((cat) => ({
    ...cat,
    percentage: displayTotal > 0 ? (cat.amount / displayTotal) * 100 : 0,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (categoryExpenses.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">{title}</h3>
        <div className="empty-state">
          <PieChart className="empty-state-icon" />
          <div className="empty-state-text">
            {type === 'expense' ? 'Nenhuma despesa registrada' : 'Nenhuma receita registrada'}
          </div>
          <div className="empty-state-subtext">
            Adicione transações para visualizar os dados
          </div>
        </div>
      </div>
    );
  }

  let currentAngle = 0;
  const slices = displayCategoriesWithPercent.map((cat, index) => {
    const angle = (cat.percentage / 100) * 360;
    const color = getCategoryColor(cat.id, cat.color, cat.name, index, cat.type);
    
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
    const innerRadius = 95;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
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

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'others-grouped' && !showOthers) {
      setShowOthers(true);
      setSelectedCategoryId(null);
      return;
    }

    setSelectedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-container">
        <div className="pie-chart">
          <div className="pie-visual pie-visual-hover donut">
            <svg width="350" height="350" viewBox="0 0 350 350">
              {slices.length === 1 ? (() => {
                const slice = slices[0];
                const radius = 140;
                const innerRadius = 95;
                const ringRadius = (radius + innerRadius) / 2;
                const ringWidth = radius - innerRadius;
                return (
                  <circle
                    cx="175"
                    cy="175"
                    r={ringRadius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={ringWidth}
                    className={`pie-slice ${hoveredId === slice.id ? 'is-hovered' : ''}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.85';
                      e.currentTarget.style.filter = 'brightness(1.1)';
                      setHoveredId(slice.id);
                      setTooltip({
                        xPercent: 50,
                        yPercent: 22,
                        name: slice.name,
                        amount: slice.amount,
                        percentage: slice.percentage,
                      });
                    }}
                    onClick={() => handleCategoryClick(slice.id)}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.filter = 'brightness(1)';
                      setHoveredId(null);
                      setTooltip(null);
                    }}
                  />
                );
              })() : slices.map((slice, index) => (
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
                  onClick={() => handleCategoryClick(slice.id)}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.filter = 'brightness(1)';
                    setHoveredId(null);
                    setTooltip(null);
                  }}
                />
              ))}
            </svg>
            <div className="pie-center">
              <div className="pie-center-label">{type === 'expense' ? 'Despesa' : 'Receita'}</div>
              <div className="pie-center-value">{formatCurrency(displayTotal || totalAmount)}</div>
            </div>
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
            {showOthers && otherCategoriesData.length > 0 && (
              <button
                className="legend-back"
                onClick={() => {
                  setShowOthers(false);
                  setSelectedCategoryId(null);
                }}
              >
                Voltar
              </button>
            )}
            {legendItems.map((cat, index) => {
              const color = getCategoryColor(cat.id, cat.color, cat.name, index, cat.type);
              
              return (
                <div
                  key={cat.id}
                  className="legend-item"
                  onClick={() => handleCategoryClick(cat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryClick(cat.id);
                    }
                  }}
                >
                  <div className="legend-label">
                    <div
                      className="legend-color"
                      style={{ background: color }}
                    />
                    <span className="legend-name">{cat.name}</span>
                  </div>
                  <div className="legend-value">
                    <span className="legend-amount">{formatCurrency(cat.amount)}</span>
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

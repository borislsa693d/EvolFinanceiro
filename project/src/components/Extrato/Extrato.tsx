import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { transactionsAPI, categoriesAPI, accountsAPI, creditCardsAPI } from '../../lib/api';
import type { Transaction, Category, Account, CreditCard } from '../../lib/api';
import { FaCalendarAlt, FaUniversity, FaCreditCard, FaFilter, FaTimes, FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Extrato.css';
import { getCategoryColor } from '../../lib/chartColors';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Extrato = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [periodMode, setPeriodMode] = useState<'month' | 'year' | 'custom'>('month');
  const [periodBase, setPeriodBase] = useState(new Date());
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (periodMode !== 'custom') {
      handleFilter();
    }
  }, [periodMode, periodBase]);

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData, accountsData, cardsData] = await Promise.all([
        transactionsAPI.getAll(),
        categoriesAPI.getAll(),
        accountsAPI.getAll(),
        creditCardsAPI.getAll(),
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setAccounts(accountsData);
      setCreditCards(cardsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const toISODate = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  const getYearRange = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear(), 11, 31);
    return { start, end };
  };

  const parseBRDate = (value: string) => {
    const parts = value.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
    if (!dd || !mm || !yyyy) return null;
    const date = new Date(yyyy, mm - 1, dd);
    if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
      return null;
    }
    return date;
  };

  const handlePeriodNav = (direction: 'prev' | 'next') => {
    const next = new Date(periodBase);
    if (periodMode === 'month') {
      next.setMonth(next.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (periodMode === 'year') {
      next.setFullYear(next.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    setPeriodBase(next);
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (periodMode === 'month') {
        const { start, end } = getMonthRange(periodBase);
        filters.start_date = toISODate(start);
        filters.end_date = toISODate(end);
      } else if (periodMode === 'year') {
        const { start, end } = getYearRange(periodBase);
        filters.start_date = toISODate(start);
        filters.end_date = toISODate(end);
      } else {
        const start = parseBRDate(customStart);
        const end = parseBRDate(customEnd);
        if (!start || !end) {
          alert('Informe o período no formato DD/MM/AAAA');
          setLoading(false);
          return;
        }
        filters.start_date = toISODate(start);
        filters.end_date = toISODate(end);
      }
      if (selectedAccount) filters.account_id = selectedAccount;
      if (selectedCard) filters.credit_card_id = selectedCard;

      const filtered = await transactionsAPI.getAll(filters);
      setTransactions(filtered);
    } catch (error) {
      console.error('Erro ao filtrar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setPeriodMode('month');
    setPeriodBase(new Date());
    setCustomStart('');
    setCustomEnd('');
    setSelectedAccount('');
    setSelectedCard('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;

    try {
      await transactionsAPI.delete(id);
      // Recarregar dados do servidor após deletar
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      alert('Erro ao excluir transação');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    // Navegar para página de nova transação com dados para edição
    navigate('/new-transaction', { state: { editTransaction: transaction } });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '-';
  };

  const getAccountName = (accountId: string | null, creditCardId: string | null) => {
    if (accountId) {
      const account = accounts.find(a => a.id === accountId);
      return account?.name || '-';
    }
    if (creditCardId) {
      const card = creditCards.find(c => c.id === creditCardId);
      return card?.name || '-';
    }
    return '-';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatAmountSigned = (value: number, type: 'income' | 'expense') => {
    const formatted = formatAmount(value);
    return type === 'expense' ? `-${formatted}` : formatted;
  };

  const formatDateBR = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getPeriodInfo = () => {
    if (periodMode === 'month') {
      const { start, end } = getMonthRange(periodBase);
      return {
        label: `${monthNames[periodBase.getMonth()]}/${periodBase.getFullYear()}`,
        start,
        end,
      };
    }
    if (periodMode === 'year') {
      const { start, end } = getYearRange(periodBase);
      return {
        label: `${periodBase.getFullYear()}`,
        start,
        end,
      };
    }
    const start = parseBRDate(customStart);
    const end = parseBRDate(customEnd);
    return {
      label: 'Personalizado',
      start: start || null,
      end: end || null,
    };
  };

  const getPeriodLabel = () => {
    const info = getPeriodInfo();
    if (info.start && info.end) {
      return `${formatDateBR(info.start)} - ${formatDateBR(info.end)}`;
    }
    if (periodMode === 'custom' && customStart && customEnd) {
      return `${customStart} - ${customEnd}`;
    }
    return info.label;
  };

  const getUserDisplayName = () => {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
    return user?.full_name || fullName || user?.email || 'Usuário';
  };

  const getExpenseCategoryData = () => {
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const expenseCategories = categories.filter((c) => c.type === 'expense');

    let categoryTotals = expenseCategories.map((category) => {
      const amount = expenseTransactions
        .filter((t) => t.category_id === category.id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return {
        ...category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      };
    }).filter((c) => c.amount > 0);

    categoryTotals.sort((a, b) => b.amount - a.amount);

    const MAX_SLICES = 6;
    if (categoryTotals.length > MAX_SLICES) {
      const topCategories = categoryTotals.slice(0, MAX_SLICES);
      const otherCategories = categoryTotals.slice(MAX_SLICES);
      const othersTotal = otherCategories.reduce((sum, cat) => sum + cat.amount, 0);
      const othersPercentage = totalExpense > 0 ? (othersTotal / totalExpense) * 100 : 0;

      if (othersTotal > 0) {
        const othersCategory = {
          id: 'others-grouped',
          name: 'Outros',
          color: '#94A3B8',
          type: 'expense' as const,
          amount: othersTotal,
          percentage: othersPercentage,
          created_at: '',
          user_id: '',
        };
        categoryTotals = [...topCategories, othersCategory];
      }
    }

    return {
      totalExpense,
      categories: categoryTotals,
    };
  };

  const escapeHtml = (value: string) => {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Descrição', 'Tipo', 'Conta/Cartão', 'Categoria', 'Valor'];

    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const rows = transactions.map((transaction) => {
      const date = formatDate(transaction.date);
      const description = transaction.description || '-';
      const typeLabel = transaction.type === 'income' ? 'Entrada' : 'Saída';
      const account = getAccountName(transaction.account_id || null, transaction.credit_card_id || null);
      const category = getCategoryName(transaction.category_id || null);
      const value = formatAmountSigned(transaction.amount, transaction.type);
      return [date, description, typeLabel, account, category, value].map((item) => csvEscape(String(item))).join(';');
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `extrato_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const siteName = 'EvolFinanceiro';
    const userName = getUserDisplayName();
    const periodLabel = getPeriodLabel();

    const incomeTotal = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenseTotal = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const balanceTotal = incomeTotal - expenseTotal;
    const maxValue = Math.max(incomeTotal, expenseTotal, Math.abs(balanceTotal), 1);

    const { totalExpense, categories: expenseCategories } = getExpenseCategoryData();

    let currentAngle = 0;
    const slices = expenseCategories.map((cat, index) => {
      const angle = (cat.percentage / 100) * 360;
      const color = getCategoryColor(cat.id, cat.color, cat.name, index, 'expense');
      const slice = {
        ...cat,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color,
      };
      currentAngle += angle;
      return slice;
    });

    const createSlicePath = (startAngle: number, endAngle: number) => {
      const centerX = 140;
      const centerY = 140;
      const radius = 105;
      const innerRadius = 70;

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

    const pieSvg = slices.length === 0
      ? '<div class="empty-chart">Nenhuma despesa no per�odo</div>'
      : slices.length === 1
        ? (() => {
            const slice = slices[0];
            const ringRadius = 85;
            const ringWidth = 35;
            return `
              <svg width="280" height="280" viewBox="0 0 280 280" class="pie-svg">
                <circle cx="140" cy="140" r="${ringRadius}" fill="none" stroke="${slice.color}" stroke-width="${ringWidth}" />
                <text x="140" y="132" text-anchor="middle" font-size="12" fill="#6b7280">Total</text>
                <text x="140" y="154" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">${formatAmount(totalExpense)}</text>
              </svg>
            `;
          })()
        : `
          <svg width="280" height="280" viewBox="0 0 280 280" class="pie-svg">
            ${slices.map((slice) => `
              <path d="${createSlicePath(slice.startAngle, slice.endAngle)}" fill="${slice.color}" stroke="#f1f5f9" stroke-width="3" />
            `).join('')}
            <text x="140" y="132" text-anchor="middle" font-size="12" fill="#6b7280">Total</text>
            <text x="140" y="154" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">${formatAmount(totalExpense)}</text>
          </svg>
        `;

    const html = `\r\n      <meta charset="utf-8">\r\n      <style>
        * { box-sizing: border-box; }
        .pdf-root {
          width: 794px;
          background: #ffffff;
          color: #111111;
          font-family: "Segoe UI", Arial, sans-serif;
          padding: 24px 28px 32px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 16px;
        }
        .site-name {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .meta {
          text-align: right;
          font-size: 13px;
          color: #4b5563;
          line-height: 1.4;
        }
        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 12px 0 20px;
        }
        .charts {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 16px;
          border-radius: 10px;
          min-height: 280px;
        }
        .card h3 {
          margin: 0 0 12px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #111827;
        }
        .bar-chart {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          height: 200px;
          align-items: end;
        }
        .bar {
          height: 170px;
          display: grid;
          grid-template-rows: 1fr auto;
          align-items: end;
          gap: 8px;
        }
        .bar-column {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          height: 140px;
          width: 100%;
        }
        .bar-rect {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          min-height: 10px;
          border-radius: 6px 6px 0 0;
          height: var(--bar-height);
        }
        .bar-value {
          position: absolute;
          bottom: calc(var(--bar-height) + 6px);
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 600;
          color: #111827;
          white-space: nowrap;
        }
        .bar-label {
          text-align: center;
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .pie-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pie-row {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .pie-box {
          position: relative;
          width: 280px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pie-svg {
          width: 280px;
          height: 280px;
          display: block;
          margin: 0 auto;
        }
        .legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .legend-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 12px;
          width: 100%;
        }
        .legend-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .legend-name {
          font-weight: 600;
        }
        .legend-value {
          text-align: right;
          font-size: 11px;
          color: #4b5563;
          min-width: 70px;
        }
        .table-wrap {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        thead {
          background: #f3f4f6;
        }
        th, td {
          padding: 9px 10px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
          vertical-align: top;
        }
        th {
          text-transform: uppercase;
          letter-spacing: 0.4px;
          font-size: 10px;
          color: #111827;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        .value-cell {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .value-expense {
          color: #ef4444;
          font-weight: 600;
        }
        .empty-chart {
          color: #6b7280;
          font-size: 12px;
          padding: 24px 0;
          text-align: center;
        }
      </style>
      <div class="pdf-root">
        <div class="header">
          <div class="site-name">${escapeHtml(siteName)}</div>
          <div class="meta">
            <div>Usu&aacute;rio: ${escapeHtml(userName)}</div>
            <div>Per&iacute;odo: ${escapeHtml(periodLabel)}</div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="charts">
          <div class="card">
            <h3>Resumo do Per&iacute;odo</h3>
            <div class="bar-chart">
              <div class="bar">
                <div class="bar-column" style="--bar-height:${Math.max((incomeTotal / maxValue) * 100, 5)}%;">
                  <div class="bar-rect" style="background: #22c55e;"></div>
                  <div class="bar-value">${formatAmount(incomeTotal)}</div>
                </div>
                <div class="bar-label">Entrada</div>
              </div>
              <div class="bar">
                <div class="bar-column" style="--bar-height:${Math.max((expenseTotal / maxValue) * 100, 5)}%;">
                  <div class="bar-rect" style="background: #ef4444;"></div>
                  <div class="bar-value">${formatAmount(expenseTotal)}</div>
                </div>
                <div class="bar-label">Sa&iacute;da</div>
              </div>
              <div class="bar">
                <div class="bar-column" style="--bar-height:${Math.max((Math.abs(balanceTotal) / maxValue) * 100, 5)}%;">
                  <div class="bar-rect" style="background: linear-gradient(to top, #9ca3af, #6b7280);"></div>
                  <div class="bar-value">${formatAmount(balanceTotal)}</div>
                </div>
                <div class="bar-label">Saldo</div>
              </div>
            </div>
          </div>
          <div class="card">
            <h3>Despesas por Categoria</h3>
            <div class="pie-wrap">
              <div class="pie-row">
                <div class="pie-box">
                  ${pieSvg}
                </div>
                <div class="legend">
                  ${expenseCategories.length === 0 ? '<div class="empty-chart">Nenhuma despesa no per&iacute;odo</div>' : expenseCategories.map((cat, index) => {
                    const color = getCategoryColor(cat.id, cat.color, cat.name, index, 'expense');
                    return `
                      <div class="legend-item">
                        <div class="legend-label">
                          <span class="legend-color" style="background: ${color};"></span>
                          <span class="legend-name">${escapeHtml(cat.name)}</span>
                        </div>
                        <div class="legend-value">
                          <div>${formatAmount(cat.amount)}</div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descri&ccedil;&atilde;o</th>
                <th>Tipo</th>
                <th>Conta/Cart&atilde;o</th>
                <th>Categoria</th>
                <th style="text-align:right;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.length === 0 ? `
                <tr><td colspan="6" class="empty-chart">Nenhuma transa��o encontrada</td></tr>
              ` : transactions.map((transaction) => `
                <tr>
                  <td>${escapeHtml(formatDate(transaction.date))}</td>
                  <td>${escapeHtml(transaction.description || '-')}</td>
                  <td>${transaction.type === 'income' ? 'Entrada' : 'Sa&iacute;da'}</td>
                  <td>${escapeHtml(getAccountName(transaction.account_id || null, transaction.credit_card_id || null))}</td>
                  <td>${escapeHtml(getCategoryName(transaction.category_id || null))}</td>
                  <td class="value-cell ${transaction.type === 'expense' ? 'value-expense' : ''}">${escapeHtml(formatAmountSigned(transaction.amount, transaction.type))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '794px';
    container.innerHTML = html;
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let position = 0;
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`extrato_${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  if (loading) {
    return (
      <div className="extrato-container">
        <div className="empty-state">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="extrato-container">
      <div className="extrato-header">
        <h2 className="text-3xl font-bold mb-6">Extrato Mensal</h2>
        <button 
          className="add-transaction-button desktop-only"
          onClick={() => navigate('/new-transaction')}
          title="Nova Transação"
        >
          <FaPlus />
        </button>
      </div>

      <div className="filters-panel">
        <div className="filters-container">
          {/* Filtro de Período */}
          <div className="filter-item">
            <label><FaCalendarAlt /> Período</label>
            <div className="period-select-row">
              {periodMode !== 'custom' && (
                <button className="period-nav-btn" onClick={() => handlePeriodNav('prev')}>
                  <FaChevronLeft />
                </button>
              )}
              <div className="period-select">
                <button
                  className="period-select-button"
                  onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                >
                  {periodMode === 'month'
                    ? `${monthNames[periodBase.getMonth()]}/${periodBase.getFullYear()}`
                    : periodMode === 'year'
                    ? `${periodBase.getFullYear()}`
                    : 'Personalizado'}
                </button>
                {isPeriodMenuOpen && (
                  <div className="period-menu">
                    <button
                      className="period-menu-item"
                      onClick={() => {
                        setPeriodMode('month');
                        setIsPeriodMenuOpen(false);
                      }}
                    >
                      Este Mês
                    </button>
                    <button
                      className="period-menu-item"
                      onClick={() => {
                        setPeriodMode('year');
                        setIsPeriodMenuOpen(false);
                      }}
                    >
                      Este Ano
                    </button>
                    <button
                      className="period-menu-item"
                      onClick={() => {
                        setPeriodMode('custom');
                        setIsPeriodMenuOpen(false);
                      }}
                    >
                      Personalizado
                    </button>
                  </div>
                )}
              </div>
              {periodMode !== 'custom' && (
                <button className="period-nav-btn" onClick={() => handlePeriodNav('next')}>
                  <FaChevronRight />
                </button>
              )}
            </div>

            {periodMode === 'custom' && (
              <div className="period-inputs custom">
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
                <span>-</span>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Filtro por Conta */}
          <div className="filter-item">
            <label htmlFor="account-filter"><FaUniversity /> Conta</label>
            <select 
              id="account-filter"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="">Todas</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Cartão de Crédito */}
          <div className="filter-item">
            <label htmlFor="cc-filter"><FaCreditCard /> Cartão de Crédito</label>
            <select 
              id="cc-filter"
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
            >
              <option value="">Todos</option>
              {creditCards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button className="filter-button apply-button" onClick={handleFilter}>
            <FaFilter />
            Aplicar Filtros
          </button>
          <button className="filter-button clear-button" onClick={handleClearFilters}>
            <FaTimes />
            Limpar
          </button>
          <button className="filter-button export-button" onClick={handleExportPDF}>
            Exportar PDF
          </button>
          <button className="filter-button export-button" onClick={handleExportCSV}>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        {transactions.length === 0 ? (
          <div className="empty-state">
            Nenhuma transação encontrada
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Conta/Cartão</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.description || '-'}</td>
                  <td>
                    <span className={`transaction-type ${transaction.type}`}>
                      {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td>{getAccountName(transaction.account_id || null, transaction.credit_card_id || null)}</td>
                  <td>{getCategoryName(transaction.category_id || null)}</td>
                  <td className={transaction.type === 'income' ? 'income-value' : 'expense-value'}>
                    <span className="money">
                      <span className="money-symbol">R$</span>
                      <span className="money-value">{transaction.type === "expense" ? `-${formatAmount(transaction.amount)}` : formatAmount(transaction.amount)}</span>
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(transaction)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(transaction.id)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Extrato;

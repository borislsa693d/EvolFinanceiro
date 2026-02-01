import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fixedTransactionsAPI, categoriesAPI } from '../../lib/api';
import type { Category, FixedTransaction } from '../../lib/api';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../Modal/Modal';
import './PrevisaoPage.css';

interface FixedTransactionsPageProps {
  type: 'income' | 'expense';
  title: string;
}

export default function FixedTransactionsPage({ type, title }: FixedTransactionsPageProps) {
  const { user } = useAuth();
  const [fixedTransactions, setFixedTransactions] = useState<FixedTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado do mês selecionado (iniciando em Janeiro 2026)
  const [selectedMonth, setSelectedMonth] = useState(1); // 1 = Janeiro
  const [selectedYear, setSelectedYear] = useState(2026);

  // Modal e form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFixed, setEditingFixed] = useState<FixedTransaction | null>(null);
  const [fixedForm, setFixedForm] = useState({
    description: '',
    amount: '',
    day_of_month: '1',
    category_id: '',
    account_id: '',
    credit_card_id: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [fixedData, categoriesData] = await Promise.all([
        fixedTransactionsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);

      setFixedTransactions(fixedData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCurrencyInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const value = Number(digits) / 100;
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrencyInput = (formatted: string) => {
    const normalized = formatted.replace(/\./g, '').replace(',', '.');
    const value = Number(normalized);
    return Number.isNaN(value) ? 0 : value;
  };

  const fullMonthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const getMonthStart = (month: number, year: number) => {
    return new Date(year, month - 1, 1);
  };

  const isFixedActiveForMonth = (fixed: FixedTransaction, month: number, year: number) => {
    const monthStart = getMonthStart(month, year);
    const startDate = fixed.start_date ? new Date(fixed.start_date + 'T00:00:00') : null;
    const endDate = fixed.end_date ? new Date(fixed.end_date + 'T00:00:00') : null;

    if (startDate && monthStart < startDate) return false;
    if (endDate && monthStart > endDate) return false;
    return true;
  };

  const handleOpenModal = (fixed?: FixedTransaction) => {
    if (fixed) {
      setEditingFixed(fixed);
      setFixedForm({
        description: fixed.description,
        amount: formatCurrencyInput(fixed.amount.toString()),
        day_of_month: fixed.day_of_month.toString(),
        category_id: fixed.category_id || '',
        account_id: fixed.account_id || '',
        credit_card_id: fixed.credit_card_id || '',
      });
    } else {
      setEditingFixed(null);
      setFixedForm({
        description: '',
        amount: '',
        day_of_month: '1',
        category_id: '',
        account_id: '',
        credit_card_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFixed(null);
    setFixedForm({
      description: '',
      amount: '',
      day_of_month: '1',
      category_id: '',
      account_id: '',
      credit_card_id: '',
    });
  };

  const handleSubmitFixed = async () => {
    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().slice(0, 10);
      if (!fixedForm.amount) {
        alert('Informe um valor válido');
        return;
      }

      const data: any = {
        type,
        description: fixedForm.description,
        amount: parseCurrencyInput(fixedForm.amount),
        day_of_month: parseInt(fixedForm.day_of_month),
        start_date: startDate,
        category_id: fixedForm.category_id || null,
      };

      if (type === 'expense') {
        data.account_id = fixedForm.account_id || null;
        data.credit_card_id = fixedForm.credit_card_id || null;
      }

      if (editingFixed) {
        await fixedTransactionsAPI.update(editingFixed.id, data);
      } else {
        await fixedTransactionsAPI.create(data);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar receita/despesa fixa:', error);
      alert('Erro ao salvar');
    }
  };

  const handleDeleteFixed = async (fixed: FixedTransaction) => {
    if (!confirm('Deseja encerrar esta receita/despesa fixa a partir deste mês?')) return;

    try {
      const previousMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const previousYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      const lastDayPrevMonth = new Date(previousYear, previousMonth, 0).getDate();
      const endDate = new Date(previousYear, previousMonth - 1, lastDayPrevMonth);
      const endDateStr = endDate.toISOString().slice(0, 10);

      await fixedTransactionsAPI.update(fixed.id, { end_date: endDateStr });
      await loadData();
    } catch (error) {
      console.error('Erro ao encerrar:', error);
      alert('Erro ao encerrar');
    }
  };

  const fixedList = fixedTransactions.filter(
    (f) => f.type === type && isFixedActiveForMonth(f, selectedMonth, selectedYear),
  );
  const filteredCategories = categories.filter((c) => c.type === type);
  const modalLabel = type === 'income' ? 'Receita Fixa' : 'Despesa Fixa';

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#000000', 
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  const emptyLabel = type === 'income' ? 'Nenhuma receita fixa cadastrada' : 'Nenhuma despesa fixa cadastrada';

  return (
    <div className="previsao-page">
      <div className="spreadsheet-header">
        <button 
          className="month-nav-button"
          onClick={() => navigateMonth('prev')}
          aria-label="Mês anterior"
        >
          <ChevronLeft size={24} />
        </button>
        
        <h2 className="previsao-title">
          {fullMonthNames[selectedMonth - 1]}/{selectedYear}
        </h2>
        
        <button 
          className="month-nav-button"
          onClick={() => navigateMonth('next')}
          aria-label="Próximo mês"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="fixed-sections-container">
        <div className="fixed-section">
          <div className="fixed-section-header">
            <h3>{title}</h3>
            <button 
              className="add-fixed-button"
              onClick={() => handleOpenModal()}
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="fixed-list">
            {fixedList.length === 0 ? (
              <div className="empty-fixed">{emptyLabel}</div>
            ) : (
              fixedList.map((fixed) => (
                <div key={fixed.id} className="fixed-item">
                  <div className="fixed-item-info">
                    <span className="fixed-day">Dia {fixed.day_of_month}</span>
                    <span className="fixed-description">{fixed.description}</span>
                    <span className={`fixed-amount ${type === 'income' ? 'income' : 'expense'}`}>
                      {formatCurrency(fixed.amount)}
                    </span>
                  </div>
                  <div className="fixed-item-actions">
                    <button
                      className="icon-button edit"
                      onClick={() => handleOpenModal(fixed)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="icon-button delete"
                      onClick={() => handleDeleteFixed(fixed)}
                      title="Encerrar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingFixed ? `Editar ${modalLabel}` : `Nova ${modalLabel}`}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitFixed(); }}>
          <div className="form-field">
            <label>Descrição *</label>
            <input
              type="text"
              value={fixedForm.description}
              onChange={(e) => setFixedForm({ ...fixedForm, description: e.target.value })}
              required
              placeholder={type === 'income' ? 'Ex: Salário' : 'Ex: Aluguel'}
            />
          </div>

          <div className="form-field">
            <label>Valor *</label>
            <input
              type="text"
              inputMode="decimal"
              value={fixedForm.amount}
              onChange={(e) => setFixedForm({ ...fixedForm, amount: formatCurrencyInput(e.target.value) })}
              required
              placeholder="0,00"
            />
          </div>

          <div className="form-field">
            <label>Dia do Mês *</label>
            <input
              type="number"
              min="1"
              max="31"
              value={fixedForm.day_of_month}
              onChange={(e) => setFixedForm({ ...fixedForm, day_of_month: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label>Categoria</label>
            <select
              value={fixedForm.category_id}
              onChange={(e) => setFixedForm({ ...fixedForm, category_id: e.target.value })}
            >
              <option value="">Selecione...</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button type="submit" className="button-primary">
              {editingFixed ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

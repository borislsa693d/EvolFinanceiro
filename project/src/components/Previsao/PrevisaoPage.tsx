import { useState, useMemo } from 'react';
import Modal from '../Modal/Modal';
import './Previsao.css';
import { FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Unified type for forecast entries
export interface PrevisaoItem {
  id: string;
  dia: number;
  tipo: 'Entrada' | 'Saída';
  valor: number;
  descricao: string;
  conta?: string;
}

// Sample data for the initial month
const samplePrevisoes: PrevisaoItem[] = [
  { id: '1', dia: 5, tipo: 'Saída', valor: 250, descricao: 'Plano de Saúde', conta: 'Conta Corrente' },
  { id: '2', dia: 1, tipo: 'Entrada', valor: 8000, descricao: 'Salário', conta: 'Conta Salário' },
  { id: '3', dia: 10, tipo: 'Saída', valor: 150, descricao: 'Internet', conta: 'Cartão de Crédito' },
];

// Helper to get a month-year key string (e.g., "2026-01")
const getMonthKey = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
};

export default function PrevisaoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [previsoesPorMes, setPrevisoesPorMes] = useState<{ [key: string]: PrevisaoItem[] }>({
    [getMonthKey(new Date())]: samplePrevisoes,
  });

  const currentMonthKey = getMonthKey(currentDate);
  const previsoes = previsoesPorMes[currentMonthKey] || [];

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      const newMonth = direction === 'next' ? newDate.getMonth() + 1 : newDate.getMonth() - 1;
      newDate.setMonth(newMonth, 1); // Set to day 1 to avoid month skipping issues

      const newMonthKey = getMonthKey(newDate);
      const oldMonthKey = getMonthKey(prevDate);

      // If the new month has no data, copy it from the current month
      setPrevisoesPorMes(prevData => {
        if (!prevData[newMonthKey] && prevData[oldMonthKey]) {
          return { ...prevData, [newMonthKey]: prevData[oldMonthKey] };
        }
        return prevData;
      });

      return newDate;
    });
  };

  const sortedPrevisoes = useMemo(() => {
    return [...previsoes].sort((a, b) => a.dia - b.dia);
  }, [previsoes]);

  const previsaoSaldoDiario = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dias = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    let saldoAtual = 0;

    return dias.map((dia) => {
      const entradasDoDia = previsoes
        .filter((p) => p.dia === dia && p.tipo === 'Entrada')
        .reduce((sum, p) => sum + p.valor, 0);

      const saidasDoDia = previsoes
        .filter((p) => p.dia === dia && p.tipo === 'Saída')
        .reduce((sum, p) => sum + p.valor, 0);

      saldoAtual = saldoAtual + entradasDoDia - saidasDoDia;

      return { dia, entrada: entradasDoDia, saida: saidasDoDia, saldo: saldoAtual };
    });
  }, [previsoes, currentDate]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSave = (newItem: PrevisaoItem) => {
    setPrevisoesPorMes(prev => ({
      ...prev,
      [currentMonthKey]: [...(prev[currentMonthKey] || []), newItem],
    }));
    closeModal();
  };

  const handleDelete = (id: string) => {
    setPrevisoesPorMes(prev => ({
      ...prev,
      [currentMonthKey]: prev[currentMonthKey].filter(p => p.id !== id),
    }));
  };

  return (
    <div className="previsao-container">
      {/* Month Navigation */}
      <div className="month-navigation">
        <button onClick={() => handleMonthChange('prev')} className="month-nav-button">
          <FaChevronLeft />
        </button>
        <h2 className="current-month-display">
          {currentDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }).replace(' de ', '/').replace('.', '')}
        </h2>
        <button onClick={() => handleMonthChange('next')} className="month-nav-button">
          <FaChevronRight />
        </button>
      </div>

      {/* Lançamentos Fixos */}
      <div className="previsao-section">
        <div className="previsao-header">
          <h2 className="previsao-title">Lançamentos Fixos</h2>
          <button className="add-previsao-button" onClick={openModal}>
            <FaPlus /> Adicionar
          </button>
        </div>
        <div className="table-container lancamentos-fixos-table-container">
          <table>
            <thead>
              <tr>
                <th>Dia</th><th>Tipo</th><th>Descrição</th><th>Conta</th><th>Valor</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedPrevisoes.map((item) => (
                <tr key={item.id}>
                  <td>{String(item.dia).padStart(2, '0')}</td>
                  <td><span className={`tipo-badge tipo-${item.tipo.toLowerCase()}`}>{item.tipo}</span></td>
                  <td>{item.descricao}</td>
                  <td>{item.conta || 'N/A'}</td>
                  <td>{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>
                    <button className="action-button delete-button" onClick={() => handleDelete(item.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Previsão de Saldo */}
      <div className="previsao-section">
        <div className="previsao-header">
          <h2 className="previsao-title">Previsão de Saldo</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Dia</th><th>Entrada</th><th>Saída</th><th>Saldo</th></tr>
            </thead>
            <tbody>
              {previsaoSaldoDiario.map((item) => (
                <tr key={item.dia}>
                  <td>{String(item.dia).padStart(2, '0')}</td>
                  <td className="valor-entrada">{item.entrada > 0 ? item.entrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</td>
                  <td className="valor-saida">{item.saida > 0 ? item.saida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</td>
                  <td className={`valor-saldo ${item.saldo >= 0 ? 'positivo' : 'negativo'}`}>{item.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Adicionar Lançamento Fixo">
        <AddPrevisaoForm onSave={handleSave} onClose={closeModal} />
      </Modal>
    </div>
  );
}

// Form component to be used inside the modal
const AddPrevisaoForm: React.FC<{ onSave: (item: PrevisaoItem) => void; onClose: () => void; }> = ({ onSave, onClose }) => {
  const [tipo, setTipo] = useState<'Entrada' | 'Saída'>('Saída');
  // TODO: Add state and handlers for form fields (dia, valor, etc.)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Form validation and data creation
    const newItem: PrevisaoItem = {
      id: Date.now().toString(),
      dia: 15, // Placeholder
      tipo,
      valor: 100, // Placeholder
      descricao: 'Placeholder', // Placeholder
    };
    onSave(newItem);
  };

  return (
    <form onSubmit={handleSubmit} className="previsao-modal-form">
      <div className="tipo-toggle">
        <button type="button" className={tipo === 'Saída' ? 'active' : ''} onClick={() => setTipo('Saída')}>Despesa</button>
        <button type="button" className={tipo === 'Entrada' ? 'active' : ''} onClick={() => setTipo('Entrada')}>Receita</button>
      </div>
      <div className="form-field"><label>Dia do Lançamento</label><input type="number" min="1" max="31" required /></div>
      <div className="form-field"><label>Valor</label><input type="number" step="0.01" min="0.01" required /></div>
      <div className="form-field"><label>Descrição</label><input type="text" required /></div>
      <div className="form-field"><label>Conta (Opcional)</label><input type="text" /></div>
      <div className="modal-actions">
        <button type="button" className="button-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="button-primary">Salvar</button>
      </div>
    </form>
  );
};

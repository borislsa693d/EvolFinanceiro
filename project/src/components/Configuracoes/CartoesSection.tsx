import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { creditCardsAPI, type CreditCard } from '../../lib/api';

const CartoesSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cartoes, setCartoes] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [limitTotalDigits, setLimitTotalDigits] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await creditCardsAPI.getAll();
      setCartoes(data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      alert('Erro ao carregar cartões');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (card?: CreditCard) => {
    if (card) {
      setIsEditing(true);
      setEditingId(card.id);
      setName(card.name);
      const totalCents = Math.round(Number(card.limit_total || 0) * 100);
      setLimitTotalDigits(totalCents > 0 ? String(totalCents) : '');
      setClosingDay(card.closing_day?.toString() || '');
      setDueDay(card.due_day?.toString() || '');
    } else {
      setIsEditing(false);
      setEditingId(null);
      setName('');
      setLimitTotalDigits('');
      setClosingDay('');
      setDueDay('');
    }
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setLimitTotalDigits('');
    setClosingDay('');
    setDueDay('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && editingId) {
        await creditCardsAPI.update(editingId, {
          name,
          limit_total: limitTotalDigits ? Number(limitTotalDigits) / 100 : 0,
          limit_available: limitTotalDigits ? Number(limitTotalDigits) / 100 : 0,
          closing_day: closingDay ? parseInt(closingDay) : undefined,
          due_day: dueDay ? parseInt(dueDay) : undefined,
        });
      } else {
        await creditCardsAPI.create({
          name,
          limit_total: limitTotalDigits ? Number(limitTotalDigits) / 100 : 0,
          limit_available: limitTotalDigits ? Number(limitTotalDigits) / 100 : 0,
          closing_day: closingDay ? parseInt(closingDay) : undefined,
          due_day: dueDay ? parseInt(dueDay) : undefined,
        });
      }
      
      await loadCards();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      alert('Erro ao salvar cartão');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cartão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await creditCardsAPI.delete(id);
      await loadCards();
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      alert('Erro ao excluir cartão. Verifique se não há transações associadas.');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  const formatCurrencyFromDigitsModal = (digits: string) => {
    const normalized = digits ? digits : '0';
    const value = Number(normalized) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return `R$ ${formatted}`;
  };

  const formatCurrencyFromDigitsTable = (digits: string) => {
    const normalized = digits ? digits : '0';
    const cents = normalized.padStart(2, '0');
    const intPart = cents.length > 2 ? cents.slice(0, -2) : '0';
    const fracPart = cents.slice(-2);
    const intPadded = intPart.padStart(4, '0');
    const intWithDots = intPadded.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `R$ ${intWithDots},${fracPart}`;
  };

  const formatCurrencyFromValue = (value: number) => {
    const cents = Math.round(Number(value || 0) * 100);
    return formatCurrencyFromDigitsTable(cents > 0 ? String(cents) : '0');
  };

  const handleLimitTotalChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    setLimitTotalDigits(digitsOnly);
  };


  return (
    <div className="config-section">
      <div className="config-section-header">
        <h3>Cartões de Crédito</h3>
        <button className="add-button" onClick={() => handleOpenModal()}>
          <FaPlus /> Adicionar Cartão
        </button>
      </div>
      
      <div className="table-container">
        {cartoes.length === 0 ? (
          <div className="empty-state">Nenhum cartão cadastrado</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Limite Total</th>
                <th>Limite Disponível</th>
                <th>Fechamento</th>
                <th>Vencimento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cartoes.map(cartao => (
                <tr key={cartao.id}>
                  <td>{cartao.name}</td>
                  <td>{formatCurrencyFromValue(Number(cartao.limit_total))}</td>
                  <td>{formatCurrencyFromValue(Number(cartao.limit_available))}</td>
                  <td>{cartao.closing_day ? `Dia ${cartao.closing_day}` : '-'}</td>
                  <td>{cartao.due_day ? `Dia ${cartao.due_day}` : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenModal(cartao)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(cartao.id)}
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={isEditing ? 'Editar Cartão de Crédito' : 'Adicionar Cartão de Crédito'}
      >
        <form className="modal-form compact" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Nome do Cartão *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="Ex: Nubank, Inter..."
            />
          </div>
          <div className="form-field">
            <label>Limite Total *</label>
            <input 
              type="text"
              inputMode="numeric"
              value={formatCurrencyFromDigitsModal(limitTotalDigits)}
              onChange={(e) => handleLimitTotalChange(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Dia de Fechamento</label>
            <input 
              type="number" 
              min="1" 
              max="31"
              value={closingDay}
              onChange={(e) => setClosingDay(e.target.value)}
              placeholder="Ex: 10"
            />
          </div>
          <div className="form-field">
            <label>Dia de Vencimento</label>
            <input 
              type="number" 
              min="1" 
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              placeholder="Ex: 17"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button type="submit" className="button-primary">
              {isEditing ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CartoesSection;

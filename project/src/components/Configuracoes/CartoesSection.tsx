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
  const [limitTotal, setLimitTotal] = useState('0');
  const [limitAvailable, setLimitAvailable] = useState('0');
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
      setLimitTotal(card.limit_total.toString());
      setLimitAvailable(card.limit_available.toString());
      setClosingDay(card.closing_day?.toString() || '');
      setDueDay(card.due_day?.toString() || '');
    } else {
      setIsEditing(false);
      setEditingId(null);
      setName('');
      setLimitTotal('0');
      setLimitAvailable('0');
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
    setLimitTotal('0');
    setLimitAvailable('0');
    setClosingDay('');
    setDueDay('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && editingId) {
        await creditCardsAPI.update(editingId, {
          name,
          limit_total: parseFloat(limitTotal),
          limit_available: parseFloat(limitAvailable),
          closing_day: closingDay ? parseInt(closingDay) : undefined,
          due_day: dueDay ? parseInt(dueDay) : undefined,
        });
      } else {
        await creditCardsAPI.create({
          name,
          limit_total: parseFloat(limitTotal),
          limit_available: parseFloat(limitAvailable),
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
                  <td>{cartao.limit_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>{cartao.limit_available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
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
        <form className="modal-form" onSubmit={handleSubmit}>
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
              type="number" 
              step="0.01"
              value={limitTotal}
              onChange={(e) => setLimitTotal(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>
          <div className="form-field">
            <label>Limite Disponível</label>
            <input 
              type="number" 
              step="0.01"
              value={limitAvailable}
              onChange={(e) => setLimitAvailable(e.target.value)}
              placeholder="0.00"
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

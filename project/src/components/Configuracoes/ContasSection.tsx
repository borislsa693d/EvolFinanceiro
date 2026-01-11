import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { accountsAPI, type Account } from '../../lib/api';

const ContasSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contas, setContas] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await accountsAPI.getAll();
      setContas(data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      alert('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setIsEditing(true);
      setEditingId(account.id);
      setName(account.name);
      setType(account.type || '');
      setInitialBalance(account.initial_balance.toString());
    } else {
      setIsEditing(false);
      setEditingId(null);
      setName('');
      setType('');
      setInitialBalance('0');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setType('');
    setInitialBalance('0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && editingId) {
        await accountsAPI.update(editingId, {
          name,
          type,
          initial_balance: parseFloat(initialBalance),
        });
      } else {
        await accountsAPI.create({
          name,
          type,
          initial_balance: parseFloat(initialBalance),
        });
      }
      
      await loadAccounts();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      alert('Erro ao salvar conta');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await accountsAPI.delete(id);
      await loadAccounts();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('Erro ao excluir conta. Verifique se não há transações associadas.');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="config-section">
      <div className="config-section-header">
        <h3>Contas Bancárias</h3>
        <button className="add-button" onClick={() => handleOpenModal()}>
          <FaPlus /> Adicionar Conta
        </button>
      </div>
      
      <div className="table-container">
        {contas.length === 0 ? (
          <div className="empty-state">Nenhuma conta cadastrada</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Saldo Inicial</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {contas.map(conta => (
                <tr key={conta.id}>
                  <td>{conta.name}</td>
                  <td>{conta.type || '-'}</td>
                  <td>{conta.initial_balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenModal(conta)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(conta.id)}
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
        title={isEditing ? 'Editar Conta Bancária' : 'Adicionar Conta Bancária'}
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Nome da Conta *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="Ex: Conta Corrente, Poupança..."
            />
          </div>
          <div className="form-field">
            <label>Tipo de Conta</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="Corrente">Corrente</option>
              <option value="Poupança">Poupança</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>
          <div className="form-field">
            <label>Saldo Inicial</label>
            <input 
              type="number" 
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
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

export default ContasSection;

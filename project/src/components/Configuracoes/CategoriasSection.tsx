import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { categoriesAPI, type Category } from '../../lib/api';

const CategoriasSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      alert('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category, defaultType?: 'income' | 'expense') => {
    if (category) {
      setIsEditing(true);
      setEditingId(category.id);
      setName(category.name);
      setColor(category.color || '#000000');
      setType(category.type);
    } else {
      setIsEditing(false);
      setEditingId(null);
      setName('');
      setColor('#000000');
      setType(defaultType || 'expense');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setColor('#000000');
    setType('expense');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Nome da categoria é obrigatório');
      return;
    }

    try {
      if (isEditing && editingId) {
        await categoriesAPI.update(editingId, {
          name,
          color,
          type,
        });
      } else {
        await categoriesAPI.create({
          name,
          color,
          type,
        });
      }
      
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta categoria? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await categoriesAPI.delete(id);
      await loadCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria. Verifique se não há transações associadas.');
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="config-section">
      <div className="config-section-header">
        <h3>Categorias</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="add-button" 
            onClick={() => handleOpenModal(undefined, 'income')}
            style={{ background: '#10b981' }}
          >
            <FaPlus /> Adicionar Entrada
          </button>
          <button 
            className="add-button" 
            onClick={() => handleOpenModal(undefined, 'expense')}
            style={{ background: '#ef4444' }}
          >
            <FaPlus /> Adicionar Saída
          </button>
        </div>
      </div>

      <div className="categories-container">
        {/* Categorias de Entrada */}
        <div className="category-type-section">
          <h4 className="category-type-title income-title">
            <span style={{ color: '#10b981' }}>✅</span> Entrada
          </h4>
          {incomeCategories.length === 0 ? (
            <div className="empty-state-small">Nenhuma categoria de entrada</div>
          ) : (
            <div className="categorias-list">
              {incomeCategories.map(categoria => (
                <div key={categoria.id} className="categoria-item" style={{ borderLeftColor: categoria.color }}>
                  <div className="categoria-item-content">
                    <span 
                      className="categoria-color-indicator"
                      style={{ backgroundColor: categoria.color }}
                    />
                    <span>{categoria.name}</span>
                  </div>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleOpenModal(categoria)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(categoria.id)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categorias de Saída */}
        <div className="category-type-section">
          <h4 className="category-type-title expense-title">
            <span style={{ color: '#ef4444' }}>❌</span> Saída
          </h4>
          {expenseCategories.length === 0 ? (
            <div className="empty-state-small">Nenhuma categoria de saída</div>
          ) : (
            <div className="categorias-list">
              {expenseCategories.map(categoria => (
                <div key={categoria.id} className="categoria-item" style={{ borderLeftColor: categoria.color }}>
                  <div className="categoria-item-content">
                    <span 
                      className="categoria-color-indicator"
                      style={{ backgroundColor: categoria.color }}
                    />
                    <span>{categoria.name}</span>
                  </div>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleOpenModal(categoria)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(categoria.id)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={isEditing ? 'Editar Categoria' : 'Adicionar Categoria'}
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Tipo *</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as 'income' | 'expense')}
              required
              disabled={isEditing} // Não permite mudar tipo ao editar
            >
              <option value="expense">Saída</option>
              <option value="income">Entrada</option>
            </select>
            {isEditing && (
              <small style={{ color: '#888', marginTop: '0.25rem', display: 'block' }}>
                O tipo não pode ser alterado ao editar
              </small>
            )}
          </div>
          <div className="form-field">
            <label>Nome da Categoria *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="Ex: Salário, Alimentação..."
            />
          </div>
          <div className="form-field">
            <label>Cor</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="color" 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '60px', height: '40px', cursor: 'pointer' }}
              />
              <input 
                type="text" 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
                style={{ flex: 1 }}
              />
            </div>
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

export default CategoriasSection;

import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { FaPlus, FaTrash } from 'react-icons/fa';

// Placeholder data type
interface Categoria {
  id: string;
  nome: string;
  isDefault: boolean;
}

const defaultCategories: Categoria[] = [
  { id: 'cat1', nome: 'Alimentação', isDefault: true },
  { id: 'cat2', nome: 'Moradia', isDefault: true },
  { id: 'cat3', nome: 'Lazer', isDefault: true },
  { id: 'cat4', nome: 'Transporte', isDefault: true },
  { id: 'cat5', nome: 'Educação', isDefault: true },
];

const sampleCustomCategories: Categoria[] = [
    { id: 'cat6', nome: 'Investimentos', isDefault: false },
]

const CategoriasSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customCategorias, setCustomCategorias] = useState<Categoria[]>(sampleCustomCategories);

  const allCategories = [...defaultCategories, ...customCategorias];

  return (
    <div className="config-section">
      <div className="config-section-header">
        <h3>Categorias</h3>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Adicionar Categoria
        </button>
      </div>
      
      <div className="categorias-list">
        {allCategories.map(categoria => (
          <div key={categoria.id} className="categoria-item">
            <span>{categoria.nome}</span>
            {!categoria.isDefault && (
              <button className="action-button delete-button">
                <FaTrash />
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Categoria">
        <form className="modal-form">
          <div className="form-field">
            <label>Nome da Categoria</label>
            <input type="text" required />
          </div>
          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="button-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriasSection;

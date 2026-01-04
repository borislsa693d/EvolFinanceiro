import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { FaPlus } from 'react-icons/fa';

// Placeholder data type
interface Cartao {
  id: string;
  nome: string;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
}

const sampleCartoes: Cartao[] = [
  { id: '1', nome: 'Nubank', limite: 8000, diaFechamento: 10, diaVencimento: 17 },
  { id: '2', nome: 'Inter', limite: 5000, diaFechamento: 20, diaVencimento: 27 },
];

const CartoesSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartoes, setCartoes] = useState<Cartao[]>(sampleCartoes);

  return (
    <div className="config-section">
      <div className="config-section-header">
        <h3>Cartões de Crédito</h3>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Adicionar Cartão
        </button>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Limite</th>
              <th>Fechamento</th>
              <th>Vencimento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cartoes.map(cartao => (
              <tr key={cartao.id}>
                <td>{cartao.nome}</td>
                <td>{cartao.limite.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>Dia {cartao.diaFechamento}</td>
                <td>Dia {cartao.diaVencimento}</td>
                <td>{/* Action buttons will go here */}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Cartão de Crédito">
        <form className="modal-form">
          <div className="form-field">
            <label>Nome do Cartão (ex: Nubank, Inter)</label>
            <input type="text" required />
          </div>
          <div className="form-field">
            <label>Limite Total</label>
            <input type="number" step="0.01" required />
          </div>
          <div className="form-field">
            <label>Dia de Fechamento</label>
            <input type="number" min="1" max="31" required />
          </div>
          <div className="form-field">
            <label>Dia de Vencimento</label>
            <input type="number" min="1" max="31" required />
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

export default CartoesSection;

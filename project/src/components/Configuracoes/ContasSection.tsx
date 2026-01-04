import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { FaPlus } from 'react-icons/fa';

// Placeholder data type
interface Conta {
  id: string;
  banco: string;
  tipo: string;
  saldo: number;
}

const sampleContas: Conta[] = [
  { id: '1', banco: 'Neon', tipo: 'Corrente', saldo: 1500.75 },
  { id: '2', banco: 'Iti', tipo: 'Poupança', saldo: 10000.00 },
];

const ContasSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contas, setContas] = useState<Conta[]>(sampleContas);

  return (
    <div className="config-section">
      <div className="config-section-header">
        <h3>Contas Bancárias</h3>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Adicionar Conta
        </button>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Banco</th>
              <th>Tipo</th>
              <th>Saldo Inicial</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contas.map(conta => (
              <tr key={conta.id}>
                <td>{conta.banco}</td>
                <td>{conta.tipo}</td>
                <td>{conta.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{/* Action buttons (edit, delete) will go here */}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Conta Bancária">
        <form className="modal-form">
          <div className="form-field">
            <label>Nome do Banco</label>
            <input type="text" required />
          </div>
          <div className="form-field">
            <label>Tipo de Conta</label>
            <select required>
              <option value="Corrente">Corrente</option>
              <option value="Poupança">Poupança</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>
          <div className="form-field">
            <label>Saldo Inicial (Opcional)</label>
            <input type="number" step="0.01" />
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

export default ContasSection;

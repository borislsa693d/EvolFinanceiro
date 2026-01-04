import React from 'react';
import './Extrato.css';
import { FaCalendarAlt, FaUniversity, FaCreditCard, FaFilter, FaTimes } from 'react-icons/fa';

const Extrato: React.FC = () => {
  return (
    <div className="extrato-container">
      <h2 className="text-3xl font-bold mb-6">Extrato Mensal</h2>

      <div className="filters-panel">
        <div className="filters-container">
          {/* Filtro de Período */}
          <div className="filter-item">
            <label htmlFor="start-date"><FaCalendarAlt /> Período</label>
            <div className="period-inputs">
              <input type="date" id="start-date" />
              <span>-</span>
              <input type="date" id="end-date" />
            </div>
          </div>

          {/* Filtro por Conta */}
          <div className="filter-item">
            <label htmlFor="account-filter"><FaUniversity /> Conta</label>
            <select id="account-filter">
              <option value="">Todas</option>
              {/* Adicionar opções de conta dinamicamente */}
            </select>
          </div>

          {/* Filtro por Cartão de Crédito */}
          <div className="filter-item">
            <label htmlFor="cc-filter"><FaCreditCard /> Cartão de Crédito</label>
            <select id="cc-filter">
              <option value="">Todos</option>
              {/* Adicionar opções de cartão dinamicamente */}
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button className="filter-button apply-button">
            <FaFilter />
            Aplicar Filtros
          </button>
          <button className="filter-button clear-button">
            <FaTimes />
            Limpar
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Dia</th>
              <th>Entrada/Saída</th>
              <th>Conta/Cartão</th>
              <th>Categoria</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {/* Exemplo de linha - substituir por dados reais */}
            <tr>
              <td>03/01/2026</td>
              <td>Saída</td>
              <td>Conta Corrente</td>
              <td>Alimentação</td>
              <td>R$ 50,00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Extrato;

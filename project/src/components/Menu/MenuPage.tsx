import React from 'react';
import { Link } from 'react-router-dom';
import './MenuPage.css';
import { FaChartLine, FaUniversity, FaCreditCard, FaTags, FaUser, FaCalendarAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const menuItems = [
  { path: '/analises', label: 'Análises', icon: <FaChartLine /> },
  { path: '/previsao', label: 'Projeção Mensal', icon: <FaCalendarAlt /> },
  { path: '/previsao/receitas-fixas', label: 'Receitas Fixas', icon: <FaArrowUp /> },
  { path: '/previsao/despesas-fixas', label: 'Despesas Fixas', icon: <FaArrowDown /> },
  { path: '/contas', label: 'Contas Bancárias', icon: <FaUniversity /> },
  { path: '/cartoes', label: 'Cartões de Crédito', icon: <FaCreditCard /> },
  { path: '/categorias', label: 'Categorias', icon: <FaTags /> },
  { path: '/perfil', label: 'Meu Perfil', icon: <FaUser /> },
];

const MenuPage: React.FC = () => {
  return (
    <div className="menu-page-container">
      <h2 className="menu-page-title">Menu</h2>
      <div className="menu-list">
        {menuItems.map((item, index) => (
          <Link to={item.path} key={index} className="menu-item-card">
            <div className="menu-item-icon">{item.icon}</div>
            <span className="menu-item-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;

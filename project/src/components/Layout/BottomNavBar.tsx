import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, FileText, Calendar, Menu, Plus } from 'lucide-react';
import './BottomNavBar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <Home size={24} /> },
  { path: '/extrato', label: 'Extrato', icon: <FileText size={24} /> },
  { path: '/new-transaction', label: 'Adicionar', icon: <Plus size={32} /> },
  { path: '/previsao', label: 'Previsão', icon: <Calendar size={24} /> },
  { path: '/menu', label: 'Menu', icon: <Menu size={24} /> },
];

const BottomNavBar: React.FC = () => {
  return (
    <nav className="bottom-nav-bar">
      {navItems.map((item) => {
        if (item.path === '/new-transaction') {
          return (
            <NavLink to={item.path} key={item.path} className="bottom-nav-item plus-button">
              <div className="plus-button-icon-wrapper">
                {item.icon}
              </div>
            </NavLink>
          );
        }
        return (
          <NavLink to={item.path} key={item.path} className={({ isActive }) => 
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }>
            {item.icon}
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
